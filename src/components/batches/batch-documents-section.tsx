"use client";

import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { FileText, MoreVertical, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FormDialog } from "@/components/form-dialog";
import { deleteBatchDocument } from "@/lib/actions/batch-documents";
import {
  BATCH_DOCUMENT_ACCEPT,
  BATCH_DOCUMENT_MAX_SIZE_BYTES,
  type BatchDocumentType,
} from "@/lib/validations/batch-document";

export type BatchDocumentRow = {
  id: string;
  type: BatchDocumentType;
};

type BatchDocumentsSectionProps = {
  batchId: string;
  documents: BatchDocumentRow[];
  types: BatchDocumentType[];
  editable?: boolean;
};

export function BatchDocumentsSection({
  batchId,
  documents,
  types,
  editable,
}: BatchDocumentsSectionProps) {
  const t = useTranslations("batchDocument");
  const tc = useTranslations("common");
  const router = useRouter();
  const [uploadTarget, setUploadTarget] = useState<BatchDocumentType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BatchDocumentType | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletePending(true);
    try {
      const result = await deleteBatchDocument(batchId, deleteTarget);
      if (result.success) {
        toast.success(t("deleteSuccess"));
        router.refresh();
        setDeleteTarget(null);
      } else {
        toast.error(tc("somethingWentWrong"));
      }
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <div className={`grid gap-3 ${types.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
      {types.map((type) => {
        const doc = documents.find((d) => d.type === type);
        return (
          <div key={type}>
            {doc ? (
              <Card
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/documents/${doc.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/documents/${doc.id}`);
                  }
                }}
                className="cursor-pointer transition-colors hover:bg-accent/50"
              >
                <CardHeader className="flex flex-row items-center gap-2">
                  <FileText className="size-4.5 shrink-0 text-primary" />
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{t(type)}</p>
                  {editable ? (
                    <CardAction
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={tc("actions")}
                          >
                            <MoreVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onSelect={() => setUploadTarget(type)}>
                            <Pencil />
                            <span className="whitespace-nowrap">{t("update")}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeleteTarget(type)}
                          >
                            <Trash2 />
                            <span className="whitespace-nowrap">{tc("delete")}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardAction>
                  ) : null}
                </CardHeader>
              </Card>
            ) : editable ? (
              <Button
                type="button"
                variant="outline"
                className="h-auto w-full py-3"
                onClick={() => setUploadTarget(type)}
              >
                <Plus />
                {t(type === "course_plan" ? "addCoursePlan" : "addCalendar")}
              </Button>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <FileText className="size-4.5 shrink-0 text-muted-foreground" />
                  <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    {t("notUploaded", { type: t(type) })}
                  </p>
                </CardHeader>
              </Card>
            )}
          </div>
        );
      })}

      <FormDialog
        open={!!uploadTarget}
        onOpenChange={(open) => !open && setUploadTarget(null)}
        title={uploadTarget ? t(uploadTarget) : ""}
      >
        {uploadTarget ? (
          <BatchDocumentUploadForm
            batchId={batchId}
            type={uploadTarget}
            onCancel={() => setUploadTarget(null)}
            onSuccess={() => {
              setUploadTarget(null);
              router.refresh();
            }}
          />
        ) : null}
      </FormDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tc("delete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction disabled={deletePending} onClick={handleDelete}>
              {tc("yes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BatchDocumentUploadForm({
  batchId,
  type,
  onCancel,
  onSuccess,
}: {
  batchId: string;
  type: BatchDocumentType;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("batchDocument");
  const tc = useTranslations("common");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  function validate(next: File) {
    if (next.type !== BATCH_DOCUMENT_ACCEPT) return t("invalidFileType");
    if (next.size > BATCH_DOCUMENT_MAX_SIZE_BYTES) return t("fileTooLarge");
    return null;
  }

  function selectFile(next: File) {
    setFile(next);
    setError(validate(next));
  }

  function uploadWithProgress(formData: FormData) {
    return new Promise<{ success: boolean; error?: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open("POST", "/api/batch-documents/upload");
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("parseError"));
        }
      };
      xhr.onerror = () => reject(new Error("networkError"));
      xhr.onabort = () => reject(new Error("aborted"));
      xhr.send(formData);
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file || error) return;

    setPending(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.set("batchId", batchId);
      formData.set("type", type);
      formData.set("file", file);

      const result = await uploadWithProgress(formData);
      if (result.success) {
        toast.success(t("uploadSuccess"));
        onSuccess();
      } else if (result.error === "invalidFileType" || result.error === "fileTooLarge") {
        setError(t(result.error));
      } else {
        setError(tc("somethingWentWrong"));
      }
    } catch (err) {
      if (!(err instanceof Error && err.message === "aborted")) {
        setError(tc("somethingWentWrong"));
      }
    } finally {
      xhrRef.current = null;
      setPending(false);
      setProgress(null);
    }
  }

  function handleCancel() {
    if (pending) {
      xhrRef.current?.abort();
      return;
    }
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <FileDropzone
          file={file}
          disabled={pending}
          onSelect={selectFile}
          onClear={() => {
            setFile(null);
            setError(null);
          }}
        />
        {progress !== null ? (
          <div className="flex items-center gap-2">
            <Progress value={progress} className="flex-1" />
            <span className="w-10 text-right text-xs text-muted-foreground">{progress}%</span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("uploadHint")}</p>
        )}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button type="button" variant="outline" size="lg" onClick={handleCancel}>
          {tc("cancel")}
        </Button>
        <Button type="submit" size="lg" disabled={!file || !!error || pending}>
          {tc("save")}
        </Button>
      </div>
    </form>
  );
}

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function FileDropzone({
  file,
  disabled,
  onSelect,
  onClear,
}: {
  file: File | null;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  const t = useTranslations("batchDocument");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onSelect(dropped);
  }

  if (file) {
    return (
      <div className="flex items-center gap-2 rounded-md border p-3">
        <FileText className="size-4.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("removeFile")}
          disabled={disabled}
          onClick={onClear}
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        isDragOver ? "border-primary bg-accent/50" : "border-input hover:bg-accent/30",
      )}
    >
      <Upload className="size-6 text-muted-foreground" />
      <p className="text-sm font-medium">{t("browseOrDrop")}</p>
      <input
        ref={inputRef}
        type="file"
        accept={BATCH_DOCUMENT_ACCEPT}
        disabled={disabled}
        className="hidden"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const next = event.target.files?.[0];
          if (next) onSelect(next);
        }}
      />
    </div>
  );
}
