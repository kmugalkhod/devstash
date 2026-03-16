# Current Feature

<!-- Update this file with the next feature/fix before starting work -->

No active feature.

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-03-15** — Initial Next.js 16 project setup with Create Next App. Cleaned up default boilerplate, added CLAUDE.md and context docs, pushed to GitHub.
- **2026-03-15** — Dashboard UI Phase 1 completed. Initialized shadcn/ui, set up dark mode, created /dashboard route with top bar (search, settings, new collection/item buttons), sidebar and main placeholders.
- **2026-03-15** — Dashboard UI Phase 2 completed. Collapsible sidebar with item types (colored icons, links to /items/TYPE, PRO badges), favorite/recent collections, user avatar area with settings. Mobile drawer via Sheet component. Switched app font to Plus Jakarta Sans. Installed shadcn Sheet, Separator, Avatar, Tooltip components.
- **2026-03-16** — Dashboard UI Phase 3 completed. Main content area with 4 stats cards (items, collections, favorites), collections grid with color overlay and motion.div hover animation, pinned items section, 10 recent items grid. Grid/list view toggle for pinned and recent sections. Installed motion package. Item cards with colored left border, dark code preview, tags. Collection cards with dominant type color overlay, spring bounce hover effect. Max-width container (max-w-7xl) for spacious layout.
- **2026-03-16** — Prisma 7 + Neon PostgreSQL setup completed. Installed Prisma 7 with driver adapter (@prisma/adapter-pg), created prisma.config.ts, full schema with all models (User, Account, Session, VerificationToken, ItemType, Item, Collection, ItemCollection, Tag, TagsOnItems), initial migration applied to Neon dev branch. Seed script populates system item types, demo user, collections, tags, and items. Added db scripts to package.json.
- **2026-03-17** — Seed data overhaul completed. Rewrote prisma/seed.ts to match seed-spec.md. Demo user (demo@devstash.io), 7 system item types (lowercase names), 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources), 18 items with realistic content, 25 tags. Installed bcryptjs for password hashing. All links use real URLs.
- **2026-03-17** — Dashboard Collections (Real Data) completed. Created `src/lib/db/collections.ts` with `getUserCollections` and `getDashboardStats` Prisma queries. Converted dashboard page to server component fetching real data from Neon. Updated CollectionCard to accept type objects as props (dominant type = most-used). Updated StatsCards to accept stats as props. Extracted items sections into DashboardItems client component (still mock data for now). Fixed pg SSL deprecation warning.
