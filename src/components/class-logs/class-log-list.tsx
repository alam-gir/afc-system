"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { FormDialog } from "@/components/form-dialog";
import { ClassLogForm } from "@/components/class-logs/class-log-form";
import { ClassLogView } from "@/components/class-logs/class-log-view";
import { deleteClassLog } from "@/lib/actions/class-logs";

export type ClassLogRow = {
  id: string;
  date: string;
  summary: string | null;
  chapter: string | null;
  lessons: string | null;
  pages: string | null;
  activities: string | null;
  learningObjectives: string | null;
  vocabulary: string | null;
  grammar: string | null;
  teacherName: string | null;
  substituteTeacherName: string | null;
  canEdit: boolean;
};

type ClassLogListProps = {
  batchId: string;
  items: ClassLogRow[];
  canDelete?: boolean;
};

export function ClassLogList({ batchId, items, canDelete }: ClassLogListProps) {
  const t = useTranslations("classLog");
  const tc = useTranslations("common");
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<ClassLogRow | null>(null);
  const [editTarget, setEditTarget] = useState<ClassLogRow | null>(null);
  const [viewTarget, setViewTarget] = useState<ClassLogRow | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteClassLog(deleteTarget.id);
    if (result.success) {
      toast.success(t("deleteSuccess"));
      router.refresh();
    } else {
      toast.error(tc("somethingWentWrong"));
    }
    setDeleteTarget(null);
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{tc("noResults")}</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {items.map((log) => {
          const previewKey = log.chapter ? "chapter" : log.lessons ? "lessons" : null;
          const preview = log.chapter || log.lessons;
          const showDelete = canDelete || log.canEdit;
          return (
            <Card
              key={log.id}
              role="button"
              tabIndex={0}
              onClick={() => setViewTarget(log)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setViewTarget(log);
                }
              }}
              className="cursor-pointer transition-colors hover:bg-accent/50"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{log.date}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("teacher")}: {log.teacherName ?? log.substituteTeacherName ?? "—"}
                  </p>
                  {preview ? (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {t(previewKey!)}: {preview}
                    </p>
                  ) : null}
                </div>
                {log.canEdit || showDelete ? (
                  <div
                    className="shrink-0"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={tc("actions")}
                        >
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {log.canEdit ? (
                          <DropdownMenuItem onSelect={() => setEditTarget(log)}>
                            <Pencil />
                            <span className="whitespace-nowrap">{t("edit")}</span>
                          </DropdownMenuItem>
                        ) : null}
                        {showDelete ? (
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeleteTarget(log)}
                          >
                            <Trash2 />
                            <span className="whitespace-nowrap">{tc("delete")}</span>
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : null}
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <FormDialog
        open={!!viewTarget}
        onOpenChange={(open) => !open && setViewTarget(null)}
        title={t("title")}
      >
        {viewTarget ? <ClassLogView log={viewTarget} /> : null}
      </FormDialog>

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title={t("editTitle")}
      >
        {editTarget ? (
          <ClassLogForm
            variant="edit"
            batchId={batchId}
            logId={editTarget.id}
            defaultValues={{
              date: editTarget.date,
              summary: editTarget.summary ?? "",
              chapter: editTarget.chapter ?? "",
              lessons: editTarget.lessons ?? "",
              pages: editTarget.pages ?? "",
              activities: editTarget.activities ?? "",
              learningObjectives: editTarget.learningObjectives ?? "",
              vocabulary: editTarget.vocabulary ?? "",
              grammar: editTarget.grammar ?? "",
            }}
            onCancel={() => setEditTarget(null)}
            onSuccess={() => {
              setEditTarget(null);
              router.refresh();
            }}
          />
        ) : null}
      </FormDialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemDescription={deleteTarget?.date}
        extraDescription={t("deleteConfirmDescription")}
      />
    </>
  );
}
