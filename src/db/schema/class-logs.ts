import { relations } from "drizzle-orm";
import { boolean, date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { batches } from "./batches";
import { users } from "./users";

export const classLogs = pgTable("class_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  batchId: uuid("batch_id")
    .notNull()
    .references(() => batches.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  // Whether the teacher followed the batch's uploaded calendar for this class.
  // Defaults true so pre-existing logs (recorded before this field existed) aren't
  // misrepresented as a flagged deviation.
  followedCalendar: boolean("followed_calendar").notNull().default(true),
  // Required, and only meaningful, when followedCalendar is false.
  calendarDeviationReason: text("calendar_deviation_reason"),
  summary: text("summary"),
  chapter: text("chapter"),
  lessons: text("lessons"),
  pages: text("pages"),
  activities: text("activities"),
  learningObjectives: text("learning_objectives"),
  vocabulary: text("vocabulary"),
  grammar: text("grammar"),
  // The teacher who actually conducted the class, if they exist in the system.
  teacherId: uuid("teacher_id").references(() => users.id, { onDelete: "set null" }),
  // Free-text name, set by an admin, when a substitute outside the system took the class.
  substituteTeacherName: text("substitute_teacher_name"),
  // Who authored this log entry (teacher self-logging, or an admin on someone's behalf).
  // Drives the 24h teacher-edit-window check. Nullable so the author can be hard-deleted
  // later without blocking on this historical record.
  createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const classLogsRelations = relations(classLogs, ({ one }) => ({
  batch: one(batches, { fields: [classLogs.batchId], references: [batches.id] }),
  teacher: one(users, { fields: [classLogs.teacherId], references: [users.id] }),
  createdBy: one(users, { fields: [classLogs.createdByUserId], references: [users.id] }),
}));
