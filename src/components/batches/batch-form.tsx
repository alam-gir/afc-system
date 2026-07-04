"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { z } from "zod";
import { batchSchema, type BatchInput } from "@/lib/validations/batch";
import { batchMethod } from "@/db/schema";
import { createBatch, updateBatch } from "@/lib/actions/batches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { LevelCombobox, type LevelOption } from "@/components/batches/level-combobox";

type BatchFormProps = {
  mode: "create" | "edit";
  id?: string;
  defaultValues?: BatchInput;
  initialLevels: LevelOption[];
  onSuccess: (createdId?: string) => void;
  onCancel: () => void;
};

const emptyDefaults: BatchInput = {
  name: "",
  startDate: "",
  endDate: "",
  totalClasses: 1,
  durationPerClassHours: 1,
  levelId: "",
  method: batchMethod.enumValues[0],
  classRoom: "",
  classTime: "",
  description: "",
};

export function BatchForm({
  mode,
  id,
  defaultValues,
  initialLevels,
  onSuccess,
  onCancel,
}: BatchFormProps) {
  const t = useTranslations("batch");
  const tc = useTranslations("common");
  const [levels, setLevels] = useState(initialLevels);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof batchSchema>, unknown, BatchInput>({
    resolver: zodResolver(batchSchema),
    defaultValues: defaultValues ?? emptyDefaults,
  });

  async function onSubmit(values: BatchInput) {
    if (mode === "create") {
      const result = await createBatch(values);
      if (!result.success) {
        toast.error(tc("somethingWentWrong"));
        return;
      }
      toast.success(t("createSuccess"));
      onSuccess(result.id);
      return;
    }

    const result = await updateBatch(id!, values);
    if (!result.success) {
      toast.error(tc("somethingWentWrong"));
      return;
    }
    toast.success(t("updateSuccess"));
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">{t("name")}</FieldLabel>
          <FieldContent>
            <Input id="name" {...register("name")} />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.startDate}>
            <FieldLabel htmlFor="startDate">{t("startDate")}</FieldLabel>
            <FieldContent>
              <Input id="startDate" type="date" {...register("startDate")} />
              <FieldError errors={errors.startDate ? [errors.startDate] : undefined} />
            </FieldContent>
          </Field>
          <Field data-invalid={!!errors.endDate}>
            <FieldLabel htmlFor="endDate">{t("endDate")}</FieldLabel>
            <FieldContent>
              <Input id="endDate" type="date" {...register("endDate")} />
              <FieldError>
                {errors.endDate ? t("endBeforeStart") : null}
              </FieldError>
            </FieldContent>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.totalClasses}>
            <FieldLabel htmlFor="totalClasses">{t("totalClasses")}</FieldLabel>
            <FieldContent>
              <Input id="totalClasses" type="number" min={1} step={1} {...register("totalClasses")} />
              <FieldError errors={errors.totalClasses ? [errors.totalClasses] : undefined} />
            </FieldContent>
          </Field>
          <Field data-invalid={!!errors.durationPerClassHours}>
            <FieldLabel htmlFor="durationPerClassHours">{t("durationPerClassHours")}</FieldLabel>
            <FieldContent>
              <Input
                id="durationPerClassHours"
                type="number"
                min={0.5}
                step={0.5}
                {...register("durationPerClassHours")}
              />
              <FieldError
                errors={errors.durationPerClassHours ? [errors.durationPerClassHours] : undefined}
              />
            </FieldContent>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.levelId}>
            <FieldLabel htmlFor="levelId">{t("level")}</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="levelId"
                render={({ field }) => (
                  <LevelCombobox
                    value={field.value}
                    onChange={field.onChange}
                    levels={levels}
                    onLevelsChange={setLevels}
                  />
                )}
              />
              <FieldError errors={errors.levelId ? [errors.levelId] : undefined} />
            </FieldContent>
          </Field>
          <Field data-invalid={!!errors.method}>
            <FieldLabel htmlFor="method">{t("method")}</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="method"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="method" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {batchMethod.enumValues.map((value) => (
                        <SelectItem key={value} value={value}>
                          {t(`methods.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={errors.method ? [errors.method] : undefined} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.classRoom}>
            <FieldLabel htmlFor="classRoom">{t("classRoom")}</FieldLabel>
            <FieldContent>
              <Input id="classRoom" {...register("classRoom")} />
              <FieldError errors={errors.classRoom ? [errors.classRoom] : undefined} />
            </FieldContent>
          </Field>
          <Field data-invalid={!!errors.classTime}>
            <FieldLabel htmlFor="classTime">{t("classTime")}</FieldLabel>
            <FieldContent>
              <Input id="classTime" type="time" {...register("classTime")} />
              <FieldError errors={errors.classTime ? [errors.classTime] : undefined} />
            </FieldContent>
          </Field>
        </div>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">{t("description")}</FieldLabel>
          <FieldContent>
            <Textarea id="description" rows={3} {...register("description")} />
            <FieldError errors={errors.description ? [errors.description] : undefined} />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            {tc("cancel")}
          </Button>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {tc("save")}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
