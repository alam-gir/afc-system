import { z } from "zod";
import { batchDocumentType } from "@/db/schema";

export const BATCH_DOCUMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const BATCH_DOCUMENT_ACCEPT = "application/pdf";

export const batchDocumentTypeSchema = z.enum(batchDocumentType.enumValues);
export type BatchDocumentType = z.infer<typeof batchDocumentTypeSchema>;

export const batchDocumentFileSchema = z
  .instanceof(File)
  .refine((file) => file.type === BATCH_DOCUMENT_ACCEPT, { message: "invalidFileType" })
  .refine((file) => file.size > 0 && file.size <= BATCH_DOCUMENT_MAX_SIZE_BYTES, {
    message: "fileTooLarge",
  });
