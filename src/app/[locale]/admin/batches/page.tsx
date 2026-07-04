import { getTranslations } from "next-intl/server";
import { DoorOpen, Clock, Layers } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListSearch } from "@/components/list-search";
import { ListPagination } from "@/components/list-pagination";
import { BatchCreateButton } from "@/components/batches/batch-create-button";
import { BatchInfoBadge } from "@/components/batches/batch-info-badge";
import { PortalBreadcrumb } from "@/components/portal-breadcrumb";
import { listBatches } from "@/lib/queries/batches";
import { listBatchLevels } from "@/lib/queries/batch-levels";
import { formatTimeDisplay } from "@/lib/format-time";

export default async function BatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.q;

  const t = await getTranslations("batch");
  const tc = await getTranslations("common");
  const tn = await getTranslations("nav");
  const { items, totalPages } = await listBatches({ page, search });
  const levels = await listBatchLevels();

  return (
    <div className="flex flex-col gap-4">
      <PortalBreadcrumb
        items={[{ label: tn("dashboard"), href: "/admin" }, { label: tn("batches") }]}
      />
      <h1 className="text-xl font-semibold">{t("titlePlural")}</h1>

      <ListSearch className="sm:max-w-sm" />

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tc("noResults")}</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("level")}</TableHead>
                <TableHead className="hidden sm:table-cell">{t("classRoom")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("classTime")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("teacher")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("startDate")}</TableHead>
                <TableHead className="text-right">{tc("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <BatchInfoBadge icon={Layers}>{batch.levelName}</BatchInfoBadge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <BatchInfoBadge icon={DoorOpen}>{batch.classRoom}</BatchInfoBadge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <BatchInfoBadge icon={Clock}>{formatTimeDisplay(batch.classTime)}</BatchInfoBadge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {batch.teacherName ?? (
                      <span className="text-muted-foreground">{t("noTeacherAssigned")}</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{batch.startDate}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/batches/${batch.id}`}>{tc("view")}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ListPagination page={page} totalPages={totalPages} searchParams={params} />

      <BatchCreateButton initialLevels={levels} />
    </div>
  );
}
