"use server";

import { and, asc, eq, ilike, notInArray, or } from "drizzle-orm";
import { db } from "@/db";
import { batchEnrollments, users } from "@/db/schema";
import { assertRole } from "@/lib/actions/assert-role";
import type { UserRole } from "@/types/next-auth";

export type UserSearchResult = { id: string; name: string; loginId: string; email: string };

/**
 * Search teachers or students by name/ID for picker dialogs (assign teacher, add student to batch).
 * When `excludeBatchId` is set for students, already-enrolled students are left out of the results.
 */
export async function searchUsersByRole(
  role: Extract<UserRole, "teacher" | "student">,
  query: string,
  excludeBatchId?: string,
): Promise<UserSearchResult[]> {
  await assertRole("admin");

  const conditions = [eq(users.role, role)];
  if (query.trim()) {
    conditions.push(
      or(ilike(users.name, `%${query}%`), ilike(users.loginId, `%${query}%`))!,
    );
  }

  if (role === "student" && excludeBatchId) {
    const enrolled = await db
      .select({ id: batchEnrollments.studentId })
      .from(batchEnrollments)
      .where(eq(batchEnrollments.batchId, excludeBatchId));
    const enrolledIds = enrolled.map((row) => row.id);
    if (enrolledIds.length > 0) {
      conditions.push(notInArray(users.id, enrolledIds));
    }
  }

  return db
    .select({ id: users.id, name: users.name, loginId: users.loginId, email: users.email })
    .from(users)
    .where(and(...conditions))
    .orderBy(asc(users.name))
    .limit(20);
}
