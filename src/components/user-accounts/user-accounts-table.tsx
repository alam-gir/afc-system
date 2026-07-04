"use client";

import { useState } from "react";
import { MoreVertical, Pencil, KeyRound, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Card, CardAction, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "@/i18n/navigation";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { FormDialog } from "@/components/form-dialog";
import { UserAccountForm } from "@/components/user-accounts/user-account-form";
import { deleteUserAccount, resetUserPassword } from "@/lib/actions/user-accounts";
import type { UserRole } from "@/types/next-auth";

export type UserAccountRow = {
  id: string;
  loginId: string;
  name: string;
  email: string;
  phone: string | null;
  description: string | null;
};

type UserAccountsTableProps = {
  role: Extract<UserRole, "teacher" | "student">;
  items: UserAccountRow[];
};

export function UserAccountsTable({ role, items }: UserAccountsTableProps) {
  const t = useTranslations(role);
  const ta = useTranslations("account");
  const tp = useTranslations("profile");
  const tc = useTranslations("common");
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<UserAccountRow | null>(null);
  const [editTarget, setEditTarget] = useState<UserAccountRow | null>(null);
  const [resetTarget, setResetTarget] = useState<UserAccountRow | null>(null);
  const [resetPending, setResetPending] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteUserAccount(role, deleteTarget.id);
    if (result.success) {
      toast.success(t("deleteSuccess"));
      router.refresh();
    } else {
      toast.error(tc("somethingWentWrong"));
    }
    setDeleteTarget(null);
  }

  async function handleResetPassword() {
    if (!resetTarget) return;
    setResetPending(true);
    try {
      const result = await resetUserPassword(role, resetTarget.id);
      if (result.success) {
        toast.success(ta("resetPasswordSuccess"));
        setResetTarget(null);
      } else {
        toast.error(tc("somethingWentWrong"));
      }
    } finally {
      setResetPending(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{tc("noResults")}</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader className="gap-1">
              <p className="truncate text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {tp("loginId")}: {item.loginId}
              </p>
              {item.email ? (
                <p className="truncate text-xs text-muted-foreground">{item.email}</p>
              ) : null}
              {item.phone ? (
                <p className="text-xs text-muted-foreground">{item.phone}</p>
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
                    <DropdownMenuItem onSelect={() => setEditTarget(item)}>
                      <Pencil />
                      <span className="whitespace-nowrap">{tc("edit")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setResetTarget(item)}>
                      <KeyRound />
                      <span className="whitespace-nowrap">{ta("resetPassword")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setDeleteTarget(item)}
                    >
                      <Trash2 />
                      <span className="whitespace-nowrap">{tc("delete")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>

      <FormDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title={t("editTitle")}
      >
        {editTarget ? (
          <UserAccountForm
            role={role}
            mode="edit"
            id={editTarget.id}
            defaultValues={{
              loginId: editTarget.loginId,
              name: editTarget.name,
              email: editTarget.email,
              phone: editTarget.phone ?? "",
              description: editTarget.description ?? "",
            }}
            onCancel={() => setEditTarget(null)}
            onSuccess={() => {
              setEditTarget(null);
              router.refresh();
            }}
          />
        ) : null}
      </FormDialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemDescription={deleteTarget ? `${deleteTarget.name} (${deleteTarget.loginId})` : undefined}
        extraDescription={t("deleteConfirmDescription")}
      />

      <AlertDialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ta("resetPassword")}</AlertDialogTitle>
            <AlertDialogDescription>
              {resetTarget ? ta("resetPasswordDescription", { loginId: resetTarget.loginId }) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">{tc("cancel")}</AlertDialogCancel>
            <Button type="button" disabled={resetPending} onClick={handleResetPassword}>
              {tc("yes")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
