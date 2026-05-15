// NextAuth v5 (Auth.js) scaffold. No providers wired yet — see Phase 2.
import NextAuth from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [],
});
