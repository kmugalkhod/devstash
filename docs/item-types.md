# Item Types Reference

Documentation of all 7 system item types in DevStash.

---

## Type Definitions

### 1. Snippet

| Property     | Value       |
| ------------ | ----------- |
| **Name**     | `snippet`   |
| **Icon**     | `Code`      |
| **Color**    | `#3b82f6` (Blue) |
| **Content Model** | `text` |
| **Tier**     | Free        |
| **Route**    | `/items/snippets` |

**Purpose:** Store reusable code blocks — hooks, utility functions, patterns, boilerplate.

**Key fields used:** `content` (code text), `language` (syntax highlighting — e.g. `typescript`, `dockerfile`, `bash`), `tags`, `isFavorite`, `isPinned`.

---

### 2. Prompt

| Property     | Value        |
| ------------ | ------------ |
| **Name**     | `prompt`     |
| **Icon**     | `Sparkles`   |
| **Color**    | `#8b5cf6` (Purple) |
| **Content Model** | `text`  |
| **Tier**     | Free         |
| **Route**    | `/items/prompts` |

**Purpose:** Save AI prompts — code review templates, documentation generators, refactoring instructions.

**Key fields used:** `content` (prompt text), `tags`. Language is typically `null`.

---

### 3. Command

| Property     | Value        |
| ------------ | ------------ |
| **Name**     | `command`    |
| **Icon**     | `Terminal`   |
| **Color**    | `#f97316` (Orange) |
| **Content Model** | `text`  |
| **Tier**     | Free         |
| **Route**    | `/items/commands` |

**Purpose:** Quick-access shell commands — git operations, Docker management, process control, npm utilities.

**Key fields used:** `content` (command text), `language` (typically `bash`), `tags`.

---

### 4. Note

| Property     | Value         |
| ------------ | ------------- |
| **Name**     | `note`        |
| **Icon**     | `StickyNote`  |
| **Color**    | `#fde047` (Yellow) |
| **Content Model** | `text`   |
| **Tier**     | Free          |
| **Route**    | `/items/notes` |

**Purpose:** Freeform markdown notes — documentation, explanations, meeting notes, learning notes.

**Key fields used:** `content` (markdown text), `tags`. Language is typically `null`.

---

### 5. Link

| Property     | Value        |
| ------------ | ------------ |
| **Name**     | `link`       |
| **Icon**     | `Link`       |
| **Color**    | `#10b981` (Emerald) |
| **Content Model** | `url`   |
| **Tier**     | Free         |
| **Route**    | `/items/links` |

**Purpose:** Bookmark useful URLs — documentation sites, tools, libraries, references.

**Key fields used:** `content` (stores the URL), `contentType` is `url`. Language is `null`.

---

### 6. File

| Property     | Value        |
| ------------ | ------------ |
| **Name**     | `file`       |
| **Icon**     | `File`       |
| **Color**    | `#6b7280` (Gray) |
| **Content Model** | `file`  |
| **Tier**     | **Pro**      |
| **Route**    | `/items/files` |

**Purpose:** Upload and store files — config files, templates, context files.

**Key fields used:** `fileUrl` (Cloudflare R2 URL), `fileName` (original name), `fileSize` (bytes). `content` is `null`.

---

### 7. Image

| Property     | Value        |
| ------------ | ------------ |
| **Name**     | `image`      |
| **Icon**     | `Image`      |
| **Color**    | `#ec4899` (Pink) |
| **Content Model** | `file`  |
| **Tier**     | **Pro**      |
| **Route**    | `/items/images` |

**Purpose:** Upload and store images — screenshots, diagrams, design references.

**Key fields used:** `fileUrl` (Cloudflare R2 URL), `fileName`, `fileSize`. `content` is `null`.

---

## Content Model Classification

Items use three content models determined by `contentType`:

| Content Model | Types              | Primary Field | Notes                              |
| ------------- | ------------------ | ------------- | ---------------------------------- |
| **text**      | snippet, prompt, command, note | `content` | Text stored directly in DB. May have `language` for syntax highlighting. |
| **url**       | link               | `content`     | URL stored in `content` field (not `url` field — seed data uses `content`). |
| **file**      | file, image        | `fileUrl`     | Binary stored in Cloudflare R2. `content` is `null`. Uses `fileName` and `fileSize`. |

---

## Shared Properties (All Types)

Every item regardless of type has:

| Field         | Description                          |
| ------------- | ------------------------------------ |
| `id`          | CUID primary key                     |
| `title`       | Display name                         |
| `contentType` | `"text"` / `"url"` / `"file"`       |
| `description` | Optional description                 |
| `isFavorite`  | Boolean, default `false`             |
| `isPinned`    | Boolean, default `false`             |
| `userId`      | Owner (foreign key to User)          |
| `itemTypeId`  | Foreign key to ItemType              |
| `tags`        | Many-to-many via `TagsOnItems`       |
| `collections` | Many-to-many via `ItemCollection`    |
| `createdAt`   | Auto-set timestamp                   |
| `updatedAt`   | Auto-updated timestamp               |

---

## Display Differences

| Aspect              | text types                  | url (link)                | file types              |
| ------------------- | --------------------------- | ------------------------- | ----------------------- |
| **Card preview**    | Code/text snippet (truncated) | URL text                | Filename + size         |
| **Left border**     | Type color                  | Type color                | Type color              |
| **Language badge**   | Shown if set               | N/A                       | N/A                     |
| **Syntax highlight** | Yes (if `language` set)    | No                        | No                      |

---

## Icon Map

Icons are resolved at render time via `src/lib/icons.ts`, which maps Lucide icon names (stored in the DB) to React components:

```
Code      → snippet
Sparkles  → prompt
Terminal  → command
StickyNote → note
Link      → link
File      → file
Image     → image
```

---

## System vs Custom Types

- **System types** (`isSystem: true`, `userId: null`): The 7 types above. Non-editable by users.
- **Custom types** (`isSystem: false`, `userId: <user-id>`): Future Pro feature. Per-user, unique name scoped by `@@unique([name, userId])`.

Pro-gated types in the sidebar are identified by the `proTypes` set in `Sidebar.tsx`: `file` and `image`.
