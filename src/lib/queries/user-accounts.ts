import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { UserRole } from "@/types/next-auth";

export const USER_ACCOUNTS_PAGE_SIZE = 20;

export async function listUserAccounts(
  role: Extract<UserRole, "teacher" | "student">,
  opts: { page: number; search?: string },
) {
  const { page, search } = opts;

  const whereClause = search
    ? and(
        eq(users.role, role),
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.loginId, `%${search}%`),
          ilike(users.email, `%${search}%`),
        ),
      )
    : eq(users.role, role);

  const [{ value: total }] = await db.select({ value: count() }).from(users).where(whereClause);

  const items = await db
    .select({
      id: users.id,
      loginId: users.loginId,
      name: users.name,
      email: users.email,
      phone: users.phone,
      description: users.description,
    })
    .from(users)
    .where(whereClause)
    .orderBy(asc(users.name))
    .limit(USER_ACCOUNTS_PAGE_SIZE)
    .offset((page - 1) * USER_ACCOUNTS_PAGE_SIZE);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / USER_ACCOUNTS_PAGE_SIZE)) };
}
