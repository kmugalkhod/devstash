import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// ─── System Item Types ──────────────────────────────────

const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true },
];

// ─── Demo User ──────────────────────────────────────────

const demoUser = {
  id: "demo-user-1",
  name: "Demo User",
  email: "demo@devstash.io",
  isPro: false,
  emailVerified: new Date(),
  // Password: 12345678 (hashed below, ready for when User model gets a password field)
};

// ─── Collections ────────────────────────────────────────

const collections = [
  {
    id: "col-react-patterns",
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    isFavorite: true,
  },
  {
    id: "col-ai-workflows",
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    isFavorite: true,
  },
  {
    id: "col-devops",
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    isFavorite: false,
  },
  {
    id: "col-terminal-commands",
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    isFavorite: false,
  },
  {
    id: "col-design-resources",
    name: "Design Resources",
    description: "UI/UX resources and references",
    isFavorite: true,
  },
];

// ─── Items ──────────────────────────────────────────────

interface SeedItem {
  id: string;
  title: string;
  contentType: "text" | "url";
  content: string;
  typeName: string;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  tags: string[];
  collectionIds: string[];
}

const items: SeedItem[] = [
  // ── React Patterns (3 snippets) ───────────────────────
  {
    id: "item-rp-1",
    title: "useDebounce Hook",
    contentType: "text",
    content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage:
// const debouncedSearch = useDebounce(searchTerm, 300);`,
    typeName: "snippet",
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    tags: ["react", "hooks", "typescript"],
    collectionIds: ["col-react-patterns"],
  },
  {
    id: "item-rp-2",
    title: "Context Provider Pattern",
    contentType: "text",
    content: `import { createContext, useContext, useState, type ReactNode } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}`,
    typeName: "snippet",
    language: "typescript",
    isFavorite: false,
    isPinned: false,
    tags: ["react", "patterns", "context"],
    collectionIds: ["col-react-patterns"],
  },
  {
    id: "item-rp-3",
    title: "Array Utility Functions",
    contentType: "text",
    content: `export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) result[groupKey] = [];
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}`,
    typeName: "snippet",
    language: "typescript",
    isFavorite: false,
    isPinned: true,
    tags: ["typescript", "utilities"],
    collectionIds: ["col-react-patterns"],
  },

  // ── AI Workflows (3 prompts) ──────────────────────────
  {
    id: "item-ai-1",
    title: "Code Review Prompt",
    contentType: "text",
    content: `You are a senior software engineer performing a thorough code review. Analyze the following code and provide feedback on:

1. **Security** — Look for injection vulnerabilities, auth issues, and data exposure
2. **Performance** — Identify N+1 queries, unnecessary re-renders, memory leaks
3. **Readability** — Suggest naming improvements, simplifications, and better abstractions
4. **Edge Cases** — Point out unhandled error states, null checks, and boundary conditions
5. **Best Practices** — Flag deviations from framework conventions and patterns

Format your response as:
- 🔴 Critical (must fix)
- 🟡 Warning (should fix)
- 🟢 Suggestion (nice to have)

Code to review:
\`\`\`
{paste code here}
\`\`\``,
    typeName: "prompt",
    language: null,
    isFavorite: true,
    isPinned: true,
    tags: ["ai", "code-review"],
    collectionIds: ["col-ai-workflows"],
  },
  {
    id: "item-ai-2",
    title: "Documentation Generator",
    contentType: "text",
    content: `Generate comprehensive documentation for the following code. Include:

1. **Overview** — A one-paragraph summary of what this code does and why it exists
2. **API Reference** — For each exported function/class/type:
   - Description
   - Parameters with types and descriptions
   - Return value
   - Example usage
3. **Dependencies** — List external dependencies and why they're needed
4. **Architecture Notes** — Explain key design decisions and patterns used

Write in a clear, developer-friendly tone. Use JSDoc format for inline documentation.

Code:
\`\`\`
{paste code here}
\`\`\``,
    typeName: "prompt",
    language: null,
    isFavorite: false,
    isPinned: false,
    tags: ["ai", "documentation"],
    collectionIds: ["col-ai-workflows"],
  },
  {
    id: "item-ai-3",
    title: "Refactoring Assistant",
    contentType: "text",
    content: `You are a refactoring expert. Analyze the following code and suggest refactoring improvements. Focus on:

1. **Extract Method** — Identify blocks that should be separate functions
2. **Reduce Complexity** — Simplify nested conditionals and loops
3. **DRY Violations** — Find duplicated logic that should be abstracted
4. **Type Safety** — Strengthen types, remove \`any\`, add missing generics
5. **Modern Syntax** — Use modern language features where they improve clarity

For each suggestion:
- Show the before/after code
- Explain why the refactoring improves the code
- Rate the priority (high/medium/low)

Code to refactor:
\`\`\`
{paste code here}
\`\`\``,
    typeName: "prompt",
    language: null,
    isFavorite: false,
    isPinned: false,
    tags: ["ai", "refactoring"],
    collectionIds: ["col-ai-workflows"],
  },

  // ── DevOps (1 snippet, 1 command, 2 links) ───────────
  {
    id: "item-do-1",
    title: "Multi-Stage Dockerfile",
    contentType: "text",
    content: `# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]`,
    typeName: "snippet",
    language: "dockerfile",
    isFavorite: false,
    isPinned: false,
    tags: ["docker", "devops", "ci-cd"],
    collectionIds: ["col-devops"],
  },
  {
    id: "item-do-2",
    title: "Deploy with PM2",
    contentType: "text",
    content: `pm2 start ecosystem.config.js --env production && pm2 save`,
    typeName: "command",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    tags: ["devops", "deployment"],
    collectionIds: ["col-devops"],
  },
  {
    id: "item-do-3",
    title: "GitHub Actions Documentation",
    contentType: "url",
    content: "https://docs.github.com/en/actions",
    typeName: "link",
    language: null,
    isFavorite: false,
    isPinned: false,
    tags: ["devops", "ci-cd", "documentation"],
    collectionIds: ["col-devops"],
  },
  {
    id: "item-do-4",
    title: "Docker Hub Official Images",
    contentType: "url",
    content: "https://hub.docker.com/search?type=image&image_filter=official",
    typeName: "link",
    language: null,
    isFavorite: false,
    isPinned: false,
    tags: ["docker", "devops"],
    collectionIds: ["col-devops"],
  },

  // ── Terminal Commands (4 commands) ────────────────────
  {
    id: "item-tc-1",
    title: "Interactive Rebase Last N Commits",
    contentType: "text",
    content: `git rebase -i HEAD~5`,
    typeName: "command",
    language: "bash",
    isFavorite: true,
    isPinned: true,
    tags: ["git", "terminal"],
    collectionIds: ["col-terminal-commands"],
  },
  {
    id: "item-tc-2",
    title: "Stop All Running Docker Containers",
    contentType: "text",
    content: `docker stop $(docker ps -q)`,
    typeName: "command",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    tags: ["docker", "terminal"],
    collectionIds: ["col-terminal-commands"],
  },
  {
    id: "item-tc-3",
    title: "Find and Kill Process on Port",
    contentType: "text",
    content: `lsof -ti :3000 | xargs kill -9`,
    typeName: "command",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    tags: ["terminal", "process"],
    collectionIds: ["col-terminal-commands"],
  },
  {
    id: "item-tc-4",
    title: "List Outdated npm Packages",
    contentType: "text",
    content: `npm outdated --long`,
    typeName: "command",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    tags: ["npm", "terminal"],
    collectionIds: ["col-terminal-commands"],
  },

  // ── Design Resources (4 links) ────────────────────────
  {
    id: "item-dr-1",
    title: "Tailwind CSS Documentation",
    contentType: "url",
    content: "https://tailwindcss.com/docs",
    typeName: "link",
    language: null,
    isFavorite: true,
    isPinned: false,
    tags: ["css", "tailwind", "frontend"],
    collectionIds: ["col-design-resources"],
  },
  {
    id: "item-dr-2",
    title: "shadcn/ui Component Library",
    contentType: "url",
    content: "https://ui.shadcn.com",
    typeName: "link",
    language: null,
    isFavorite: true,
    isPinned: false,
    tags: ["components", "ui", "frontend"],
    collectionIds: ["col-design-resources"],
  },
  {
    id: "item-dr-3",
    title: "Radix UI Primitives",
    contentType: "url",
    content: "https://www.radix-ui.com/primitives",
    typeName: "link",
    language: null,
    isFavorite: false,
    isPinned: false,
    tags: ["components", "ui", "design-system"],
    collectionIds: ["col-design-resources"],
  },
  {
    id: "item-dr-4",
    title: "Lucide Icons",
    contentType: "url",
    content: "https://lucide.dev/icons",
    typeName: "link",
    language: null,
    isFavorite: false,
    isPinned: false,
    tags: ["icons", "ui", "frontend"],
    collectionIds: ["col-design-resources"],
  },
];

