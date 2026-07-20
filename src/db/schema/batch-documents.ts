import { relations } from "drizzle-orm";
import {
  customType,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { batches } from "./batches";
import { users } from "./users";

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const batchDocumentType = pgEnum("batch_document_type", ["course_plan", "calendar"]);

export const batchDocuments = pgTable(
  "batch_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    batchId: uuid("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    type: batchDocumentType("type").notNull(),
    fileData: bytea("file_data").notNull(),
    fileSize: integer("file_size").notNull(),
    uploadedById: uuid("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("batch_documents_batch_id_type_idx").on(table.batchId, table.type)],
);

export const batchDocumentsRelations = relations(batchDocuments, ({ one }) => ({
  batch: one(batches, { fields: [batchDocuments.batchId], references: [batches.id] }),
  uploadedBy: one(users, { fields: [batchDocuments.uploadedById], references: [users.id] }),
}));
