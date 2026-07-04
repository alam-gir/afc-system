"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createBatchLevel } from "@/lib/actions/batch-levels";

export type LevelOption = { id: string; name: string };

type LevelComboboxProps = {
  value: string;
  onChange: (levelId: string) => void;
  levels: LevelOption[];
  onLevelsChange: (levels: LevelOption[]) => void;
};

export function LevelCombobox({ value, onChange, levels, onLevelsChange }: LevelComboboxProps) {
  const t = useTranslations("batch");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const selected = levels.find((level) => level.id === value);
  const trimmedQuery = query.trim();
  const hasExactMatch = levels.some(
    (level) => level.name.toLowerCase() === trimmedQuery.toLowerCase(),
  );

  async function handleCreate() {
    if (!trimmedQuery || creating) return;
    setCreating(true);
    const result = await createBatchLevel(trimmedQuery);
    setCreating(false);

    if (!result.success) {
      toast.error(tc("somethingWentWrong"));
      return;
    }

    if (!levels.some((level) => level.id === result.id)) {
      onLevelsChange([...levels, { id: result.id, name: result.name }].sort((a, b) => a.name.localeCompare(b.name)));
    }
    onChange(result.id);
    setQuery("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selected ? selected.name : t("level")}
          <ChevronsUpDown className="size-4.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={t("level")}
          />
          <CommandList>
            <CommandEmpty>
              {trimmedQuery ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={creating}
                  onClick={handleCreate}
                  className="w-full justify-start font-normal"
                >
                  <Plus className="size-4.5" />
                  {t("addLevel", { name: trimmedQuery })}
                </Button>
              ) : (
                tc("noResults")
              )}
            </CommandEmpty>
            <CommandGroup>
              {levels.map((level) => (
                <CommandItem
                  key={level.id}
                  value={level.name}
                  onSelect={() => {
                    onChange(level.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("size-4.5", level.id === value ? "opacity-100" : "opacity-0")}
                  />
                  {level.name}
                </CommandItem>
              ))}
            </CommandGroup>
            {trimmedQuery && !hasExactMatch && levels.length > 0 ? (
              <CommandGroup>
                <CommandItem disabled={creating} onSelect={handleCreate}>
                  <Plus className="size-4.5" />
                  {t("addLevel", { name: trimmedQuery })}
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
