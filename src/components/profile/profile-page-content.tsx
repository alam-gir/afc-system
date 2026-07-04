import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/get-current-user";
import { ProfileForm } from "@/components/profile/profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalBreadcrumb } from "@/components/portal-breadcrumb";

export async function ProfilePageContent() {
  const session = await auth();
  const t = await getTranslations("profile");
  const tn = await getTranslations("nav");
  const user = await getCurrentUser(session!.user.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <PortalBreadcrumb
        items={[
          { label: tn("dashboard"), href: `/${session!.user.role}` },
          { label: tn("profile") },
        ]}
      />
      <h1 className="text-xl font-semibold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("basicDetails")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("loginId")}: {user.loginId}
          </p>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              name: user.name,
              email: user.email,
              phone: user.phone ?? "",
              description: user.description ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("changePassword")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
