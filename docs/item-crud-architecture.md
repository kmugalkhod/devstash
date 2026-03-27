# Item CRUD Architecture

A unified CRUD system for all 7 item types using one dynamic route, shared components, and centralized server actions.

---

## File Structure

```
src/
├── actions/
│   └── items.ts              # All item mutations (create, update, delete, toggleFavorite, togglePin)
│
├── lib/
│   ├── db/
│   │   └── items.ts          # All item queries (existing + new: getItemsByType, getItemById)
│   ├── validations/
│   │   └── item.ts           # Zod schemas for item create/update
│   ├── icons.ts              # Icon name → Lucide component map (existing)
│   ├── prisma.ts             # Prisma client (existing)
│   └── auth-utils.ts         # getAuthUserId() (existing)
│
├── app/
│   └── dashboard/
│       └── items/
│           └── [type]/
│               └── page.tsx  # Dynamic route — server component, fetches items by type
│
├── components/
│   └── items/
│       ├── ItemsPageContent.tsx   # Client component: search, filters, grid/list toggle
│       ├── ItemCard.tsx           # Grid card (move from dashboard/, add click handler)
│       ├── ItemCardList.tsx       # List row (move from dashboard/, add click handler)
│       ├── ItemDrawer.tsx         # Slide-out sheet for view/edit/create
│       ├── ItemForm.tsx           # Create/edit form (adapts fields by content model)
│       ├── DeleteItemDialog.tsx   # Confirmation dialog for deletion
│       └── TagInput.tsx           # Tag autocomplete/creation input
```

---

## Routing: `/items/[type]`

### How It Works

A single dynamic route at `src/app/dashboard/items/[type]/page.tsx` handles all 7 item types.

The `[type]` param is the plural slug: `snippets`, `prompts`, `commands`, `notes`, `files`, `images`, `links`.

```typescript
// src/app/dashboard/items/[type]/page.tsx

import { getAuthUserId } from "@/lib/auth-utils";
import { getItemsByType, getSystemItemTypes } from "@/lib/db/items";
import { ItemsPageContent } from "@/components/items/ItemsPageContent";
import { notFound } from "next/navigation";

// Valid type slugs → singular DB names
const slugToType: Record<string, string> = {
  snippets: "snippet",
  prompts: "prompt",
  commands: "command",
  notes: "note",
  files: "file",
  images: "image",
  links: "link",
};

interface Props {
  params: Promise<{ type: string }>;
}

export default async function ItemsPage({ params }: Props) {
  const { type: slug } = await params;
  const typeName = slugToType[slug];
  if (!typeName) notFound();

  const userId = await getAuthUserId();
  const [items, itemTypes] = await Promise.all([
    getItemsByType(userId, typeName),
    getSystemItemTypes(),
  ]);

  const currentType = itemTypes.find((t) => t.name === typeName)!;

  return (
    <ItemsPageContent
      items={items}
      currentType={currentType}
      allTypes={itemTypes}
    />
  );
}
```

Sidebar links already point to `/items/snippets`, `/items/prompts`, etc. — this route catches them all.

---

## Data Fetching (lib/db/items.ts)

New query functions to add alongside existing ones:

```typescript
// ── New functions to add to src/lib/db/items.ts ──

/**
 * Fetch all items for a user filtered by type name.
 * Used by /items/[type] page.
 */
export async function getItemsByType(
  userId: string,
  typeName: string
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      itemType: { name: typeName, isSystem: true },
    },
    orderBy: [
      { isPinned: "desc" },
      { updatedAt: "desc" },
    ],
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return items.map(mapItem);
}

/**
 * Fetch a single item by ID (for drawer view/edit).
 * Includes collections for the "belongs to" display.
 */
export async function getItemById(
  itemId: string,
  userId: string
): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    include: {
      itemType: { select: { id: true, name: true, icon: true, color: true } },
      tags: { include: { tag: { select: { id: true, name: true } } } },
      collections: {
        include: { collection: { select: { id: true, name: true } } },
      },
    },
  });

  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    contentType: item.contentType,
    content: item.content,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    url: item.url,
    description: item.description,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    type: item.itemType,
    tags: item.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
    collections: item.collections.map((c) => ({
      id: c.collection.id,
      name: c.collection.name,
    })),
  };
}
```

### Key principle

All queries live in `lib/db/`. Server components call them directly. Client components never call Prisma — they use server actions for mutations and receive data via props.

---

## Mutations (actions/items.ts)

