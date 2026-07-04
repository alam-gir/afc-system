import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";

type QuickLinkCardProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  description?: string;
};

export function QuickLinkCard({ href, icon: Icon, label, description }: QuickLinkCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/50"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </Link>
  );
}
