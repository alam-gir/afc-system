import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DoorOpen, Clock, Layers } from "lucide-react";
import { BatchInfoBadge } from "@/components/batches/batch-info-badge";
import { ClassLogFilters } from "@/components/class-logs/class-log-filters";
import { ClassLogList, type ClassLogRow } from "@/components/class-logs/class-log-list";
import { ClassLogCreateButton } from "@/components/class-logs/class-log-create-button";
import { ListPagination } from "@/components/list-pagination";
import { requireRole } from "@/lib/require-role";
import { getBatchWithTeacher } from "@/lib/queries/batches";
import { listClassLogs } from "@/lib/queries/class-logs";
import { isWithinClassLogEditWindow } from "@/lib/class-log-edit-window";
import { isUuid } from "@/lib/is-uuid";
import { formatTimeDisplay } from "@/lib/format-time";
import { PortalBreadcrumb } from "@/components/portal-breadcrumb";

export default async function TeacherBatchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireRole("teacher");
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const tcl = await getTranslations("classLog");
  const tn = await getTranslations("nav");

  const row = await getBatchWithTeacher(id);
  if (!row || row.batch.teacherId !== user.id) notFound();

  const { items, totalPages } = await listClassLogs(id, {
    page,
    search: sp.q,
    dateFrom: sp.from,
    dateTo: sp.to,
  });

  const rows: ClassLogRow[] = items.map((log) => ({
    ...log,
    canEdit: log.createdByUserId === user.id && isWithinClassLogEditWindow(log.createdAt),
  }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <PortalBreadcrumb
        items={[{ label: tn("dashboard"), href: "/teacher" }, { label: row.batch.name }]}
      />
      <div>
        <h1 className="text-xl font-semibold">{row.batch.name}</h1>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <BatchInfoBadge icon={Layers}>{row.levelName}</BatchInfoBadge>
          <BatchInfoBadge icon={DoorOpen}>{row.batch.classRoom}</BatchInfoBadge>
          <BatchInfoBadge icon={Clock}>{formatTimeDisplay(row.batch.classTime)}</BatchInfoBadge>
        </div>
      </div>

      <p className="text-sm font-medium">{tcl("titlePlural")}</p>

      <ClassLogFilters />

      <ClassLogList batchId={id} items={rows} />

      <ListPagination page={page} totalPages={totalPages} searchParams={sp} />

      <ClassLogCreateButton
        variant="teacher-create"
        batchId={id}
        label={tcl("addToday")}
        floating
      />
    </div>
  );
}
