"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { UserAccountForm } from "@/components/user-accounts/user-account-form";
import type { UserRole } from "@/types/next-auth";

export function UserAccountCreateButton({
  role,
}: {
  role: Extract<UserRole, "teacher" | "student">;
}) {
  const t = useTranslations(role);
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
        <UserAccountForm
          role={role}
          mode="create"
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
