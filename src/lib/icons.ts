import type { LucideProps } from "lucide-react";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link as LinkIcon,
  File,
  Image,
} from "lucide-react";

export const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: LinkIcon,
  File,
  Image,
};

export const typeColorMap: Record<string, string> = {
  snippet: "#3b82f6", // Blue
  prompt: "#8b5cf6", // Purple
  command: "#f97316", // Orange
  note: "#fde047", // Yellow
  file: "#6b7280", // Gray
  image: "#ec4899", // Fuchsia
  link: "#10b981", // Green/Emerald
};
