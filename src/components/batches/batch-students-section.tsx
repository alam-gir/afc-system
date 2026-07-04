"use client";

import { useState } from "react";
import { MoreVertical, UserMinus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPickerDialog } from "@/components/user-picker-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { addStudentToBatch, removeStudentFromBatch } from "@/lib/actions/batches";
import { useRouter } from "@/i18n/navigation";

type Student = { id: string; loginId: string; name: string; email: string };

type BatchStudentsSectionProps = {
  batchId: string;
  students: Student[];
};

export function BatchStudentsSection({ batchId, students }: BatchStudentsSectionProps) {
  const t = useTranslations("batch");
  const tc = useTranslations("common");
  const tp = useTranslations("profile");
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Student | null>(null);

  async function handleRemove() {
    if (!removeTarget) return;
    await removeStudentFromBatch(batchId, removeTarget.id);
    router.refresh();
    setRemoveTarget(null);
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{t("students")}</p>
        <Button type="button" size="sm" onClick={() => setPickerOpen(true)}>
          {t("addStudent")}
        </Button>
      </div>

      {students.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tc("noResults")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((student) => (
            <Card key={student.id}>
              <CardHeader className="gap-1">
                <p className="truncate text-sm font-semibold">{student.name}</p>
                <p className="text-xs text-muted-foreground">
                  {tp("loginId")}: {student.loginId}
                </p>
                {student.email ? (
                  <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                ) : null}
                <CardAction>
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
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setRemoveTarget(student)}
                      >
                        <UserMinus />
                        <span className="whitespace-nowrap">{t("removeStudent")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <UserPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        role="student"
        title={t("addStudent")}
        excludeBatchId={batchId}
        onSelect={async (user) => {
          const result = await addStudentToBatch(batchId, user.id);
          if (result.success) {
            router.refresh();
          } else {
            toast.error(tc("somethingWentWrong"));
          }
        }}
      />

      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeStudent")}</AlertDialogTitle>
            <AlertDialogDescription>{t("removeStudentConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove}>{tc("yes")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
