"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const t = useTranslations("auth");

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={t("logout")}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="size-4.5" />
      <span className="hidden sm:inline">{t("logout")}</span>
    </Button>
  );
}
