export type UploadItemType = "image" | "file";

export interface UploadConstraint {
  maxSizeBytes: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
}

export const UPLOAD_CONSTRAINTS: Record<UploadItemType, UploadConstraint> = {
  image: {
    maxSizeBytes: 5 * 1024 * 1024,
    allowedExtensions: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
    allowedMimeTypes: [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
  },
  file: {
    maxSizeBytes: 10 * 1024 * 1024,
    allowedExtensions: [
      ".pdf",
      ".txt",
      ".md",
      ".json",
      ".yaml",
      ".yml",
      ".xml",
      ".csv",
      ".toml",
      ".ini",
    ],
    allowedMimeTypes: [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/json",
      "application/x-yaml",
      "text/yaml",
      "application/xml",
      "text/xml",
      "text/csv",
      "application/toml",
    ],
  },
};

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
}

export function parseUploadItemType(value: string): UploadItemType | null {
  if (value === "image" || value === "file") return value;
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateUploadFile(
  file: { name: string; size: number; type: string },
  itemType: UploadItemType
): { valid: true } | { valid: false; error: string } {
  const constraints = UPLOAD_CONSTRAINTS[itemType];
  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();

  if (!constraints.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file extension for ${itemType}.`,
    };
  }

  if (!constraints.allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported MIME type for ${itemType}.`,
    };
  }

  if (file.size > constraints.maxSizeBytes) {
    return {
      valid: false,
      error: `${itemType === "image" ? "Image" : "File"} is too large. Max size is ${formatBytes(constraints.maxSizeBytes)}.`,
    };
  }

  return { valid: true };
}

export function getAcceptValue(itemType: UploadItemType): string {
  const constraints = UPLOAD_CONSTRAINTS[itemType];
  return constraints.allowedExtensions.join(",");
}