One file for all item mutations. Each action:
1. Validates auth via `getAuthUserId()`
2. Validates input with Zod
3. Performs the Prisma operation
4. Calls `revalidatePath()` to refresh cached data
5. Returns `{ success, data?, error? }` pattern

```typescript
// src/actions/items.ts
"use server";

import { getAuthUserId } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createItemSchema, updateItemSchema } from "@/lib/validations/item";

// ── Create ──────────────────────────────────────────────

export async function createItem(formData: {
  title: string;
  contentType: string;
  content?: string;
  url?: string;
  description?: string;
  language?: string;
  itemTypeId: string;
  tags?: string[];
  collectionIds?: string[];
}) {
  const userId = await getAuthUserId();
  const parsed = createItemSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { tags, collectionIds, ...data } = parsed.data;

  const item = await prisma.item.create({
    data: {
      ...data,
      userId,
      tags: tags?.length
        ? {
            create: tags.map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { name },
                  create: { name },
                },
              },
            })),
          }
        : undefined,
      collections: collectionIds?.length
        ? { create: collectionIds.map((id) => ({ collectionId: id })) }
        : undefined,
    },
  });

  revalidatePath("/dashboard");
  return { success: true, data: { id: item.id } };
}

// ── Update ──────────────────────────────────────────────

export async function updateItem(
  itemId: string,
  formData: {
    title?: string;
    content?: string;
    url?: string;
    description?: string;
    language?: string;
    tags?: string[];
  }
) {
  const userId = await getAuthUserId();
  const parsed = updateItemSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  // Verify ownership
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
  });
  if (!existing) return { success: false, error: "Item not found" };

  const { tags, ...data } = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.item.update({ where: { id: itemId }, data });

    if (tags !== undefined) {
      // Remove existing tag links, re-create
      await tx.tagsOnItems.deleteMany({ where: { itemId } });
      for (const name of tags) {
        const tag = await tx.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        });
        await tx.tagsOnItems.create({ data: { itemId, tagId: tag.id } });
      }
    }
  });

  revalidatePath("/dashboard");
  return { success: true };
}

// ── Delete ──────────────────────────────────────────────

export async function deleteItem(itemId: string) {
  const userId = await getAuthUserId();

  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
  });
  if (!item) return { success: false, error: "Item not found" };

  await prisma.item.delete({ where: { id: itemId } });

  revalidatePath("/dashboard");
  return { success: true };
}

// ── Toggle Favorite ─────────────────────────────────────

export async function toggleItemFavorite(itemId: string) {
  const userId = await getAuthUserId();

  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { isFavorite: true },
  });
  if (!item) return { success: false, error: "Item not found" };

  await prisma.item.update({
    where: { id: itemId },
    data: { isFavorite: !item.isFavorite },
  });

  revalidatePath("/dashboard");
  return { success: true, data: { isFavorite: !item.isFavorite } };
}

// ── Toggle Pin ──────────────────────────────────────────

export async function toggleItemPin(itemId: string) {
  const userId = await getAuthUserId();

  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { isPinned: true },
  });
  if (!item) return { success: false, error: "Item not found" };

  await prisma.item.update({
    where: { id: itemId },
    data: { isPinned: !item.isPinned },
  });

  revalidatePath("/dashboard");
  return { success: true, data: { isPinned: !item.isPinned } };
}
```

---

## Validation (lib/validations/item.ts)

```typescript
import { z } from "zod";

export const createItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  contentType: z.enum(["text", "url", "file"]),
  content: z.string().optional(),
  url: z.string().url().optional(),
  description: z.string().max(500).optional(),
  language: z.string().max(50).optional(),
  itemTypeId: z.string().min(1),
  tags: z.array(z.string().max(50)).max(20).optional(),
  collectionIds: z.array(z.string()).optional(),
});

export const updateItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  url: z.string().url().optional(),
  description: z.string().max(500).optional(),
  language: z.string().max(50).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});
```

---

## Component Responsibilities

### ItemsPageContent (client component)

Top-level client wrapper for the items list page.

| Responsibility | Details |
| --- | --- |
| Search/filter | Client-side filtering by title, content, tags |
| View toggle | Grid/list switch (reuse existing pattern from DashboardItems) |
| "New Item" button | Opens ItemDrawer in create mode |
| Item click | Opens ItemDrawer in view mode |
| Sort controls | By date, title, favorite status |

### ItemDrawer (client component)

Slide-out sheet (right side) using existing Sheet component. Three modes:

