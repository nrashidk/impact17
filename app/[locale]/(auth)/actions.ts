"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { signIn, isAdult } from "@/lib/auth";

const usernameRegex = /^[a-zA-Z0-9-]+$/;

const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    name: z.string().min(1).max(80),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "invalidDob")
      .transform((s) => new Date(s + "T00:00:00.000Z")),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

export type SignUpState = {
  error?:
    | "tooYoung"
    | "emailTaken"
    | "passwordMismatch"
    | "passwordTooShort"
    | "invalidEmail"
    | "invalidDob"
    | "missingField";
};

export async function signUpAction(
  _prev: SignUpState | undefined,
  formData: FormData,
): Promise<SignUpState> {
  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue.message === "passwordMismatch") return { error: "passwordMismatch" };
    if (issue.message === "invalidDob") return { error: "invalidDob" };
    if (issue.path[0] === "password") return { error: "passwordTooShort" };
    if (issue.path[0] === "email") return { error: "invalidEmail" };
    return { error: "missingField" };
  }

  if (!isAdult(parsed.data.dateOfBirth)) {
    return { error: "tooYoung" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        name: parsed.data.name,
        username: null,
        dateOfBirth: parsed.data.dateOfBirth,
        passwordHash,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const target = (e.meta?.target as string[] | undefined) ?? [];
      if (target.includes("email")) return { error: "emailTaken" };
    }
    throw e;
  }

  // After sign-in the proxy will detect username == null and redirect the user
  // to /signup/complete to pick one.
  await signIn("credentials", {
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    redirectTo: "/",
  });

  return {};
}

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignInState = { error?: "invalidCredentials" };

export async function signInAction(
  _prev: SignInState | undefined,
  formData: FormData,
): Promise<SignInState> {
  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) return { error: "invalidCredentials" };

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/",
    });
    return {};
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "invalidCredentials" };
    }
    throw e;
  }
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction() {
  const { signOut } = await import("@/lib/auth");
  await signOut({ redirectTo: "/" });
}

// Slugifies a display name to a candidate username and finds the first free
// variant by appending a numeric suffix when collisions exist.
export async function suggestUsername(name: string | null | undefined): Promise<string> {
  let base = (name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
  if (base.length < 3) base = "user";
  let candidate = base;
  let suffix = 1;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    suffix += 1;
    const tail = `-${suffix}`;
    candidate = `${base.slice(0, 20 - tail.length)}${tail}`;
  }
  return candidate;
}

const completeProfileFullSchema = z.object({
  username: z.string().min(3).max(20).regex(usernameRegex),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "invalidDob")
    .transform((s) => new Date(s + "T00:00:00.000Z")),
});

const completeProfileUsernameOnlySchema = z.object({
  username: z.string().min(3).max(20).regex(usernameRegex),
});

export type CompleteProfileState = {
  error?: "tooYoung" | "usernameTaken" | "usernameFormat" | "invalidDob" | "notSignedIn";
};

export async function completeProfileAction(
  _prev: CompleteProfileState | undefined,
  formData: FormData,
): Promise<CompleteProfileState> {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) return { error: "notSignedIn" };

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { dateOfBirth: true, username: true },
  });
  if (!dbUser) return { error: "notSignedIn" };

  const needsDob = !dbUser.dateOfBirth;

  if (needsDob) {
    const parsed = completeProfileFullSchema.safeParse({
      username: String(formData.get("username") ?? "").trim(),
      dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      if (issue.message === "invalidDob") return { error: "invalidDob" };
      if (issue.path[0] === "username") return { error: "usernameFormat" };
      return { error: "invalidDob" };
    }
    if (!isAdult(parsed.data.dateOfBirth)) {
      await prisma.user.delete({ where: { id: session.user.id } });
      await (await import("@/lib/auth")).signOut({ redirect: false });
      return { error: "tooYoung" };
    }
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          username: parsed.data.username,
          dateOfBirth: parsed.data.dateOfBirth,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { error: "usernameTaken" };
      }
      throw e;
    }
  } else {
    const parsed = completeProfileUsernameOnlySchema.safeParse({
      username: String(formData.get("username") ?? "").trim(),
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      if (issue.path[0] === "username") return { error: "usernameFormat" };
      return { error: "usernameFormat" };
    }
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { username: parsed.data.username },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { error: "usernameTaken" };
      }
      throw e;
    }
  }

  const { redirect } = await import("next/navigation");
  redirect("/");
  return {};
}
