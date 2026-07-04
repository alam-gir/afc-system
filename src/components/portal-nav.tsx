"use client";

import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type PortalNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

export function isNavItemActive(pathname: string, href: string) {
  if (pathname === href) return true;
  // Root portal paths (e.g. "/admin") must match exactly - otherwise every
  // sub-route would also light up the dashboard item since it's a prefix of all of them.
  const segments = href.split("/").filter(Boolean);
  if (segments.length <= 1) return false;
  return pathname.startsWith(`${href}/`);
}

export function PortalBottomNav({ items }: { items: PortalNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className="[&>svg]:size-5">{item.icon}</span>
            <span className="truncate px-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
