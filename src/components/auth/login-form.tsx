"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function LoginForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [serverError, setServerError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { loginId: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (result?.error) {
      setServerError(t("invalidCredentials"));
      return;
    }

    window.location.assign("/");
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.loginId}>
            <FieldLabel htmlFor="loginId">{t("loginIdLabel")}</FieldLabel>
            <FieldContent>
              <Input
                id="loginId"
                autoComplete="username"
                autoFocus
                {...register("loginId")}
              />
              <FieldError errors={errors.loginId ? [errors.loginId] : undefined} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">{t("passwordLabel")}</FieldLabel>
            <FieldContent>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              <FieldError errors={errors.password ? [errors.password] : undefined} />
            </FieldContent>
          </Field>

          {serverError ? (
            <p role="alert" className="text-sm text-destructive">
              {serverError}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t("signingIn") : t("loginButton")}
          </Button>

          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={() => setForgotOpen(true)}
          >
            {t("forgotPassword")}
          </Button>
        </FieldGroup>
      </form>

      <AlertDialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("forgotPasswordTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("forgotPasswordMessage")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setForgotOpen(false)}>
              {tc("close")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
