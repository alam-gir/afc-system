import type { ReactNode } from "react";
import Image from "next/image";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { PortalBottomNav, type PortalNavItem } from "@/components/portal-nav";
import { PortalSidebar } from "@/components/portal-sidebar";
import { SiteFooter } from "@/components/site-footer";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

type PortalShellProps = {
  appName: string;
  userName: string;
  nav: PortalNavItem[];
  headerExtra?: ReactNode;
  children: ReactNode;
};

export function PortalShell({
  appName,
  userName,
  nav,
  headerExtra,
  children,
}: PortalShellProps) {
  return (
    <SidebarProvider>
      <PortalSidebar appName={appName} items={nav} />
      <SidebarInset>
        <div className="flex min-h-svh flex-col">
          <header className="flex items-center justify-between gap-4 border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:flex" />
              <Image src="/logo.png" alt="" width={24} height={24} className="rounded-md" />
              <span className="text-sm font-semibold">{appName}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="hidden text-sm text-muted-foreground sm:inline">{userName}</span>
              {headerExtra}
              <LocaleSwitcher />
              <ThemeToggle />
              <LogoutButton />
            </div>
          </header>

          <main className="flex-1 p-4 pb-4">{children}</main>

          <SiteFooter />

          <PortalBottomNav items={nav} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
