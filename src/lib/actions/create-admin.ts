"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { pgErrorCode } from "@/lib/db-errors";
import { assertRole } from "@/lib/actions/assert-role";
import { createAdminSchema, type CreateAdminInput } from "@/lib/validations/create-admin";

type ActionResult = { success: true; id: string } | { success: false; error: string };

export async function createAdminAccount(input: CreateAdminInput): Promise<ActionResult> {
  await assertRole("admin");

  const parsed = createAdminSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "invalidInput" };

  try {
    const [created] = await db
      .insert(users)
      .values({
        loginId: parsed.data.loginId,
        passwordHash: await hashPassword(parsed.data.password),
        role: "admin",
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        description: parsed.data.description || null,
      })
      .returning({ id: users.id });

    return { success: true, id: created.id };
  } catch (error) {
    if (pgErrorCode(error) === "23505") return { success: false, error: "loginIdTaken" };
    throw error;
  }
}
