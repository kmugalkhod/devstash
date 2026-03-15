import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// ─── System Item Types ──────────────────────────────────

const systemItemTypes = [
  { name: "Snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "Prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "Command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "Note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "Link", icon: "Link", color: "#10b981", isSystem: true },
  { name: "File", icon: "File", color: "#6b7280", isSystem: true },
  { name: "Image", icon: "Image", color: "#ec4899", isSystem: true },
];

// ─── Demo User ──────────────────────────────────────────

const demoUser = {
  id: "user-1",
  name: "Kunal",
  email: "kunalmugalkhod007@gmail.com",
  isPro: true,
};

// ─── Demo Collections ───────────────────────────────────

const demoCollections = [
  {
    id: "col-1",
    name: "React Patterns",
    description: "Common hooks and components",
    isFavorite: true,
  },
  {
    id: "col-2",
    name: "Context Files",
    description: "Project context for LLMs",
    isFavorite: true,
  },
  {
    id: "col-3",
    name: "Interview Prep",
    description: "Algorithms and system design",
    isFavorite: true,
  },
  {
    id: "col-4",
    name: "Python Snippets",
    description: "Data processing scripts",
    isFavorite: false,
  },
];

// ─── Demo Items ─────────────────────────────────────────
// typeName is resolved to itemTypeId during seeding

const demoItems = [
  {
    id: "item-1",
    title: "useDebounce hook",
    contentType: "text",
    content:
      "import { useState, useEffect } from 'react'; export function useDebounce<T>(value: T, delay: number...",
    typeName: "Snippet",
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    tags: ["react", "hooks", "frontend"],
    collectionIds: ["col-1"],
  },
  {
    id: "item-2",
    title: "Explain code to junior dev",
    contentType: "text",
    content:
      "Explain the following code snippet as if you are talking to a junior developer who just started lear...",
    typeName: "Prompt",
    language: null,
    isFavorite: false,
    isPinned: true,
    tags: ["ai"],
    collectionIds: ["col-3"],
  },
  {
    id: "item-3",
    title: "Docker cleanup all",
    contentType: "text",
    content: "docker system prune -a --volumes",
    typeName: "Command",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    tags: ["docker"],
    collectionIds: [],
  },
  {
    id: "item-4",
    title: "Meeting notes - Q3 Planning",
    contentType: "text",
    content:
      "# Q3 Planning - Focus on performance improvements - Migrate to Next.js 16 - Implement new AI featur...",
    typeName: "Note",
    language: null,
    isFavorite: false,
    isPinned: false,
    tags: [],
    collectionIds: [],
  },
  {
    id: "item-5",
    title: "Next.js 16 Docs",
    contentType: "url",
    content: "https://nextjs.org/docs",
    typeName: "Link",
    language: null,
    isFavorite: false,
    isPinned: false,
    tags: ["react", "frontend"],
    collectionIds: ["col-1"],
  },
  {
    id: "item-6",
    title: "Data processing script",
    contentType: "text",
    content:
      "import pandas as pd\ndef process_data(file_path): df = pd.read_csv(file_path) df = df.dropna...",
    typeName: "Snippet",
    language: "python",
    isFavorite: false,
    isPinned: false,
    tags: ["python"],
    collectionIds: ["col-4"],
  },
  {
    id: "item-7",
    title: "Tailwind CSS Grid Layout",
    contentType: "text",
    content:
      '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">  <div>1</div> <div>2</div>...',
    typeName: "Snippet",
    language: "tsx",
    isFavorite: false,
    isPinned: false,
    tags: ["frontend"],
    collectionIds: ["col-1"],
  },
  {
    id: "item-8",
    title: "System Prompt: Code Reviewer",
    contentType: "text",
    content:
      "You are an expert code reviewer. Review the following code for security vulnerabilities, performance...",
    typeName: "Prompt",
    language: null,
    isFavorite: false,
    isPinned: false,
    tags: ["ai"],
    collectionIds: ["col-3"],
  },
  {
    id: "item-9",
    title: "Git Reset Hard",
    contentType: "text",
    content: "git reset --hard HEAD~1",
    typeName: "Command",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    tags: ["git"],
    collectionIds: [],
  },
  {
    id: "item-10",
    title: "Architecture Diagram",
    contentType: "file",
    content: null,
    fileUrl: "/mock/architecture-diagram.png",
    fileName: "architecture-diagram.png",
    typeName: "Image",
    language: null,
    isFavorite: false,
    isPinned: false,
    tags: [],
    collectionIds: [],
  },
];

async function main() {
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
    update: { name: demoUser.name, email: demoUser.email, isPro: demoUser.isPro },
    create: demoUser,
  });
  console.log(`  ✓ User: ${demoUser.name}`);

  // 3. Seed collections
  console.log("Seeding collections...");
  for (const col of demoCollections) {
    await prisma.collection.upsert({
      where: { id: col.id },
      update: { name: col.name, description: col.description, isFavorite: col.isFavorite },
      create: { ...col, userId: demoUser.id },
    });
  }
  console.log(`  ✓ ${demoCollections.length} collections`);

  // 4. Seed tags
  console.log("Seeding tags...");
  const allTags = [...new Set(demoItems.flatMap((item) => item.tags))];
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
  for (const item of demoItems) {
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
        fileUrl: "fileUrl" in item ? (item as Record<string, unknown>).fileUrl as string : null,
        fileName: "fileName" in item ? (item as Record<string, unknown>).fileName as string : null,
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
        fileUrl: "fileUrl" in item ? (item as Record<string, unknown>).fileUrl as string : undefined,
        fileName: "fileName" in item ? (item as Record<string, unknown>).fileName as string : undefined,
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
        where: { itemId_collectionId: { itemId: item.id, collectionId: colId } },
        update: {},
        create: { itemId: item.id, collectionId: colId },
      });
    }
  }
  console.log(`  ✓ ${demoItems.length} items`);

  console.log("Seed complete!");
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
