"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormDialog } from "@/components/form-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { BatchForm } from "@/components/batches/batch-form";
import { deleteBatch } from "@/lib/actions/batches";
import type { BatchInput } from "@/lib/validations/batch";
import type { LevelOption } from "@/components/batches/level-combobox";

type BatchActionsMenuProps = {
  id: string;
  name: string;
  defaultValues: BatchInput;
  initialLevels: LevelOption[];
};

export function BatchActionsMenu({
  id,
  name,
  defaultValues,
  initialLevels,
}: BatchActionsMenuProps) {
  const t = useTranslations("batch");
  const tc = useTranslations("common");
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    const result = await deleteBatch(id);
    if (result.success) {
      toast.success(t("deleteSuccess"));
      router.push("/admin/batches");
      router.refresh();
    } else {
      toast.error(tc("somethingWentWrong"));
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={tc("actions")}>
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil />
            <span className="whitespace-nowrap">{tc("edit")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2 />
            <span className="whitespace-nowrap">{tc("delete")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FormDialog open={editOpen} onOpenChange={setEditOpen} title={t("editTitle")}>
        <BatchForm
          mode="edit"
          id={id}
          defaultValues={defaultValues}
          initialLevels={initialLevels}
          onCancel={() => setEditOpen(false)}
          onSuccess={() => {
            setEditOpen(false);
            router.refresh();
          }}
        />
      </FormDialog>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        itemDescription={name}
        extraDescription={t("deleteConfirmDescription")}
      />
    </>
  );
}
