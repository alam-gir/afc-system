import { and, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { classLogs, users } from "@/db/schema";

export const CLASS_LOGS_PAGE_SIZE = 20;

export async function listClassLogs(
  batchId: string,
  opts: { page: number; search?: string; dateFrom?: string; dateTo?: string },
) {
  const { page, search, dateFrom, dateTo } = opts;

  const conditions = [eq(classLogs.batchId, batchId)];
  if (search) {
    conditions.push(
      or(
        ilike(classLogs.summary, `%${search}%`),
        ilike(classLogs.chapter, `%${search}%`),
        ilike(classLogs.lessons, `%${search}%`),
        ilike(classLogs.vocabulary, `%${search}%`),
        ilike(classLogs.grammar, `%${search}%`),
      )!,
    );
  }
  if (dateFrom) conditions.push(gte(classLogs.date, dateFrom));
  if (dateTo) conditions.push(lte(classLogs.date, dateTo));

  const whereClause = and(...conditions);

  const [{ value: total }] = await db.select({ value: count() }).from(classLogs).where(whereClause);

  const items = await db
    .select({
      id: classLogs.id,
      date: classLogs.date,
      followedCalendar: classLogs.followedCalendar,
      calendarDeviationReason: classLogs.calendarDeviationReason,
      summary: classLogs.summary,
      chapter: classLogs.chapter,
      lessons: classLogs.lessons,
      pages: classLogs.pages,
      activities: classLogs.activities,
      learningObjectives: classLogs.learningObjectives,
      vocabulary: classLogs.vocabulary,
      grammar: classLogs.grammar,
      teacherId: classLogs.teacherId,
      teacherName: users.name,
      substituteTeacherName: classLogs.substituteTeacherName,
      createdByUserId: classLogs.createdByUserId,
      createdAt: classLogs.createdAt,
    })
    .from(classLogs)
    .leftJoin(users, eq(classLogs.teacherId, users.id))
    .where(whereClause)
    .orderBy(desc(classLogs.date), desc(classLogs.createdAt))
    .limit(CLASS_LOGS_PAGE_SIZE)
    .offset((page - 1) * CLASS_LOGS_PAGE_SIZE);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / CLASS_LOGS_PAGE_SIZE)) };
}

export async function getClassLog(id: string) {
  const [log] = await db.select().from(classLogs).where(eq(classLogs.id, id)).limit(1);
  return log;
}
