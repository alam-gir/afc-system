import { and, count, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { batches, users } from "@/db/schema";

export async function getAdminDashboardStats() {
  const today = new Date().toISOString().slice(0, 10);

  const [totalBatchesResult, totalTeachersResult, totalStudentsResult, activeBatchesResult] =
    await Promise.all([
      db.select({ value: count() }).from(batches),
      db.select({ value: count() }).from(users).where(eq(users.role, "teacher")),
      db.select({ value: count() }).from(users).where(eq(users.role, "student")),
      db
        .select({ value: count() })
        .from(batches)
        .where(and(lte(batches.startDate, today), gte(batches.endDate, today))),
    ]);

  return {
    totalBatches: totalBatchesResult[0].value,
    totalTeachers: totalTeachersResult[0].value,
    totalStudents: totalStudentsResult[0].value,
    activeBatches: activeBatchesResult[0].value,
  };
}
