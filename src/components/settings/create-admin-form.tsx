"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createAdminSchema, type CreateAdminInput } from "@/lib/validations/create-admin";
import { createAdminAccount } from "@/lib/actions/create-admin";
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

const emptyDefaults: CreateAdminInput = {
  loginId: "",
  name: "",
  email: "",
  phone: "",
  description: "",
  password: "",
  confirmPassword: "",
};

export function CreateAdminForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("settings");
  const tp = useTranslations("profile");
  const ta = useTranslations("account");
  const tc = useTranslations("common");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminInput>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: emptyDefaults,
  });

  async function onSubmit(values: CreateAdminInput) {
    const result = await createAdminAccount(values);

    if (result.success) {
      toast.success(t("createAdminSuccess"));
      onSuccess();
      return;
    }

    if (result.error === "loginIdTaken") {
      setError("loginId", { message: ta("loginIdTaken") });
      return;
    }

    toast.error(tc("somethingWentWrong"));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <FieldDescription>{t("createAdminDescription")}</FieldDescription>

        <Field data-invalid={!!errors.loginId}>
          <FieldLabel htmlFor="admin-loginId">{tp("loginId")}</FieldLabel>
          <FieldContent>
            <Input id="admin-loginId" {...register("loginId")} />
            <FieldError errors={errors.loginId ? [errors.loginId] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="admin-name">{tp("name")}</FieldLabel>
          <FieldContent>
            <Input id="admin-name" {...register("name")} />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="admin-email">{tp("email")}</FieldLabel>
          <FieldContent>
            <Input id="admin-email" type="email" {...register("email")} />
            <FieldError errors={errors.email ? [errors.email] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="admin-phone">{tp("phone")}</FieldLabel>
          <FieldContent>
            <Input id="admin-phone" type="tel" {...register("phone")} />
            <FieldError errors={errors.phone ? [errors.phone] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="admin-description">{tp("description")}</FieldLabel>
          <FieldContent>
            <Textarea id="admin-description" rows={3} {...register("description")} />
            <FieldError errors={errors.description ? [errors.description] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="admin-password">{t("password")}</FieldLabel>
          <FieldContent>
            <Input
              id="admin-password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            <FieldError>{errors.password ? tp("passwordTooShort") : null}</FieldError>
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="admin-confirmPassword">{t("confirmPassword")}</FieldLabel>
          <FieldContent>
            <Input
              id="admin-confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            <FieldError>{errors.confirmPassword ? tp("passwordMismatch") : null}</FieldError>
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
