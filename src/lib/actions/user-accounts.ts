"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { pgErrorCode } from "@/lib/db-errors";
import { assertRole } from "@/lib/actions/assert-role";
import { userAccountSchema, type UserAccountInput } from "@/lib/validations/user-account";
import type { UserRole } from "@/types/next-auth";

type ActionResult = { success: true; id: string } | { success: false; error: string };
type SimpleResult = { success: true } | { success: false; error: string };

function listPathFor(role: UserRole) {
  return role === "teacher" ? "/admin/teachers" : "/admin/students";
}

export async function createUserAccount(role: UserRole, input: UserAccountInput): Promise<ActionResult> {
  await assertRole("admin");

  const parsed = userAccountSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "invalidInput" };

  try {
    const [created] = await db
      .insert(users)
      .values({
        loginId: parsed.data.loginId,
        passwordHash: await hashPassword(parsed.data.loginId),
        role,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        description: parsed.data.description || null,
      })
      .returning({ id: users.id });

    revalidatePath(listPathFor(role));
    return { success: true, id: created.id };
  } catch (error) {
    if (pgErrorCode(error) === "23505") return { success: false, error: "loginIdTaken" };
    throw error;
  }
}

export async function updateUserAccount(
  role: UserRole,
  id: string,
  input: UserAccountInput,
): Promise<SimpleResult> {
  await assertRole("admin");

  const parsed = userAccountSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "invalidInput" };

  try {
    await db
      .update(users)
      .set({
        loginId: parsed.data.loginId,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        description: parsed.data.description || null,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, id), eq(users.role, role)));

    revalidatePath(listPathFor(role));
    return { success: true };
  } catch (error) {
    if (pgErrorCode(error) === "23505") return { success: false, error: "loginIdTaken" };
    throw error;
  }
}

export async function deleteUserAccount(role: UserRole, id: string): Promise<SimpleResult> {
  await assertRole("admin");

  await db.delete(users).where(and(eq(users.id, id), eq(users.role, role)));

  revalidatePath(listPathFor(role));
  return { success: true };
}

export async function resetUserPassword(role: UserRole, id: string): Promise<SimpleResult> {
  await assertRole("admin");

  const [user] = await db
    .select({ loginId: users.loginId })
    .from(users)
    .where(and(eq(users.id, id), eq(users.role, role)))
    .limit(1);
  if (!user) return { success: false, error: "notFound" };

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(user.loginId), updatedAt: new Date() })
    .where(eq(users.id, id));

  return { success: true };
}
