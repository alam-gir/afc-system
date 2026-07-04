import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/require-role";
import { PortalShell } from "@/components/portal-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("admin");
  const t = await getTranslations();

  const nav = [
    { href: "/admin", label: t("nav.dashboard") },
    { href: "/admin/batches", label: t("nav.batches") },
    { href: "/admin/teachers", label: t("nav.teachers") },
    { href: "/admin/students", label: t("nav.students") },
    { href: "/admin/profile", label: t("nav.profile") },
  ];

  return (
    <PortalShell appName={t("common.appName")} userName={user.name ?? ""} nav={nav}>
      {children}
    </PortalShell>
  );
}
