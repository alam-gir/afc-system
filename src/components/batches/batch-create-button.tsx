"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { BatchForm } from "@/components/batches/batch-form";
import type { LevelOption } from "@/components/batches/level-combobox";

export function BatchCreateButton({ initialLevels }: { initialLevels: LevelOption[] }) {
  const t = useTranslations("batch");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        aria-label={t("addNew")}
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 size-14 rounded-full shadow-lg md:bottom-6"
      >
        <Plus className="size-6" />
      </Button>
      <FormDialog open={open} onOpenChange={setOpen} title={t("addNew")}>
        <BatchForm
          mode="create"
          initialLevels={initialLevels}
          onCancel={() => setOpen(false)}
          onSuccess={(createdId) => {
            setOpen(false);
            if (createdId) router.push(`/admin/batches/${createdId}`);
          }}
        />
      </FormDialog>
    </>
  );
}
