import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { batchDocuments } from "@/db/schema";
import { pgConstraintName } from "@/lib/db-errors";
import { isUuid } from "@/lib/is-uuid";
import {
  batchDocumentFileSchema,
  batchDocumentTypeSchema,
} from "@/lib/validations/batch-document";

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const batchId = formData.get("batchId");
  if (typeof batchId !== "string" || !isUuid(batchId)) {
    return NextResponse.json({ success: false, error: "invalidInput" }, { status: 400 });
  }

  const parsedType = batchDocumentTypeSchema.safeParse(formData.get("type"));
  if (!parsedType.success) {
    return NextResponse.json({ success: false, error: "invalidInput" }, { status: 400 });
  }

  const parsedFile = batchDocumentFileSchema.safeParse(formData.get("file"));
  if (!parsedFile.success) {
    const error = parsedFile.error.issues[0]?.message ?? "invalidInput";
    return NextResponse.json({ success: false, error }, { status: 400 });
  }

  const fileData = Buffer.from(await parsedFile.data.arrayBuffer());
  const type = parsedType.data;

  async function upsert(uploadedById: string | null) {
    await db
      .insert(batchDocuments)
      .values({ batchId: batchId as string, type, fileData, fileSize: fileData.byteLength, uploadedById })
      .onConflictDoUpdate({
        target: [batchDocuments.batchId, batchDocuments.type],
        set: { fileData, fileSize: fileData.byteLength, uploadedById, uploadedAt: new Date() },
      });
  }

  try {
    await upsert(session.user.id);
  } catch (error) {
    const constraint = pgConstraintName(error);

    if (constraint === "batch_documents_uploaded_by_id_users_id_fk") {
      // A stale session can reference a user id that no longer exists (e.g.
      // the account was recreated) - attribution is best-effort, so drop it
      // instead of failing the whole upload.
      await upsert(null);
    } else if (constraint === "batch_documents_batch_id_batches_id_fk") {
      return NextResponse.json({ success: false, error: "batchNotFound" }, { status: 404 });
    } else {
      throw error;
    }
  }

  revalidatePath(`/admin/batches/${batchId}`);
  revalidatePath(`/teacher/batches/${batchId}`);
  revalidatePath(`/student/batches/${batchId}`);

  return NextResponse.json({ success: true });
}