| Mode | Trigger | Content |
| --- | --- | --- |
| **View** | Click an item card | Read-only display with syntax highlighting, copy button, edit/delete actions |
| **Create** | Click "New Item" | ItemForm with empty fields, type pre-selected from current page |
| **Edit** | Click "Edit" in view mode | ItemForm pre-filled with item data |

### ItemForm (client component)

Adapts its fields based on the item's content model:

| Content Model | Fields Shown |
| --- | --- |
| **text** (snippet, prompt, command, note) | Title, content (textarea/code editor), language selector (snippet/command only), description, tags |
| **url** (link) | Title, URL input, description, tags |
| **file** (file, image) | Title, file upload dropzone, description, tags |

### ItemCard / ItemCardList

Existing components with minor additions:
- Add `onClick` prop for opening the drawer
- Add context menu or action buttons (favorite, pin, delete)
- Keep all display logic in the component (type color, icon, preview)

### Where Type-Specific Logic Lives

Type-specific rendering is in **components**, not actions or queries:

| Logic | Location | Example |
| --- | --- | --- |
| Which form fields to show | `ItemForm.tsx` | Hide language selector for prompts/notes/links |
| Content preview style | `ItemCard.tsx` | Code block for snippets, plain text for notes, URL chip for links |
| Syntax highlighting | `ItemDrawer.tsx` (view mode) | Only for text types with `language` set |
| File upload UI | `ItemForm.tsx` | Only for file/image content model |
| URL validation | `ItemForm.tsx` | Only for link content model |

Actions and queries are **type-agnostic** — they work with the generic Item model. The `itemTypeId` foreign key connects the item to its type, and components use `type.name` to decide what to render.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Server Component: /dashboard/items/[type]/page.tsx         │
│  ┌──────────────────────────────────────────────┐           │
│  │ 1. getAuthUserId()                           │           │
│  │ 2. getItemsByType(userId, typeName)          │           │
│  │ 3. getSystemItemTypes()                      │           │
│  │ 4. Pass data as props to client component    │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────┬───────────────────────────────────┘
                          │ props
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Client Component: ItemsPageContent                         │
│  ┌──────────────────┐  ┌───────────────────────┐            │
│  │ Search + Filters  │  │ Grid/List Toggle      │            │
│  └──────────────────┘  └───────────────────────┘            │
│  ┌──────────────────────────────────────────────┐           │
│  │ ItemCard / ItemCardList (mapped from items)   │──onClick──┐
│  └──────────────────────────────────────────────┘           │
│  ┌──────────────────────────────────────────────┐           │
│  │ ItemDrawer (view / create / edit)             │◄──────────┘
│  │   └── ItemForm (adapts by content model)      │           │
│  │       └── calls server actions on submit      │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                          │ server action
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Server Action: actions/items.ts                            │
│  1. Validate auth (getAuthUserId)                           │
│  2. Validate input (Zod)                                    │
│  3. Prisma mutation                                         │
│  4. revalidatePath("/dashboard")                            │
│  5. Return { success, data?, error? }                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Existing Code to Reuse

| What | Where | How |
| --- | --- | --- |
| Sheet component | `src/components/ui/sheet.tsx` | Use for ItemDrawer (side="right") |
| ItemCard / ItemCardList | `src/components/dashboard/` | Move to `src/components/items/`, add onClick |
| DashboardItems view toggle | `src/components/dashboard/DashboardItems.tsx` | Extract toggle pattern into ItemsPageContent |
| iconMap | `src/lib/icons.ts` | Render type icons in cards, drawer, form |
| mapItem helper | `src/lib/db/items.ts` | Reuse for getItemsByType results |
| AlertDialog | `src/components/ui/alert-dialog.tsx` | Use for DeleteItemDialog |
| Toast | `src/components/ui/sonner.tsx` | Success/error notifications after mutations |
| getAuthUserId | `src/lib/auth-utils.ts` | Auth check in all server actions |

---

## Notes

- **No API routes needed** for basic CRUD — server actions handle all mutations.
- **File uploads** (file/image types) will need an API route later for Cloudflare R2 upload with progress tracking — out of scope for initial CRUD.
- **Search** is client-side filtering initially. Full-text search can be added later as a server query.
- **Pagination** not needed initially — most users will have <50 items (free tier limit). Can add cursor-based pagination later.
- The dashboard page (`/dashboard`) continues to use its own queries (`getPinnedItems`, `getRecentItems`) — the items page is a separate view.
