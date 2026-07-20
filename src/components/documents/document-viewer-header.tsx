"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function DocumentViewerHeader({
  appName,
  title,
  backLabel,
}: {
  appName: string;
  title: string;
  backLabel: string;
}) {
  const router = useRouter();

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b bg-background px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Image src="/logo.png" alt="" width={24} height={24} className="rounded-md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{appName}</p>
          <p className="truncate text-xs text-muted-foreground">{title}</p>
        </div>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft />
        {backLabel}
      </Button>
    </header>
  );
}
