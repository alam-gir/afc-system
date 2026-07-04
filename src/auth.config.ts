import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/types/next-auth";

/**
 * Edge-safe base config (no DB/argon2 imports) so it can be shared with
 * middleware, which must not bundle Node-only dependencies.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.loginId = user.loginId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as UserRole;
      session.user.loginId = token.loginId as string;
      return session;
    },
  },
};
