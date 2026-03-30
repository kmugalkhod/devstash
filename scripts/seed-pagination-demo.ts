import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { ITEMS_PER_PAGE } from "../src/lib/limits";

const DEMO_EMAIL = "demo@devstash.io";
const TARGET_TYPE_NAME = "snippet";
const TARGET_COLLECTION_ID = "col-react-patterns";
const TARGET_TOTAL_ITEMS_FOR_TYPE = 50;
const TITLE_PREFIX = "Pagination Demo Snippet #";

async function main() {
  const demoUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true, email: true },
  });

  if (!demoUser) {
    throw new Error(`Demo user not found for email: ${DEMO_EMAIL}`);
  }

  const snippetType = await prisma.itemType.findFirst({
    where: { name: TARGET_TYPE_NAME, isSystem: true },
    select: { id: true, name: true },
  });

  if (!snippetType) {
    throw new Error(`System item type not found: ${TARGET_TYPE_NAME}`);
  }

  const collection = await prisma.collection.findFirst({
    where: { id: TARGET_COLLECTION_ID, userId: demoUser.id },
    select: { id: true, name: true },
  });

  if (!collection) {
    throw new Error(
      `Collection not found for user: ${TARGET_COLLECTION_ID}`
    );
  }

  const existingDemoCount = await prisma.item.count({
    where: {
      userId: demoUser.id,
      itemTypeId: snippetType.id,
      title: { startsWith: TITLE_PREFIX },
    },
  });

  const toCreate = Math.max(0, TARGET_TOTAL_ITEMS_FOR_TYPE - existingDemoCount);

  for (let index = 1; index <= toCreate; index++) {
    const serial = existingDemoCount + index;

    await prisma.item.create({
      data: {
        title: `${TITLE_PREFIX}${serial}`,
        contentType: "text",
        content: `// Pagination test item ${serial}\nconst page = ${serial};`,
        language: "typescript",
        userId: demoUser.id,
        itemTypeId: snippetType.id,
        tags: {
          create: [
            {
              tag: {
                connectOrCreate: {
                  where: { name: "pagination-demo" },
                  create: { name: "pagination-demo" },
                },
              },
            },
          ],
        },
        collections: {
          create: [{ collection: { connect: { id: collection.id } } }],
        },
      },
    });
  }

  const totalByType = await prisma.item.count({
    where: { userId: demoUser.id, itemTypeId: snippetType.id },
  });

  const totalByCollection = await prisma.item.count({
    where: {
      userId: demoUser.id,
      collections: { some: { collectionId: collection.id } },
    },
  });

  const typePages = Math.max(1, Math.ceil(totalByType / ITEMS_PER_PAGE));
  const collectionPages = Math.max(1, Math.ceil(totalByCollection / ITEMS_PER_PAGE));

  console.log("Pagination demo seed complete");
  console.log(`Demo user: ${demoUser.email}`);
  console.log(`Type '${snippetType.name}' total items: ${totalByType} (${typePages} pages)`);
  console.log(`Collection '${collection.name}' total items: ${totalByCollection} (${collectionPages} pages)`);
}

main()
  .catch((error) => {
    console.error("Failed to seed pagination demo data", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
