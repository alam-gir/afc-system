import { getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import type { UserRole } from "@/types/next-auth";

export async function requireRole(role: UserRole) {
  const session = await auth();
  const locale = await getLocale();

  if (!session || session.user.role !== role) {
    redirect({ href: "/login", locale });
  }

  return session!.user;
}
