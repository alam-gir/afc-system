"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

type ProfileFormProps = {
  defaultValues: ProfileInput;
};

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const t = useTranslations("profile");
  const tc = useTranslations("common");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  async function onSubmit(values: ProfileInput) {
    const result = await updateProfile(values);
    if (result.success) {
      toast.success(t("updateSuccess"));
    } else {
      toast.error(tc("somethingWentWrong"));
    }
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

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
          <FieldContent>
            <Input id="email" type="email" {...register("email")} />
            <FieldError errors={errors.email ? [errors.email] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">{t("phone")}</FieldLabel>
          <FieldContent>
            <Input id="phone" type="tel" {...register("phone")} />
            <FieldError errors={errors.phone ? [errors.phone] : undefined} />
          </FieldContent>
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">{t("description")}</FieldLabel>
          <FieldContent>
            <Textarea id="description" rows={3} {...register("description")} />
            <FieldError errors={errors.description ? [errors.description] : undefined} />
          </FieldContent>
        </Field>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
          {tc("save")}
        </Button>
      </FieldGroup>
    </form>
  );
}
