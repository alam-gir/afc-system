"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DeleteConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  itemDescription?: string;
  extraDescription?: string;
};

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemDescription,
  extraDescription,
}: DeleteConfirmDialogProps) {
  const t = useTranslations("deleteDialog");
  const tc = useTranslations("common");
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const confirmWord = t("confirmWord");
  const matches = value.trim() === confirmWord;

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setValue("");
  }

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      handleOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("description", { word: `“${confirmWord}”` })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {itemDescription ? (
          <p className="text-sm font-medium text-foreground">{itemDescription}</p>
        ) : null}
        {extraDescription ? (
          <p className="text-sm text-muted-foreground">{extraDescription}</p>
        ) : null}

        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t("inputPlaceholder")}
          autoFocus
        />

        <AlertDialogFooter>
          <AlertDialogCancel type="button">{tc("cancel")}</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={!matches || pending}
            onClick={handleConfirm}
          >
            {t("confirmButton")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
