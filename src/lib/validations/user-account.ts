import { z } from "zod";

export const userAccountSchema = z.object({
  loginId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  email: z.email(),
  phone: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
});

export type UserAccountInput = z.infer<typeof userAccountSchema>;
