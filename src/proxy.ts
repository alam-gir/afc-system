import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";
import type { UserRole } from "@/types/next-auth";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware(routing);

const localePrefixPattern = `/(?:${routing.locales.join("|")})`;

function stripLocale(pathname: string) {
  const match = pathname.match(new RegExp(`^${localePrefixPattern}(/.*)?$`));
  return match?.[1] || "/";
}

function roleHome(role: UserRole) {
  return `/${role}`;
}

export default auth((req) => {
  const { nextUrl } = req;
  const pathWithoutLocale = stripLocale(nextUrl.pathname);
  const localeMatch = nextUrl.pathname.match(new RegExp(`^/(${routing.locales.join("|")})`));
  const locale = localeMatch?.[1] ?? routing.defaultLocale;

  const session = req.auth;
  const isLoginPage = pathWithoutLocale === "/login";
  const isProtected = /^\/(admin|teacher|student)(\/|$)/.test(pathWithoutLocale);

  if (!session && isProtected) {
    return NextResponse.redirect(new URL(`/${locale}/login`, nextUrl));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(
      new URL(`/${locale}${roleHome(session.user.role as UserRole)}`, nextUrl),
    );
  }

  if (session && isProtected) {
    const allowedPrefix = roleHome(session.user.role as UserRole);
    if (!pathWithoutLocale.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL(`/${locale}${allowedPrefix}`, nextUrl));
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
