"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const t = useTranslations("auth");

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <HugeiconsIcon icon={Logout01Icon} className="size-4" />
      {t("logout")}
    </Button>
  );
}
