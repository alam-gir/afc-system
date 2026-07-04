import { getTranslations } from "next-intl/server";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type ListPaginationProps = {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

function hrefForPage(searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") params.set(key, value);
  }
  params.set("page", String(page));
  return `?${params.toString()}`;
}

export async function ListPagination({ page, totalPages, searchParams }: ListPaginationProps) {
  const t = await getTranslations("common");

  if (totalPages <= 1) return null;

  return (
    <Pagination className="justify-between">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text={t("previous")}
            href={page > 1 ? hrefForPage(searchParams, page - 1) : undefined}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>

      <span className="flex items-center px-2 text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>

      <PaginationContent>
        <PaginationItem>
          <PaginationNext
            text={t("next")}
            href={page < totalPages ? hrefForPage(searchParams, page + 1) : undefined}
            aria-disabled={page >= totalPages}
            className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
