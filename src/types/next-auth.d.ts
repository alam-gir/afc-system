import type { DefaultSession } from "next-auth";

export type UserRole = "admin" | "teacher" | "student";

declare module "next-auth" {
  interface User {
    role: UserRole;
    loginId: string;
  }

  interface Session {
    user: {
      role: UserRole;
      loginId: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    loginId: string;
  }
}
