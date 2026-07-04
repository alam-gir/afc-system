import { auth } from "@/auth";
import type { UserRole } from "@/types/next-auth";

/** Server-action-side authorization guard. Throws (rather than redirecting) since actions are called via fetch, not navigation. */
export async function assertRole(role: UserRole) {
  const session = await auth();
  if (!session || session.user.role !== role) {
    throw new Error("Forbidden");
  }
  return session.user;
}
