import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { batchEnrollments, batchLevels, batches, users } from "@/db/schema";

export const BATCHES_PAGE_SIZE = 20;

export async function listBatches(opts: { page: number; search?: string }) {
  const { page, search } = opts;
  const whereClause = search ? ilike(batches.name, `%${search}%`) : undefined;

  const [{ value: total }] = await db.select({ value: count() }).from(batches).where(whereClause);

  const items = await db
    .select({
      id: batches.id,
      name: batches.name,
      startDate: batches.startDate,
      endDate: batches.endDate,
      levelName: batchLevels.name,
      method: batches.method,
      classRoom: batches.classRoom,
      classTime: batches.classTime,
      teacherName: users.name,
    })
    .from(batches)
    .innerJoin(batchLevels, eq(batches.levelId, batchLevels.id))
    .leftJoin(users, eq(batches.teacherId, users.id))
    .where(whereClause)
    .orderBy(desc(batches.startDate))
    .limit(BATCHES_PAGE_SIZE)
    .offset((page - 1) * BATCHES_PAGE_SIZE);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / BATCHES_PAGE_SIZE)) };
}

export async function getBatchWithTeacher(id: string) {
  const [row] = await db
    .select({ batch: batches, teacher: users, levelName: batchLevels.name })
    .from(batches)
    .innerJoin(batchLevels, eq(batches.levelId, batchLevels.id))
    .leftJoin(users, eq(batches.teacherId, users.id))
    .where(eq(batches.id, id))
    .limit(1);
  return row;
}

export async function listEnrolledStudents(batchId: string) {
  return db
    .select({ id: users.id, loginId: users.loginId, name: users.name, email: users.email })
    .from(batchEnrollments)
    .innerJoin(users, eq(batchEnrollments.studentId, users.id))
    .where(eq(batchEnrollments.batchId, batchId))
    .orderBy(asc(users.name));
}

export async function listTeacherBatches(teacherId: string) {
  return db
    .select({
      id: batches.id,
      name: batches.name,
      startDate: batches.startDate,
      endDate: batches.endDate,
      levelName: batchLevels.name,
      classRoom: batches.classRoom,
      classTime: batches.classTime,
    })
    .from(batches)
    .innerJoin(batchLevels, eq(batches.levelId, batchLevels.id))
    .where(eq(batches.teacherId, teacherId))
    .orderBy(desc(batches.startDate));
}

export async function listStudentBatches(studentId: string) {
  return db
    .select({
      batch: batches,
      teacherName: users.name,
      levelName: batchLevels.name,
    })
    .from(batchEnrollments)
    .innerJoin(batches, eq(batchEnrollments.batchId, batches.id))
    .innerJoin(batchLevels, eq(batches.levelId, batchLevels.id))
    .leftJoin(users, eq(batches.teacherId, users.id))
    .where(eq(batchEnrollments.studentId, studentId))
    .orderBy(desc(batches.startDate));
}

export async function getBatchForStudent(batchId: string, studentId: string) {
  const [row] = await db
    .select({ batch: batches, teacher: users, levelName: batchLevels.name })
    .from(batchEnrollments)
    .innerJoin(batches, eq(batchEnrollments.batchId, batches.id))
    .innerJoin(batchLevels, eq(batches.levelId, batchLevels.id))
    .leftJoin(users, eq(batches.teacherId, users.id))
    .where(and(eq(batchEnrollments.batchId, batchId), eq(batchEnrollments.studentId, studentId)))
    .limit(1);
  return row;
}
