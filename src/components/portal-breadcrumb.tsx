import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemEl,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/navigation";

export type PortalBreadcrumbItem = {
  label: string;
  href?: string;
};

/**
 * Rendered by each page (not the shared shell) so the trail is present in the
 * initial server-rendered HTML - no client-side flash/layout-shift.
 */
export function PortalBreadcrumb({ items }: { items: PortalBreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-1">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isCollapsedOnMobile = items.length > 2 && index > 0 && index < items.length - 2;

            return (
              <Fragment key={`${item.label}-${index}`}>
                <BreadcrumbItemEl
                  className={isCollapsedOnMobile ? "hidden sm:inline-flex" : undefined}
                >
                  {isLast || !item.href ? (
                    <BreadcrumbPage className="inline-block max-w-40 truncate align-bottom sm:max-w-60">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.href}
                        className="inline-block max-w-40 truncate align-bottom sm:max-w-60"
                      >
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItemEl>
                {!isLast ? (
                  <BreadcrumbSeparator
                    className={isCollapsedOnMobile ? "hidden sm:flex" : undefined}
                  />
                ) : null}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
