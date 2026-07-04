import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  phone: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "passwordMismatch",
    path: ["confirmNewPassword"],
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
