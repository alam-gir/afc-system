import { eq } from "drizzle-orm";
import { db } from "@/db";
import { batchDocuments } from "@/db/schema";

export async function listBatchDocuments(batchId: string) {
  return db
    .select({
      id: batchDocuments.id,
      type: batchDocuments.type,
    })
    .from(batchDocuments)
    .where(eq(batchDocuments.batchId, batchId));
}

export async function getBatchDocumentMeta(id: string) {
  const [row] = await db
    .select({
      id: batchDocuments.id,
      batchId: batchDocuments.batchId,
      type: batchDocuments.type,
    })
    .from(batchDocuments)
    .where(eq(batchDocuments.id, id))
    .limit(1);
  return row;
}

export async function getBatchDocumentFile(id: string) {
  const [row] = await db
    .select({
      batchId: batchDocuments.batchId,
      type: batchDocuments.type,
      fileData: batchDocuments.fileData,
    })
    .from(batchDocuments)
    .where(eq(batchDocuments.id, id))
    .limit(1);
  return row;
}
