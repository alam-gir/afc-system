import { z } from "zod";
import { batchMethod } from "@/db/schema";

export const batchSchema = z
  .object({
    name: z.string().trim().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    totalClasses: z.coerce.number().int().positive(),
    durationPerClassHours: z.coerce.number().positive(),
    levelId: z.string().uuid(),
    method: z.enum(batchMethod.enumValues),
    classRoom: z.string().trim().min(1),
    classTime: z.string().trim().min(1),
    description: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "endBeforeStart",
    path: ["endDate"],
  });

export type BatchInput = z.infer<typeof batchSchema>;
