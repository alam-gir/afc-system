"use client";

import { useState } from "react";
import { MoreVertical, UserPlus, UserMinus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { assignTeacher } from "@/lib/actions/batches";
import { useRouter } from "@/i18n/navigation";

type BatchTeacherSectionProps = {
  batchId: string;
  teacher: { id: string; name: string; loginId: string } | null;
};

export function BatchTeacherSection({ batchId, teacher }: BatchTeacherSectionProps) {
  const t = useTranslations("batch");
  const tc = useTranslations("common");
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  async function handleRemove() {
    await assignTeacher(batchId, null);
    router.refresh();
    setRemoveOpen(false);
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border p-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{t("teacher")}</p>
        {teacher ? (
          <p className="truncate text-sm font-medium">
            {teacher.name} ({teacher.loginId})
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{t("noTeacherAssigned")}</p>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={tc("actions")}>
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={() => setPickerOpen(true)}>
            <UserPlus />
            <span className="whitespace-nowrap">{t("assignTeacher")}</span>
          </DropdownMenuItem>
          {teacher ? (
            <DropdownMenuItem variant="destructive" onSelect={() => setRemoveOpen(true)}>
              <UserMinus />
              <span className="whitespace-nowrap">{t("removeTeacher")}</span>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <UserPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        role="teacher"
        title={t("assignTeacher")}
        onSelect={async (user) => {
          const result = await assignTeacher(batchId, user.id);
          if (result.success) {
            router.refresh();
          } else {
            toast.error(tc("somethingWentWrong"));
          }
        }}
      />

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeTeacher")}</AlertDialogTitle>
            <AlertDialogDescription>{t("removeTeacherConfirm")}</AlertDialogDescription>
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
