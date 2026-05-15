import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "./lib/auth";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

export default auth((req) => {
  const path = req.nextUrl.pathname;

  // If signed in but profile incomplete (no DOB or no username — the state
  // right after a first Google OAuth sign-in), force /signup/complete.
  if (req.auth?.user) {
    const u = req.auth.user;
    const needsCompletion = !u.dateOfBirth || !u.username;
    const onCompletePath = path.endsWith("/signup/complete");
    if (needsCompletion && !onCompletePath) {
      const segs = path.split("/");
      const candidate = segs[1];
      const locale = (routing.locales as readonly string[]).includes(candidate)
        ? candidate
        : routing.defaultLocale;
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/signup/complete`;
      return NextResponse.redirect(url);
    }
  }

  return intl(req as unknown as NextRequest);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
