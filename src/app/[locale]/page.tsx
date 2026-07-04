import { getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";

export default async function RootPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session) {
    redirect({ href: "/login", locale });
  }

  redirect({ href: `/${session!.user.role}`, locale });
}
