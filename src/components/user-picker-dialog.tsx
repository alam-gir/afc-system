"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchUsersByRole, type UserSearchResult } from "@/lib/actions/user-search";
import type { UserRole } from "@/types/next-auth";

type UserPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Extract<UserRole, "teacher" | "student">;
  title: string;
  excludeBatchId?: string;
  onSelect: (user: UserSearchResult) => Promise<void> | void;
};

export function UserPickerDialog({
  open,
  onOpenChange,
  role,
  title,
  excludeBatchId,
  onSelect,
}: UserPickerDialogProps) {
  const tc = useTranslations("common");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const found = await searchUsersByRole(role, query, excludeBatchId);
        setResults(found);
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [open, query, role, excludeBatchId]);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setQuery("");
      setResults([]);
    }
  }

  async function handleSelect(user: UserSearchResult) {
    setSelectingId(user.id);
    try {
      await onSelect(user);
      handleOpenChange(false);
    } finally {
      setSelectingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={tc("search")}
          autoFocus
        />

        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {isPending ? (
            <p className="p-2 text-sm text-muted-foreground">{tc("loading")}</p>
          ) : results.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">{tc("noResults")}</p>
          ) : (
            results.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.loginId}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={selectingId === user.id}
                  onClick={() => handleSelect(user)}
                >
                  {tc("add")}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
