import { prisma } from "../src/lib/prisma";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npx tsx scripts/delete-user.ts <email>");
  process.exit(1);
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      _count: {
        select: {
          items: true,
          collections: true,
          accounts: true,
          sessions: true,
        },
      },
    },
  });

  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  console.log(`Found user: ${user.name} (${user.email})`);
  console.log(`  Items: ${user._count.items}`);
  console.log(`  Collections: ${user._count.collections}`);
  console.log(`  Accounts: ${user._count.accounts}`);
  console.log(`  Sessions: ${user._count.sessions}`);

  // Delete verification tokens for this email
  const deletedTokens = await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });
  console.log(`  Deleted ${deletedTokens.count} verification tokens`);

  // Delete user — cascades to items, collections, accounts, sessions
  await prisma.user.delete({ where: { email } });

  console.log(`\nDeleted user ${email} and all associated data.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
