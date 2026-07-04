"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { ListSearch } from "@/components/list-search";

export function ClassLogFilters() {
  const t = useTranslations("classLog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateDateParam(key: "from" | "to", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="w-full sm:flex-1 sm:min-w-48">
        <ListSearch />
      </div>
      <div className="flex flex-1 flex-col gap-1 sm:flex-none">
        <label htmlFor="dateFrom" className="text-xs text-muted-foreground">
          {t("filterDateFrom")}
        </label>
        <Input
          id="dateFrom"
          type="date"
          defaultValue={searchParams.get("from") ?? ""}
          onChange={(event) => updateDateParam("from", event.target.value)}
          className="w-full sm:w-auto"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 sm:flex-none">
        <label htmlFor="dateTo" className="text-xs text-muted-foreground">
          {t("filterDateTo")}
        </label>
        <Input
          id="dateTo"
          type="date"
          defaultValue={searchParams.get("to") ?? ""}
          onChange={(event) => updateDateParam("to", event.target.value)}
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
}
