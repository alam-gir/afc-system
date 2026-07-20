import { z } from "zod";

const CALENDAR_DEVIATION_REASON_MIN_LENGTH = 5;

const classLogFieldsShape = z.object({
  date: z.string().min(1, "required"),
  followedCalendar: z.enum(["yes", "no"]).optional(),
  calendarDeviationReason: z.string().trim().optional().or(z.literal("")),
  summary: z.string().trim().optional().or(z.literal("")),
  chapter: z.string().trim().min(1, "required"),
  lessons: z.string().trim().min(1, "required"),
  pages: z.string().trim().min(1, "required"),
  activities: z.string().trim().optional().or(z.literal("")),
  learningObjectives: z.string().trim().optional().or(z.literal("")),
  vocabulary: z.string().trim().optional().or(z.literal("")),
  grammar: z.string().trim().optional().or(z.literal("")),
});

function checkCalendarDeviation(
  data: { followedCalendar?: "yes" | "no"; calendarDeviationReason?: string },
  ctx: { addIssue: (issue: { code: "custom"; path: (string | number)[]; message: string }) => void },
) {
  if (!data.followedCalendar) {
    ctx.addIssue({ code: "custom", path: ["followedCalendar"], message: "required" });
    return;
  }
  if (
    data.followedCalendar === "no" &&
    (data.calendarDeviationReason ?? "").trim().length < CALENDAR_DEVIATION_REASON_MIN_LENGTH
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["calendarDeviationReason"],
      message: "calendarDeviationReasonMinLength",
    });
  }
}

export const classLogFieldsSchema = classLogFieldsShape.superRefine(checkCalendarDeviation);

export type ClassLogFieldsInput = z.infer<typeof classLogFieldsSchema>;

export const adminClassLogSchema = classLogFieldsShape
  .extend({ teacherName: z.string().trim().min(1) })
  .superRefine(checkCalendarDeviation);

export type AdminClassLogInput = z.infer<typeof adminClassLogSchema>;
