import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/types/next-auth";

/**
 * Edge-safe base config (no DB/argon2 imports) so it can be shared with
 * middleware, which must not bundle Node-only dependencies.
 */
export const authConfig: NextAuthConfig = {
  // AUTH_TRUST_HOST doesn't reliably reach this config's middleware/edge
  // instance in self-hosted deployments, so set it directly here too.
  trustHost: true,
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
