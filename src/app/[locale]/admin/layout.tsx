import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Home, BookOpen, Presentation, GraduationCap, CircleUserRound } from "lucide-react";
import { requireRole } from "@/lib/require-role";
import { PortalShell } from "@/components/portal-shell";
import { SettingsMenu } from "@/components/settings/settings-menu";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("admin");
  const t = await getTranslations();

  const nav = [
    { href: "/admin", label: t("nav.dashboard"), icon: <Home /> },
    { href: "/admin/batches", label: t("nav.batches"), icon: <BookOpen /> },
    { href: "/admin/teachers", label: t("nav.teachers"), icon: <Presentation /> },
    { href: "/admin/students", label: t("nav.students"), icon: <GraduationCap /> },
    { href: "/admin/profile", label: t("nav.profile"), icon: <CircleUserRound /> },
  ];

  return (
    <PortalShell
      appName={t("common.appName")}
      userName={user.name ?? ""}
      nav={nav}
      headerExtra={<SettingsMenu />}
    >
      {children}
    </PortalShell>
  );
}
