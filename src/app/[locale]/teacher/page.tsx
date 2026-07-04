import { getTranslations } from "next-intl/server";
import { DoorOpen, Layers } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchInfoBadge } from "@/components/batches/batch-info-badge";
import { requireRole } from "@/lib/require-role";
import { listTeacherBatches } from "@/lib/queries/batches";

export default async function TeacherDashboardPage() {
  const user = await requireRole("teacher");
  const t = await getTranslations("batch");
  const tc = await getTranslations("common");

  const items = await listTeacherBatches(user.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <h1 className="text-xl font-semibold">{t("titlePlural")}</h1>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tc("noResults")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((batch) => (
            <Link key={batch.id} href={`/teacher/batches/${batch.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardHeader>
                  <CardTitle className="text-base">{batch.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  <BatchInfoBadge icon={Layers}>{batch.levelName}</BatchInfoBadge>
                  <BatchInfoBadge icon={DoorOpen}>{batch.classRoom}</BatchInfoBadge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
