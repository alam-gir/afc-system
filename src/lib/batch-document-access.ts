import { getBatchForStudent, getBatchWithTeacher } from "@/lib/queries/batches";
import type { BatchDocumentType } from "@/lib/validations/batch-document";
import type { UserRole } from "@/types/next-auth";

/** Admin: always. Teacher: only their own assigned batch, both document types. Student: only their enrolled batch, course plan only. */
export async function canAccessBatchDocument(
  userId: string,
  role: UserRole,
  batchId: string,
  type: BatchDocumentType,
): Promise<boolean> {
  if (role === "admin") return true;

  if (role === "teacher") {
    const row = await getBatchWithTeacher(batchId);
    return row?.teacher?.id === userId;
  }

  if (role === "student") {
    if (type !== "course_plan") return false;
    const row = await getBatchForStudent(batchId, userId);
    return !!row;
  }

  return false;
}
