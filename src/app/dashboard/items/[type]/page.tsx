import { notFound } from "next/navigation";
import { getAuthUserId } from "@/lib/auth-utils";
import { getItemsByType } from "@/lib/db/items";
import { ItemsListView } from "@/components/items/ItemsListView";
import { iconMap } from "@/lib/icons";

const typeSlugToName: Record<string, string> = {
  snippets: "snippet",
  prompts: "prompt",
  commands: "command",
  notes: "note",
  files: "file",
  images: "image",
  links: "link",
};

const typeDisplayNames: Record<string, string> = {
  snippet: "Snippets",
  prompt: "Prompts",
  command: "Commands",
  note: "Notes",
  file: "Files",
  image: "Images",
  link: "Links",
};

export default async function ItemsTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: slug } = await params;
  const typeName = typeSlugToName[slug];

  if (!typeName) {
    notFound();
  }

  const userId = await getAuthUserId();
  const items = await getItemsByType(userId, typeName);

  const displayName = typeDisplayNames[typeName] ?? typeName;
  const typeInfo = items[0]?.type;
  const iconName = typeInfo?.icon;
  const typeColor = typeInfo?.color;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center gap-3">
        {iconName && iconMap[iconName] && (
          <div
            className="flex size-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${typeColor}20` }}
          >
            {(() => {
              const Icon = iconMap[iconName];
              return <Icon className="size-5" style={{ color: typeColor }} />;
            })()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      <ItemsListView items={items} typeName={displayName} typeKey={typeName} />
    </div>
  );
}
