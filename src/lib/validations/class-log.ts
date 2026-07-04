import { z } from "zod";

export const classLogFieldsSchema = z.object({
  date: z.string().min(1, "required"),
  summary: z.string().trim().optional().or(z.literal("")),
  chapter: z.string().trim().min(1, "required"),
  lessons: z.string().trim().min(1, "required"),
  pages: z.string().trim().min(1, "required"),
  activities: z.string().trim().optional().or(z.literal("")),
  learningObjectives: z.string().trim().optional().or(z.literal("")),
  vocabulary: z.string().trim().optional().or(z.literal("")),
  grammar: z.string().trim().optional().or(z.literal("")),
});

export type ClassLogFieldsInput = z.infer<typeof classLogFieldsSchema>;

export const adminClassLogSchema = classLogFieldsSchema.extend({
  teacherName: z.string().trim().min(1),
});

export type AdminClassLogInput = z.infer<typeof adminClassLogSchema>;
