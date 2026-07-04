import { getTranslations } from "next-intl/server";
import { ListSearch } from "@/components/list-search";
import { ListPagination } from "@/components/list-pagination";
import { UserAccountsTable } from "@/components/user-accounts/user-accounts-table";
import { UserAccountCreateButton } from "@/components/user-accounts/user-account-create-button";
import { PortalBreadcrumb } from "@/components/portal-breadcrumb";
import { listUserAccounts } from "@/lib/queries/user-accounts";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.q;

  const t = await getTranslations("nav");
  const { items, totalPages } = await listUserAccounts("student", { page, search });

  return (
    <div className="flex flex-col gap-4">
      <PortalBreadcrumb
        items={[{ label: t("dashboard"), href: "/admin" }, { label: t("students") }]}
      />
      <h1 className="text-xl font-semibold">{t("students")}</h1>

      <ListSearch className="sm:max-w-sm" />

      <UserAccountsTable role="student" items={items} />

      <ListPagination page={page} totalPages={totalPages} searchParams={params} />

      <UserAccountCreateButton role="student" />
    </div>
  );
}
