import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t px-4 py-3 pb-20 text-center text-xs text-muted-foreground md:pb-3">
      <p>{t("copyright", { year })}</p>
      <p>
        {t("credit")}{" "}
        <a
          href="https://softaura.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline underline-offset-2 hover:text-foreground"
        >
          Softaura
        </a>
      </p>
    </footer>
  );
}
