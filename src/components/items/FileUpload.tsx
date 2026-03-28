"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Upload, X, File as FileIcon, Image as ImageIcon } from "lucide-react";
import {
  formatBytes,
  getAcceptValue,
  type UploadItemType,
  validateUploadFile,
} from "@/lib/upload-constraints";
import { cn } from "@/lib/utils";

export interface UploadedFileMeta {
  key: string;
  fileName: string;
  fileSize: number;
  publicUrl: string | null;
}

interface FileUploadProps {
  itemType: UploadItemType;
  value: UploadedFileMeta | null;
  onChange: (value: UploadedFileMeta | null) => void;
  disabled?: boolean;
}

export function FileUpload({ itemType, value, onChange, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const accept = useMemo(() => getAcceptValue(itemType), [itemType]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function uploadFile(file: File) {
    setError(null);

    const validation = validateUploadFile(file, itemType);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (itemType === "image") {
      setPreviewUrl(URL.createObjectURL(file));
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("itemType", itemType);
    formData.append("file", file);

    const result = await uploadWithProgress(formData, setProgress);

    setUploading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onChange({
      key: result.data.key,
      fileName: result.data.fileName,
      fileSize: result.data.fileSize,
      publicUrl: result.data.publicUrl,
    });
  }

  function handleFileSelection(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    void uploadFile(fileList[0]);
  }

  function clearUpload() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    setProgress(0);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => handleFileSelection(e.target.files)}
      />

      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled || uploading) return;
          handleFileSelection(e.dataTransfer.files);
        }}
        className={cn(
          "w-full rounded-xl border border-dashed p-5 text-left transition-colors",
          dragging
            ? "border-zinc-500 bg-zinc-800/60"
            : "border-zinc-700/70 bg-zinc-900/35 hover:border-zinc-600",
          (disabled || uploading) && "cursor-not-allowed opacity-70"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-md bg-zinc-800/80 p-2 text-zinc-300">
            {itemType === "image" ? (
              <ImageIcon className="size-4" />
            ) : (
              <FileIcon className="size-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-100">
              {itemType === "image" ? "Upload image" : "Upload file"}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Drag and drop or click to choose a {itemType}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {itemType === "image" ? "Max 5 MB" : "Max 10 MB"}
            </p>
          </div>

          <Upload className="size-4 text-zinc-400" />
        </div>
      </button>

      {uploading && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" />
              Uploading...
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {value && !uploading && (
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">
                {value.fileName}
              </p>
              <p className="text-xs text-zinc-400">{formatBytes(value.fileSize)}</p>
            </div>
            <button
              type="button"
              onClick={clearUpload}
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              aria-label="Remove uploaded file"
            >
              <X className="size-4" />
            </button>
          </div>

          {itemType === "image" && previewUrl && (
            <div className="relative mt-3 h-56 overflow-hidden rounded-md border border-zinc-800/60">
              <Image
                src={previewUrl}
                alt={value.fileName}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 512px"
                className="object-contain"
              />
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

type UploadResult =
  | {
      success: true;
      data: {
        key: string;
        fileName: string;
        fileSize: number;
        publicUrl: string | null;
      };
    }
  | { success: false; error: string };

function uploadWithProgress(
  formData: FormData,
  onProgress: (progress: number) => void
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/items/upload");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const progress = (event.loaded / event.total) * 100;
      onProgress(progress);
    };

    xhr.onerror = () => {
      resolve({ success: false, error: "Upload failed. Please try again." });
    };

    xhr.onload = () => {
      let payload: unknown = null;
      try {
        payload = JSON.parse(xhr.responseText) as unknown;
      } catch {
        resolve({ success: false, error: "Invalid upload response." });
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        const response = payload as {
          key?: string;
          fileName?: string;
          fileSize?: number;
          publicUrl?: string | null;
        };

        if (!response.key || !response.fileName || typeof response.fileSize !== "number") {
          resolve({ success: false, error: "Upload response is missing fields." });
          return;
        }

        resolve({
          success: true,
          data: {
            key: response.key,
            fileName: response.fileName,
            fileSize: response.fileSize,
            publicUrl:
              typeof response.publicUrl === "string" || response.publicUrl === null
                ? response.publicUrl
                : null,
          },
        });
        return;
      }

      const errorPayload = payload as { error?: string };
      resolve({
        success: false,
        error: errorPayload.error ?? "Upload failed.",
      });
    };

    xhr.send(formData);
  });
}
