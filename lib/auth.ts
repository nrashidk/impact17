// NextAuth v5 (Auth.js) configuration.
// - Credentials provider (email + password, bcrypt-hashed)
// - Google OAuth provider
// - JWT session strategy (required for Credentials)
// - Prisma adapter for user/account persistence
// - signIn callback enforces the 18+ age gate on every sign-in for accounts
//   that already have dateOfBirth set. Google first-sign-in users (no DOB
//   yet) are allowed through and redirected to /[locale]/signup/complete by
//   the proxy.

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string | null;
      dateOfBirth: Date | null;
    } & DefaultSession["user"];
  }
  interface User {
    username?: string | null;
    dateOfBirth?: Date | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    username?: string | null;
    dateOfBirth?: string | null;
  }
}

export function isAdult(dob: Date, now: Date = new Date()): boolean {
  const age = now.getFullYear() - dob.getFullYear();
  const before =
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  return (before ? age - 1 : age) >= 18;
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  // Derive the base URL from the incoming request host (X-Forwarded-Host on
  // Vercel) instead of a pinned env var, so a preview deployment keeps users
  // on its own preview domain after auth instead of bouncing to production.
  // (Auth.js still honours AUTH_URL/NEXTAUTH_URL if set, so that env var must
  // be scoped to the Production environment only — see PR notes.)
  trustHost: true,
  pages: {
    signIn: "/signin",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          dateOfBirth: user.dateOfBirth,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    // Keep post-auth redirects on the originating deployment. `baseUrl` is
    // derived from the request (trustHost) when AUTH_URL/NEXTAUTH_URL is not
    // pinned, so relative/same-origin targets stay on the preview or prod
    // domain the user is actually on; anything off-origin falls back to the
    // request's own base URL rather than a hardcoded host.
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // fall through
      }
      return baseUrl;
    },
    async signIn({ user }) {
      if (!user.id) return true;
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { dateOfBirth: true },
      });
      if (!dbUser) return true;
      if (dbUser.dateOfBirth && !isAdult(dbUser.dateOfBirth)) {
        return false;
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.id = user.id;
      }
      if (trigger === "signIn" || trigger === "update" || !token.username) {
        if (token.id) {
          const fresh = await prisma.user.findUnique({
            where: { id: token.id },
            select: { username: true, dateOfBirth: true },
          });
          token.username = fresh?.username ?? null;
          token.dateOfBirth = fresh?.dateOfBirth?.toISOString() ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id;
      session.user.username = token.username ?? null;
      session.user.dateOfBirth = token.dateOfBirth ? new Date(token.dateOfBirth) : null;
      return session;
    },
  },
});
