import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";

type PortalShellProps = {
  appName: string;
  userName: string;
  nav: { href: string; label: string }[];
  children: ReactNode;
};

export function PortalShell({ appName, userName, nav, children }: PortalShellProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold">{appName}</span>
          <nav className="hidden items-center gap-4 sm:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <span className="hidden text-sm text-muted-foreground sm:inline">{userName}</span>
          <LocaleSwitcher />
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <nav className="flex items-center gap-4 overflow-x-auto border-b px-4 py-2 sm:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
