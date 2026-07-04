"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { batches, classLogs } from "@/db/schema";
import { isWithinClassLogEditWindow } from "@/lib/class-log-edit-window";
import {
  adminClassLogSchema,
  classLogFieldsSchema,
  type ClassLogFieldsInput,
} from "@/lib/validations/class-log";

type ActionResult = { success: true; id: string } | { success: false; error: string };
type SimpleResult = { success: true } | { success: false; error: string };

function toContentValues(input: ClassLogFieldsInput) {
  return {
    date: input.date,
    summary: input.summary || null,
    chapter: input.chapter || null,
    lessons: input.lessons || null,
    pages: input.pages || null,
    activities: input.activities || null,
    learningObjectives: input.learningObjectives || null,
    vocabulary: input.vocabulary || null,
    grammar: input.grammar || null,
  };
}

function revalidateBatchPaths(batchId: string) {
  revalidatePath(`/admin/batches/${batchId}`);
  revalidatePath(`/teacher/batches/${batchId}`);
  revalidatePath(`/student/batches/${batchId}`);
}

export async function createClassLog(
  batchId: string,
  input: ClassLogFieldsInput & { teacherName?: string },
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "unauthenticated" };

  if (session.user.role === "admin") {
    const parsed = adminClassLogSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "invalidInput" };

    const [created] = await db
      .insert(classLogs)
      .values({
        batchId,
        ...toContentValues(parsed.data),
        teacherId: null,
        substituteTeacherName: parsed.data.teacherName,
        createdByUserId: session.user.id,
      })
      .returning({ id: classLogs.id });

    revalidateBatchPaths(batchId);
    return { success: true, id: created.id };
  }

  if (session.user.role === "teacher") {
    const parsed = classLogFieldsSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "invalidInput" };

    const [batch] = await db.select().from(batches).where(eq(batches.id, batchId)).limit(1);
    if (!batch || batch.teacherId !== session.user.id) {
      return { success: false, error: "notAssignedToBatch" };
    }

    const [created] = await db
      .insert(classLogs)
      .values({
        batchId,
        ...toContentValues(parsed.data),
        teacherId: session.user.id,
        substituteTeacherName: null,
        createdByUserId: session.user.id,
      })
      .returning({ id: classLogs.id });

    revalidateBatchPaths(batchId);
    return { success: true, id: created.id };
  }

  return { success: false, error: "forbidden" };
}

export async function updateClassLog(
  logId: string,
  input: ClassLogFieldsInput,
): Promise<SimpleResult> {
  const session = await auth();
  if (!session) return { success: false, error: "unauthenticated" };

  const [log] = await db.select().from(classLogs).where(eq(classLogs.id, logId)).limit(1);
  if (!log) return { success: false, error: "notFound" };

  if (session.user.role === "teacher") {
    if (log.createdByUserId !== session.user.id) {
      return { success: false, error: "notYourLog" };
    }
    if (!isWithinClassLogEditWindow(log.createdAt)) {
      return { success: false, error: "editWindowExpired" };
    }
  } else if (session.user.role !== "admin") {
    return { success: false, error: "forbidden" };
  }

  const parsed = classLogFieldsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "invalidInput" };

  await db
    .update(classLogs)
    .set({ ...toContentValues(parsed.data), updatedAt: new Date() })
    .where(eq(classLogs.id, logId));

  revalidateBatchPaths(log.batchId);
  return { success: true };
}

export async function deleteClassLog(logId: string): Promise<SimpleResult> {
  const session = await auth();
  if (!session) return { success: false, error: "unauthenticated" };

  const [log] = await db.select().from(classLogs).where(eq(classLogs.id, logId)).limit(1);
  if (!log) return { success: false, error: "notFound" };

  if (session.user.role === "teacher") {
    if (log.createdByUserId !== session.user.id) {
      return { success: false, error: "notYourLog" };
    }
    if (!isWithinClassLogEditWindow(log.createdAt)) {
      return { success: false, error: "editWindowExpired" };
    }
  } else if (session.user.role !== "admin") {
    return { success: false, error: "forbidden" };
  }

  await db.delete(classLogs).where(eq(classLogs.id, logId));
  revalidateBatchPaths(log.batchId);
  return { success: true };
}
