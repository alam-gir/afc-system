import { relations } from "drizzle-orm";
import {
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const batchMethod = pgEnum("batch_method", [
  "extensive",
  "intensive",
  "semi_intensive",
  "crash_course",
]);

// Open-ended lookup list (not a fixed enum) so admins can add new levels
// from the batch form without a schema migration.
export const batchLevels = pgTable("batch_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const batches = pgTable("batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalClasses: integer("total_classes").notNull(),
  durationPerClassHours: numeric("duration_per_class_hours", {
    precision: 4,
    scale: 2,
    mode: "number",
  }).notNull(),
  levelId: uuid("level_id")
    .notNull()
    .references(() => batchLevels.id, { onDelete: "restrict" }),
  method: batchMethod("method").notNull(),
  classRoom: text("class_room").notNull(),
  classTime: text("class_time").notNull(),
  description: text("description"),
  teacherId: uuid("teacher_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const batchEnrollments = pgTable(
  "batch_enrollments",
  {
    batchId: uuid("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.batchId, table.studentId] })],
);

export const batchesRelations = relations(batches, ({ one, many }) => ({
  teacher: one(users, { fields: [batches.teacherId], references: [users.id] }),
  level: one(batchLevels, { fields: [batches.levelId], references: [batchLevels.id] }),
  enrollments: many(batchEnrollments),
}));

export const batchEnrollmentsRelations = relations(batchEnrollments, ({ one }) => ({
  batch: one(batches, { fields: [batchEnrollments.batchId], references: [batches.id] }),
  student: one(users, { fields: [batchEnrollments.studentId], references: [users.id] }),
}));
