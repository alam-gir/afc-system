import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage() {
  const t = await getTranslations("auth");
  const tc = await getTranslations("common");

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={28} height={28} className="rounded-md" priority />
          <span className="text-sm font-semibold">{tc("appName")}</span>
        </div>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center text-center">
            <Image src="/logo.png" alt="" width={48} height={48} className="mb-1 rounded-xl" priority />
            <CardTitle className="text-xl">{t("loginTitle")}</CardTitle>
            <CardDescription>{t("loginSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  );
}
