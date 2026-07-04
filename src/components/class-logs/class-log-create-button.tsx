"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { ClassLogForm } from "@/components/class-logs/class-log-form";

type ClassLogCreateButtonProps = {
  variant: "admin-create" | "teacher-create";
  batchId: string;
  teacherNameDefault?: string;
  label: string;
  floating?: boolean;
};

export function ClassLogCreateButton({
  variant,
  batchId,
  teacherNameDefault,
  label,
  floating,
}: ClassLogCreateButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      {floating ? (
        <Button
          size="icon"
          aria-label={label}
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 size-14 rounded-full shadow-lg md:bottom-6"
        >
          <Plus className="size-6" />
        </Button>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          {label}
        </Button>
      )}
      <FormDialog open={open} onOpenChange={setOpen} title={label}>
        <ClassLogForm
          variant={variant}
          batchId={batchId}
          teacherNameDefault={teacherNameDefault}
          onCancel={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </FormDialog>
    </>
  );
}
