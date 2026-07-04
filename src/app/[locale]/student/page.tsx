import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/require-role";

export default async function StudentDashboardPage() {
  const user = await requireRole("student");
  const t = await getTranslations("nav");

  return (
    <div>
      <h1 className="text-xl font-semibold">{t("dashboard")}</h1>
      <p className="mt-2 text-muted-foreground">{user.name}</p>
    </div>
  );
}
