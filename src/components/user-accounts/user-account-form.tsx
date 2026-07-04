"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { userAccountSchema, type UserAccountInput } from "@/lib/validations/user-account";
import { createUserAccount, updateUserAccount } from "@/lib/actions/user-accounts";
import type { UserRole } from "@/types/next-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

type UserAccountFormProps = {
  role: Extract<UserRole, "teacher" | "student">;
  mode: "create" | "edit";
  id?: string;
  defaultValues?: UserAccountInput;
  onSuccess: () => void;
  onCancel: () => void;
};

const emptyDefaults: UserAccountInput = { loginId: "", name: "", email: "", phone: "", description: "" };

export function UserAccountForm({ role, mode, id, defaultValues, onSuccess, onCancel }: UserAccountFormProps) {
  const t = useTranslations(role);
  const tp = useTranslations("profile");
  const ta = useTranslations("account");
  const tc = useTranslations("common");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserAccountInput>({
    resolver: zodResolver(userAccountSchema),
    defaultValues: defaultValues ?? emptyDefaults,
  });

  async function onSubmit(values: UserAccountInput) {
    const result =
      mode === "create"
        ? await createUserAccount(role, values)
        : await updateUserAccount(role, id!, values);

    if (result.success) {
      toast.success(mode === "create" ? t("createSuccess") : t("updateSuccess"));
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
        <Field data-invalid={!!errors.loginId}>
          <FieldLabel htmlFor="loginId">{tp("loginId")}</FieldLabel>
          <FieldContent>
            <Input id="loginId" {...register("loginId")} />
            <FieldDescription>{t("loginIdHint")}</FieldDescription>
            <FieldError errors={errors.loginId ? [errors.loginId] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">{tp("name")}</FieldLabel>
          <FieldContent>
            <Input id="name" {...register("name")} />
            <FieldError errors={errors.name ? [errors.name] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">{tp("email")}</FieldLabel>
          <FieldContent>
            <Input id="email" type="email" {...register("email")} />
            <FieldError errors={errors.email ? [errors.email] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">{tp("phone")}</FieldLabel>
          <FieldContent>
            <Input id="phone" type="tel" {...register("phone")} />
            <FieldError errors={errors.phone ? [errors.phone] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">{tp("description")}</FieldLabel>
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
