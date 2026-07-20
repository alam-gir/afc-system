"use client";

import { useTranslations } from "next-intl";
import { TriangleAlertIcon } from "lucide-react";
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
  const tc = useTranslations("common");

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
      {FIELD_KEYS.map((key) => (
        <div key={key}>
          <p className="text-xs text-muted-foreground">{t(key)}</p>
          {log[key] ? (
            <p className="whitespace-pre-wrap">{log[key]}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">{tc("notProvided")}</p>
          )}
        </div>
      ))}
      <div>
        <p className="text-xs text-muted-foreground">{t("followedCalendar")}</p>
        {log.followedCalendar ? (
          <p className="font-medium">{tc("yes")}</p>
        ) : (
          <div className="mt-1 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-destructive">{t("calendarNotFollowed")}</p>
              {log.calendarDeviationReason ? (
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {log.calendarDeviationReason}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
