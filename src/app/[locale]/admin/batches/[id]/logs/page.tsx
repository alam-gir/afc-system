import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ClassLogFilters } from "@/components/class-logs/class-log-filters";
import { ClassLogList, type ClassLogRow } from "@/components/class-logs/class-log-list";
import { ClassLogCreateButton } from "@/components/class-logs/class-log-create-button";
import { ListPagination } from "@/components/list-pagination";
import { getBatchWithTeacher } from "@/lib/queries/batches";
import { listClassLogs } from "@/lib/queries/class-logs";
import { isUuid } from "@/lib/is-uuid";
import { PortalBreadcrumb } from "@/components/portal-breadcrumb";

export default async function AdminBatchClassLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const tcl = await getTranslations("classLog");
  const tn = await getTranslations("nav");

  const row = await getBatchWithTeacher(id);
  if (!row) notFound();

  const { items, totalPages } = await listClassLogs(id, {
    page,
    search: sp.q,
    dateFrom: sp.from,
    dateTo: sp.to,
  });

  const rows: ClassLogRow[] = items.map((log) => ({ ...log, canEdit: true }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <PortalBreadcrumb
        items={[
          { label: tn("dashboard"), href: "/admin" },
          { label: tn("batches"), href: "/admin/batches" },
          { label: row.batch.name, href: `/admin/batches/${id}` },
          { label: tcl("titlePlural") },
        ]}
      />
      <div className="min-w-0">
        <h1 className="text-xl font-semibold">{row.batch.name}</h1>
        <p className="text-sm text-muted-foreground">{tcl("titlePlural")}</p>
      </div>

      <ClassLogFilters />

      <ClassLogList batchId={id} items={rows} canDelete />

      <ListPagination page={page} totalPages={totalPages} searchParams={sp} />

      <ClassLogCreateButton
        variant="admin-create"
        batchId={id}
        teacherNameDefault={row.teacher?.name ?? ""}
        label={tcl("addNew")}
        floating
      />
    </div>
  );
}
