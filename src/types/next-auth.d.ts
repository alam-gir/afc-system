export type UserRole = "admin" | "teacher" | "student";

declare module "next-auth" {
  interface User {
    role: UserRole;
    loginId: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      loginId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    loginId: string;
  }
}
