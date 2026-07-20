import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CalendarDays, Hash, Timer, DoorOpen, Clock, Layers } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BatchInfoBadge } from "@/components/batches/batch-info-badge";
import { BatchTeacherSection } from "@/components/batches/batch-teacher-section";
import { BatchStudentsSection } from "@/components/batches/batch-students-section";
import { BatchActionsMenu } from "@/components/batches/batch-actions-menu";
import { BatchDocumentsSection } from "@/components/batches/batch-documents-section";
import { getBatchWithTeacher, listEnrolledStudents } from "@/lib/queries/batches";
import { listBatchDocuments } from "@/lib/queries/batch-documents";
import { listBatchLevels } from "@/lib/queries/batch-levels";
import { isUuid } from "@/lib/is-uuid";
import { formatTimeDisplay } from "@/lib/format-time";
import { PortalBreadcrumb } from "@/components/portal-breadcrumb";

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const t = await getTranslations("batch");
  const tc = await getTranslations("common");
  const tn = await getTranslations("nav");

  const row = await getBatchWithTeacher(id);
  if (!row) notFound();
  const { batch, teacher, levelName } = row;
  const students = await listEnrolledStudents(id);
  const levels = await listBatchLevels();
  const documents = await listBatchDocuments(id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <PortalBreadcrumb
        items={[
          { label: tn("dashboard"), href: "/admin" },
          { label: tn("batches"), href: "/admin/batches" },
          { label: batch.name },
        ]}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <h1 className="min-w-0 truncate text-xl font-semibold">{batch.name}</h1>
          <BatchActionsMenu
            id={batch.id}
            name={batch.name}
            initialLevels={levels}
            defaultValues={{
              name: batch.name,
              startDate: batch.startDate,
              endDate: batch.endDate,
              totalClasses: batch.totalClasses,
              durationPerClassHours: batch.durationPerClassHours,
              levelId: batch.levelId,
              method: batch.method,
              classRoom: batch.classRoom,
              classTime: batch.classTime,
              description: batch.description ?? "",
            }}
          />
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <BatchInfoBadge icon={Layers}>{levelName}</BatchInfoBadge>
          <Badge variant="outline">{t(`methods.${batch.method}`)}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-md border p-3 text-sm sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-4" />
            {t("startDate")}
          </p>
          <p>{batch.startDate}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-4" />
            {t("endDate")}
          </p>
          <p>{batch.endDate}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Hash className="size-4" />
            {t("totalClasses")}
          </p>
          <p>{batch.totalClasses}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Timer className="size-4" />
            {t("durationPerClassHours")}
          </p>
          <p>{batch.durationPerClassHours}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <DoorOpen className="size-4" />
            {t("classRoom")}
          </p>
          <p>{batch.classRoom}</p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-4" />
            {t("classTime")}
          </p>
          <p>{formatTimeDisplay(batch.classTime)}</p>
        </div>
      </div>

      {batch.description ? (
        <p className="rounded-md border p-3 text-sm text-muted-foreground">{batch.description}</p>
      ) : null}

      <BatchTeacherSection batchId={batch.id} teacher={teacher?.id ? { id: teacher.id, name: teacher.name, loginId: teacher.loginId } : null} />

      <BatchDocumentsSection
        batchId={batch.id}
        documents={documents}
        types={["course_plan", "calendar"]}
        editable
      />

      <BatchStudentsSection batchId={batch.id} students={students} />

      <div className="rounded-md border p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">{t("classLogsHeading")}</p>
          <Button asChild size="sm">
            <Link href={`/admin/batches/${batch.id}/logs`}>{tc("view")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
