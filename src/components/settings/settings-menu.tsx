"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Settings, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormDialog } from "@/components/form-dialog";
import { CreateAdminForm } from "@/components/settings/create-admin-form";

export function SettingsMenu() {
  const t = useTranslations("settings");
  const [createAdminOpen, setCreateAdminOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("title")}>
            <Settings className="size-4.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setCreateAdminOpen(true)}>
            <UserPlus className="size-4.5" />
            {t("createAdmin")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FormDialog
        open={createAdminOpen}
        onOpenChange={setCreateAdminOpen}
        title={t("createAdmin")}
      >
        <CreateAdminForm
          onCancel={() => setCreateAdminOpen(false)}
          onSuccess={() => setCreateAdminOpen(false)}
        />
      </FormDialog>
    </>
  );
}
