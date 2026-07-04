"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { batchEnrollments, batches } from "@/db/schema";
import { assertRole } from "@/lib/actions/assert-role";
import { pgErrorCode } from "@/lib/db-errors";
import { batchSchema, type BatchInput } from "@/lib/validations/batch";

type ActionResult = { success: true; id: string } | { success: false; error: string };
type SimpleResult = { success: true } | { success: false; error: string };

function toBatchValues(input: BatchInput) {
  return {
    name: input.name,
    startDate: input.startDate,
    endDate: input.endDate,
    totalClasses: input.totalClasses,
    durationPerClassHours: input.durationPerClassHours,
    levelId: input.levelId,
    method: input.method,
    classRoom: input.classRoom,
    classTime: input.classTime,
    description: input.description || null,
  };
}

export async function createBatch(input: BatchInput): Promise<ActionResult> {
  await assertRole("admin");

  const parsed = batchSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "invalidInput" };

  const [created] = await db
    .insert(batches)
    .values(toBatchValues(parsed.data))
    .returning({ id: batches.id });

  revalidatePath("/admin/batches");
  return { success: true, id: created.id };
}

export async function updateBatch(id: string, input: BatchInput): Promise<SimpleResult> {
  await assertRole("admin");

  const parsed = batchSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "invalidInput" };

  await db
    .update(batches)
    .set({ ...toBatchValues(parsed.data), updatedAt: new Date() })
    .where(eq(batches.id, id));

  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${id}`);
  return { success: true };
}

export async function deleteBatch(id: string): Promise<SimpleResult> {
  await assertRole("admin");
  await db.delete(batches).where(eq(batches.id, id));
  revalidatePath("/admin/batches");
  return { success: true };
}

export async function assignTeacher(batchId: string, teacherId: string | null): Promise<SimpleResult> {
  await assertRole("admin");
  await db
    .update(batches)
    .set({ teacherId, updatedAt: new Date() })
    .where(eq(batches.id, batchId));
  revalidatePath(`/admin/batches/${batchId}`);
  return { success: true };
}

export async function addStudentToBatch(batchId: string, studentId: string): Promise<SimpleResult> {
  await assertRole("admin");

  try {
    await db.insert(batchEnrollments).values({ batchId, studentId });
  } catch (error) {
    if (pgErrorCode(error) === "23505") return { success: false, error: "alreadyEnrolled" };
    throw error;
  }

  revalidatePath(`/admin/batches/${batchId}`);
  return { success: true };
}

export async function removeStudentFromBatch(batchId: string, studentId: string): Promise<SimpleResult> {
  await assertRole("admin");
  await db
    .delete(batchEnrollments)
    .where(and(eq(batchEnrollments.batchId, batchId), eq(batchEnrollments.studentId, studentId)));
  revalidatePath(`/admin/batches/${batchId}`);
  return { success: true };
}
