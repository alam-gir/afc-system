import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Home, CircleUserRound } from "lucide-react";
import { requireRole } from "@/lib/require-role";
import { PortalShell } from "@/components/portal-shell";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("teacher");
  const t = await getTranslations();

  const nav = [
    { href: "/teacher", label: t("nav.dashboard"), icon: <Home /> },
    { href: "/teacher/profile", label: t("nav.profile"), icon: <CircleUserRound /> },
  ];

  return (
    <PortalShell appName={t("common.appName")} userName={user.name ?? ""} nav={nav}>
      {children}
    </PortalShell>
  );
}
