import { z } from "zod";

export const createAdminSchema = z
  .object({
    loginId: z.string().trim().min(1),
    name: z.string().trim().min(1),
    email: z.email(),
    phone: z.string().trim().optional().or(z.literal("")),
    description: z.string().trim().optional().or(z.literal("")),
    password: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
