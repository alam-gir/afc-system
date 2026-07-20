"use client";

import { ChevronRight, Clock, DoorOpen, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BatchInfoBadge } from "@/components/batches/batch-info-badge";
import { formatTimeDisplay } from "@/lib/format-time";

export type BatchRow = {
  id: string;
  name: string;
  levelName: string;
  classRoom: string;
  classTime: string;
  teacherName: string | null;
  startDate: string;
};

type BatchesTableProps = {
  items: BatchRow[];
};

export function BatchesTable({ items }: BatchesTableProps) {
  const t = useTranslations("batch");
  const router = useRouter();

  function openBatch(id: string) {
    router.push(`/admin/batches/${id}`);
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead className="hidden sm:table-cell">{t("level")}</TableHead>
            <TableHead className="hidden sm:table-cell">{t("classRoom")}</TableHead>
            <TableHead className="hidden lg:table-cell">{t("classTime")}</TableHead>
            <TableHead className="hidden md:table-cell">{t("teacher")}</TableHead>
            <TableHead className="hidden md:table-cell">{t("startDate")}</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((batch) => (
            <TableRow
              key={batch.id}
              role="button"
              tabIndex={0}
              onClick={() => openBatch(batch.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openBatch(batch.id);
                }
              }}
              className="cursor-pointer hover:bg-accent/50"
            >
              <TableCell className="font-medium">{batch.name}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <BatchInfoBadge icon={Layers}>{batch.levelName}</BatchInfoBadge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <BatchInfoBadge icon={DoorOpen}>{batch.classRoom}</BatchInfoBadge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <BatchInfoBadge icon={Clock}>{formatTimeDisplay(batch.classTime)}</BatchInfoBadge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {batch.teacherName ?? (
                  <span className="text-muted-foreground">{t("noTeacherAssigned")}</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">{batch.startDate}</TableCell>
              <TableCell>
                <ChevronRight className="size-4 text-muted-foreground" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
