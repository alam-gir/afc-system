import { getTranslations } from "next-intl/server";
import { ListSearch } from "@/components/list-search";
import { ListPagination } from "@/components/list-pagination";
import { BatchCreateButton } from "@/components/batches/batch-create-button";
import { BatchesTable } from "@/components/batches/batches-table";
import { PortalBreadcrumb } from "@/components/portal-breadcrumb";
import { listBatches } from "@/lib/queries/batches";
import { listBatchLevels } from "@/lib/queries/batch-levels";

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
        <BatchesTable items={items} />
      )}

      <ListPagination page={page} totalPages={totalPages} searchParams={params} />

      <BatchCreateButton initialLevels={levels} />
    </div>
  );
}