// ─── Main ───────────────────────────────────────────────

async function main() {
  // Hash password (ready for when User model gets a password field)
  const hashedPassword = await bcrypt.hash("12345678", 12);
  console.log(`Password hash generated: ${hashedPassword.slice(0, 20)}...`);

  // 1. Seed system item types
  console.log("Seeding system item types...");
  const typeMap = new Map<string, string>();

  for (const type of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, isSystem: true },
    });

    if (existing) {
      await prisma.itemType.update({
        where: { id: existing.id },
        data: { icon: type.icon, color: type.color },
      });
      typeMap.set(type.name, existing.id);
    } else {
      const created = await prisma.itemType.create({ data: type });
      typeMap.set(type.name, created.id);
    }
  }
  console.log(`  ✓ ${systemItemTypes.length} item types`);

  // 2. Seed demo user
  console.log("Seeding demo user...");
  await prisma.user.upsert({
    where: { id: demoUser.id },
    update: {
      name: demoUser.name,
      email: demoUser.email,
      isPro: demoUser.isPro,
      emailVerified: demoUser.emailVerified,
      password: hashedPassword,
    },
    create: {
      ...demoUser,
      password: hashedPassword,
    },
  });
  console.log(`  ✓ User: ${demoUser.name} (${demoUser.email})`);

  // 3. Seed collections
  console.log("Seeding collections...");
  for (const col of collections) {
    await prisma.collection.upsert({
      where: { id: col.id },
      update: {
        name: col.name,
        description: col.description,
        isFavorite: col.isFavorite,
      },
      create: { ...col, userId: demoUser.id },
    });
  }
  console.log(`  ✓ ${collections.length} collections`);

  // 4. Seed tags
  console.log("Seeding tags...");
  const allTags = [...new Set(items.flatMap((item) => item.tags))];
  const tagMap = new Map<string, string>();

  for (const tagName of allTags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
    tagMap.set(tagName, tag.id);
  }
  console.log(`  ✓ ${allTags.length} tags`);

  // 5. Seed items with tags and collection links
  console.log("Seeding items...");
  for (const item of items) {
    const itemTypeId = typeMap.get(item.typeName)!;

    await prisma.item.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        contentType: item.contentType,
        content: item.content,
        language: item.language,
        isFavorite: item.isFavorite,
        isPinned: item.isPinned,
        itemTypeId,
      },
      create: {
        id: item.id,
        title: item.title,
        contentType: item.contentType,
        content: item.content,
        language: item.language,
        isFavorite: item.isFavorite,
        isPinned: item.isPinned,
        itemTypeId,
        userId: demoUser.id,
      },
    });

    // Link tags
    for (const tagName of item.tags) {
      const tagId = tagMap.get(tagName)!;
      await prisma.tagsOnItems.upsert({
        where: { itemId_tagId: { itemId: item.id, tagId } },
        update: {},
        create: { itemId: item.id, tagId },
      });
    }

    // Link collections
    for (const colId of item.collectionIds) {
      await prisma.itemCollection.upsert({
        where: {
          itemId_collectionId: { itemId: item.id, collectionId: colId },
        },
        update: {},
        create: { itemId: item.id, collectionId: colId },
      });
    }
  }
  console.log(`  ✓ ${items.length} items`);

  console.log("\nSeed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
