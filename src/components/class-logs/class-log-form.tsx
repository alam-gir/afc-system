"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { classLogFieldsSchema, type ClassLogFieldsInput } from "@/lib/validations/class-log";
import { createClassLog, updateClassLog } from "@/lib/actions/class-logs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

type ClassLogFormProps = {
  variant: "admin-create" | "teacher-create" | "edit";
  batchId: string;
  logId?: string;
  defaultValues?: ClassLogFieldsInput;
  teacherNameDefault?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

const emptyFieldsDefaults: ClassLogFieldsInput = {
  date: new Date().toISOString().slice(0, 10),
  summary: "",
  chapter: "",
  lessons: "",
  pages: "",
  activities: "",
  learningObjectives: "",
  vocabulary: "",
  grammar: "",
};

export function ClassLogForm({
  variant,
  batchId,
  logId,
  defaultValues,
  teacherNameDefault,
  onSuccess,
  onCancel,
}: ClassLogFormProps) {
  const t = useTranslations("classLog");
  const tc = useTranslations("common");
  const showTeacherName = variant === "admin-create";

  const [teacherName, setTeacherName] = useState(teacherNameDefault ?? "");
  const [teacherNameError, setTeacherNameError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClassLogFieldsInput>({
    resolver: zodResolver(classLogFieldsSchema),
    defaultValues: defaultValues ?? emptyFieldsDefaults,
  });

  async function onSubmit(values: ClassLogFieldsInput) {
    if (showTeacherName && !teacherName.trim()) {
      setTeacherNameError(tc("required"));
      return;
    }
    setTeacherNameError(null);

    const payload = { ...values, teacherName };
    const result =
      variant === "edit"
        ? await updateClassLog(logId!, values)
        : await createClassLog(batchId, payload);

    if (!result.success) {
      toast.error(tc("somethingWentWrong"));
      return;
    }

    toast.success(variant === "edit" ? t("updateSuccess") : t("createSuccess"));
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.date}>
          <FieldLabel htmlFor="date">{t("date")} *</FieldLabel>
          <FieldContent>
            <Input id="date" type="date" {...register("date")} />
            <FieldError>{errors.date ? tc("required") : null}</FieldError>
          </FieldContent>
        </Field>

        {showTeacherName ? (
          <Field data-invalid={!!teacherNameError}>
            <FieldLabel htmlFor="teacherName">{t("teacher")}</FieldLabel>
            <FieldContent>
              <Input
                id="teacherName"
                value={teacherName}
                onChange={(event) => {
                  setTeacherName(event.target.value);
                  if (teacherNameError) setTeacherNameError(null);
                }}
              />
              <FieldDescription>{t("substituteTeacherHint")}</FieldDescription>
              <FieldError>{teacherNameError}</FieldError>
            </FieldContent>
          </Field>
        ) : null}

        <Field data-invalid={!!errors.chapter}>
          <FieldLabel htmlFor="chapter">{t("chapter")} *</FieldLabel>
          <FieldContent>
            <Input id="chapter" {...register("chapter")} />
            <FieldError>{errors.chapter ? tc("required") : null}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.lessons}>
          <FieldLabel htmlFor="lessons">{t("lessons")} *</FieldLabel>
          <FieldContent>
            <Textarea id="lessons" rows={2} {...register("lessons")} />
            <FieldError>{errors.lessons ? tc("required") : null}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.pages}>
          <FieldLabel htmlFor="pages">{t("pages")} *</FieldLabel>
          <FieldContent>
            <Input id="pages" {...register("pages")} />
            <FieldError>{errors.pages ? tc("required") : null}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.activities}>
          <FieldLabel htmlFor="activities">{t("activities")}</FieldLabel>
          <FieldContent>
            <Textarea id="activities" rows={2} {...register("activities")} />
            <FieldError errors={errors.activities ? [errors.activities] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.learningObjectives}>
          <FieldLabel htmlFor="learningObjectives">{t("learningObjectives")}</FieldLabel>
          <FieldContent>
            <Textarea id="learningObjectives" rows={2} {...register("learningObjectives")} />
            <FieldError
              errors={errors.learningObjectives ? [errors.learningObjectives] : undefined}
            />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.vocabulary}>
          <FieldLabel htmlFor="vocabulary">{t("vocabulary")}</FieldLabel>
          <FieldContent>
            <Textarea id="vocabulary" rows={2} {...register("vocabulary")} />
            <FieldError errors={errors.vocabulary ? [errors.vocabulary] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.grammar}>
          <FieldLabel htmlFor="grammar">{t("grammar")}</FieldLabel>
          <FieldContent>
            <Textarea id="grammar" rows={2} {...register("grammar")} />
            <FieldError errors={errors.grammar ? [errors.grammar] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.summary}>
          <FieldLabel htmlFor="summary">{t("summary")}</FieldLabel>
          <FieldContent>
            <Textarea id="summary" rows={2} {...register("summary")} />
            <FieldError errors={errors.summary ? [errors.summary] : undefined} />
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
