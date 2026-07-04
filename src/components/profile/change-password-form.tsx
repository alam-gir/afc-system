"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  passwordChangeSchema,
  type PasswordChangeInput,
} from "@/lib/validations/profile";
import { changePassword } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

export function ChangePasswordForm() {
  const t = useTranslations("profile");
  const tc = useTranslations("common");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  async function onSubmit(values: PasswordChangeInput) {
    const result = await changePassword(values);
    if (result.success) {
      toast.success(t("passwordUpdateSuccess"));
      reset();
    } else if (result.error === "currentPasswordIncorrect") {
      toast.error(t("currentPasswordIncorrect"));
    } else {
      toast.error(tc("somethingWentWrong"));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.currentPassword}>
          <FieldLabel htmlFor="currentPassword">{t("currentPassword")}</FieldLabel>
          <FieldContent>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
            <FieldError>{errors.currentPassword ? tc("required") : null}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.newPassword}>
          <FieldLabel htmlFor="newPassword">{t("newPassword")}</FieldLabel>
          <FieldContent>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
            />
            <FieldError>{errors.newPassword ? t("passwordTooShort") : null}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.confirmNewPassword}>
          <FieldLabel htmlFor="confirmNewPassword">{t("confirmNewPassword")}</FieldLabel>
          <FieldContent>
            <Input
              id="confirmNewPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmNewPassword")}
            />
            <FieldError>{errors.confirmNewPassword ? t("passwordMismatch") : null}</FieldError>
          </FieldContent>
        </Field>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
          {t("changePassword")}
        </Button>
      </FieldGroup>
    </form>
  );
}
