import {
  Download,
  File,
  FileCode2,
  FileJson,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { formatBytes } from "@/lib/upload-constraints";

interface FileListRowProps {
  id: string;
  title: string;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
  fileUrl: string | null;
  onOpen?: () => void;
}

export function FileListRow({
  id,
  title,
  fileName,
  fileSize,
  createdAt,
  fileUrl,
  onOpen,
}: FileListRowProps) {
  const extension = getFileExtension(fileName);
  const { Icon, iconClassName, iconWrapperClassName } = getIconForExtension(extension);

  function handleDownload(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (!fileUrl) return;
    window.open(`/api/items/download/${id}?download=1`, "_blank", "noopener,noreferrer");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!onOpen) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      className="group flex w-full items-start gap-3 rounded-xl border border-border/70 bg-card px-3 py-3 text-left transition-colors hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:items-center sm:gap-4 sm:px-4"
    >
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${iconWrapperClassName}`}
      >
        <Icon className={`size-4 ${iconClassName}`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground" title={fileName ?? title}>
          {fileName ?? title}
        </p>
        <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
          <span>{fileSize !== null ? formatBytes(fileSize) : "Unknown size"}</span>
          <span suppressHydrationWarning>Uploaded {formatUploadDate(createdAt)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={!fileUrl}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download className="size-3.5" />
        Download
      </button>
    </div>
  );
}

function getFileExtension(fileName: string | null): string {
  if (!fileName) return "";
  const parts = fileName.split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
}

function getIconForExtension(extension: string): {
  Icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  iconWrapperClassName: string;
} {
  if (["txt", "md", "pdf"].includes(extension)) {
    return {
      Icon: FileText,
      iconClassName: "text-sky-300",
      iconWrapperClassName: "border-sky-400/25 bg-sky-500/10",
    };
  }

  if (extension === "json") {
    return {
      Icon: FileJson,
      iconClassName: "text-emerald-300",
      iconWrapperClassName: "border-emerald-400/25 bg-emerald-500/10",
    };
  }

  if (["yaml", "yml", "xml", "toml", "ini"].includes(extension)) {
    return {
      Icon: FileCode2,
      iconClassName: "text-violet-300",
      iconWrapperClassName: "border-violet-400/25 bg-violet-500/10",
    };
  }

  if (extension === "csv") {
    return {
      Icon: FileSpreadsheet,
      iconClassName: "text-amber-300",
      iconWrapperClassName: "border-amber-400/25 bg-amber-500/10",
    };
  }

  return {
    Icon: File,
    iconClassName: "text-zinc-300",
    iconWrapperClassName: "border-zinc-400/25 bg-zinc-500/10",
  };
}

function formatUploadDate(dateString: string): string {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}