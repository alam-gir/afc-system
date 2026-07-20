"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { batchDocuments } from "@/db/schema";
import { assertRole } from "@/lib/actions/assert-role";
import type { BatchDocumentType } from "@/lib/validations/batch-document";

type SimpleResult = { success: true } | { success: false; error: string };

export async function deleteBatchDocument(
  batchId: string,
  type: BatchDocumentType,
): Promise<SimpleResult> {
  await assertRole("admin");

  await db
    .delete(batchDocuments)
    .where(and(eq(batchDocuments.batchId, batchId), eq(batchDocuments.type, type)));

  revalidatePath(`/admin/batches/${batchId}`);
  revalidatePath(`/teacher/batches/${batchId}`);
  revalidatePath(`/student/batches/${batchId}`);
  return { success: true };
}
