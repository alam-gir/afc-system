"use client";

import { useTranslations } from "next-intl";
import type { ClassLogRow } from "@/components/class-logs/class-log-list";

const FIELD_KEYS = [
  "chapter",
  "lessons",
  "pages",
  "activities",
  "learningObjectives",
  "vocabulary",
  "grammar",
  "summary",
] as const;

export function ClassLogView({ log }: { log: ClassLogRow }) {
  const t = useTranslations("classLog");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs text-muted-foreground">{t("date")}</p>
        <p className="font-medium">{log.date}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{t("teacher")}</p>
        <p className="font-medium">{log.teacherName ?? log.substituteTeacherName ?? "—"}</p>
      </div>
      {FIELD_KEYS.map((key) =>
        log[key] ? (
          <div key={key}>
            <p className="text-xs text-muted-foreground">{t(key)}</p>
            <p className="whitespace-pre-wrap">{log[key]}</p>
          </div>
        ) : null,
      )}
    </div>
  );
}
