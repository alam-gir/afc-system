import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessBatchDocument } from "@/lib/batch-document-access";
import { getBatchDocumentFile } from "@/lib/queries/batch-documents";
import { isUuid } from "@/lib/is-uuid";
import type { UserRole } from "@/types/next-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return new NextResponse(null, { status: 404 });

  const session = await auth();
  if (!session) return new NextResponse(null, { status: 401 });

  const doc = await getBatchDocumentFile(id);
  if (!doc) return new NextResponse(null, { status: 404 });

  const allowed = await canAccessBatchDocument(
    session.user.id,
    session.user.role as UserRole,
    doc.batchId,
    doc.type,
  );
  if (!allowed) return new NextResponse(null, { status: 403 });

  return new NextResponse(new Uint8Array(doc.fileData), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "frame-ancestors 'self'",
    },
  });
}
