import { getTranslations } from "next-intl/server";
import { BookOpen, Presentation, GraduationCap, Activity, CircleUserRound } from "lucide-react";
import { requireRole } from "@/lib/require-role";
import { getAdminDashboardStats } from "@/lib/queries/dashboard";
import { StatTile } from "@/components/dashboard/stat-tile";
import { QuickLinkCard } from "@/components/dashboard/quick-link-card";

export default async function AdminDashboardPage() {
  const user = await requireRole("admin");
  const t = await getTranslations("dashboard");
  const tn = await getTranslations("nav");

  const stats = await getAdminDashboardStats();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={BookOpen} label={t("totalBatches")} value={stats.totalBatches} />
        <StatTile icon={Presentation} label={t("totalTeachers")} value={stats.totalTeachers} />
        <StatTile icon={GraduationCap} label={t("totalStudents")} value={stats.totalStudents} />
        <StatTile icon={Activity} label={t("activeBatches")} value={stats.activeBatches} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t("quickLinks")}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickLinkCard
            href="/admin/batches"
            icon={BookOpen}
            label={tn("batches")}
            description={t("manageBatchesDesc")}
          />
          <QuickLinkCard
            href="/admin/teachers"
            icon={Presentation}
            label={tn("teachers")}
            description={t("manageTeachersDesc")}
          />
          <QuickLinkCard
            href="/admin/students"
            icon={GraduationCap}
            label={tn("students")}
            description={t("manageStudentsDesc")}
          />
          <QuickLinkCard
            href="/admin/profile"
            icon={CircleUserRound}
            label={tn("profile")}
            description={t("manageProfileDesc")}
          />
        </div>
      </div>
    </div>
  );
}
