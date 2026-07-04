import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type BatchInfoBadgeProps = {
  icon: LucideIcon;
  children: ReactNode;
};

export function BatchInfoBadge({ icon: Icon, children }: BatchInfoBadgeProps) {
  return (
    <Badge variant="outline">
      <Icon data-icon="inline-start" className="size-3.5" />
      {children}
    </Badge>
  );
}
