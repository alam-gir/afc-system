import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { DocumentViewerHeader } from "@/components/documents/document-viewer-header";
import { canAccessBatchDocument } from "@/lib/batch-document-access";
import { getBatchDocumentMeta } from "@/lib/queries/batch-documents";
import { isUuid } from "@/lib/is-uuid";
import type { UserRole } from "@/types/next-auth";

export default async function DocumentViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const session = await auth();
  const locale = await getLocale();
  if (!session) redirect({ href: "/login", locale });

  const doc = await getBatchDocumentMeta(id);
  if (!doc) notFound();

  const allowed = await canAccessBatchDocument(
    session!.user.id,
    session!.user.role as UserRole,
    doc.batchId,
    doc.type,
  );
  if (!allowed) notFound();

  const t = await getTranslations("batchDocument");
  const tc = await getTranslations("common");

  return (
    <div className="flex h-svh flex-col">
      <DocumentViewerHeader
        appName={tc("appName")}
        title={t(doc.type)}
        backLabel={tc("back")}
      />
      <iframe
        src={`/api/batch-documents/${id}#toolbar=0&navpanes=0`}
        className="w-full flex-1 border-0"
        title={t(doc.type)}
      />
    </div>
  );
}
