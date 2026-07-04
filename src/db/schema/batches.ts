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

export const batchLevel = pgEnum("batch_level", [
  "A1.1",
  "A1.2",
  "A2.1",
  "A2.2",
  "B1.1",
  "B1.2",
  "B2.1",
  "B2.2",
  "C1",
  "C2",
]);

export const batchMethod = pgEnum("batch_method", [
  "extensive",
  "intensive",
  "semi_intensive",
  "crash_course",
]);

export const batches = pgTable("batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalClasses: integer("total_classes").notNull(),
  durationPerClassHours: numeric("duration_per_class_hours", {
    precision: 4,
    scale: 2,
  }).notNull(),
  level: batchLevel("level").notNull(),
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
  enrollments: many(batchEnrollments),
}));

export const batchEnrollmentsRelations = relations(batchEnrollments, ({ one }) => ({
  batch: one(batches, { fields: [batchEnrollments.batchId], references: [batches.id] }),
  student: one(users, { fields: [batchEnrollments.studentId], references: [users.id] }),
}));
