"use server";

import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  passwordChangeSchema,
  profileSchema,
  type PasswordChangeInput,
  type ProfileInput,
} from "@/lib/validations/profile";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "unauthenticated" };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "invalidInput" };

  await db
    .update(users)
    .set({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      description: parsed.data.description || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  return { success: true };
}

export async function changePassword(input: PasswordChangeInput): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "unauthenticated" };

  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "invalidInput" };

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!user) return { success: false, error: "unauthenticated" };

  const currentValid = await verifyPassword(user.passwordHash, parsed.data.currentPassword);
  if (!currentValid) return { success: false, error: "currentPasswordIncorrect" };

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.newPassword), updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return { success: true };
}
