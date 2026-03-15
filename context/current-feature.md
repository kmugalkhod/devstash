# Current Feature

Prisma 7 + Neon PostgreSQL Database Setup

## Status

Completed

## Goals

- Install and configure Prisma 7 ORM with Neon PostgreSQL (serverless)
- Create initial schema based on data models in project-overview.md
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Set up dev and production database branches in Neon
- Create initial migration (never use `db push`)

## Notes

- Use Prisma 7 (has breaking changes from v6 — must read upgrade guide)
- Neon has dev and production branches — DATABASE_URL points to dev branch
- Always create migrations, never push directly
- Spec: `@context/features/database-spec.md`
- Data models: `@context/project-overview.md`
- Prisma 7 upgrade guide: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Prisma Postgres quickstart: https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-03-15** — Initial Next.js 16 project setup with Create Next App. Cleaned up default boilerplate, added CLAUDE.md and context docs, pushed to GitHub.
- **2026-03-15** — Dashboard UI Phase 1 completed. Initialized shadcn/ui, set up dark mode, created /dashboard route with top bar (search, settings, new collection/item buttons), sidebar and main placeholders.
- **2026-03-15** — Dashboard UI Phase 2 completed. Collapsible sidebar with item types (colored icons, links to /items/TYPE, PRO badges), favorite/recent collections, user avatar area with settings. Mobile drawer via Sheet component. Switched app font to Plus Jakarta Sans. Installed shadcn Sheet, Separator, Avatar, Tooltip components.
- **2026-03-16** — Dashboard UI Phase 3 completed. Main content area with 4 stats cards (items, collections, favorites), collections grid with color overlay and motion.div hover animation, pinned items section, 10 recent items grid. Grid/list view toggle for pinned and recent sections. Installed motion package. Item cards with colored left border, dark code preview, tags. Collection cards with dominant type color overlay, spring bounce hover effect. Max-width container (max-w-7xl) for spacious layout.
- **2026-03-16** — Prisma 7 + Neon PostgreSQL setup completed. Installed Prisma 7 with driver adapter (@prisma/adapter-pg), created prisma.config.ts, full schema with all models (User, Account, Session, VerificationToken, ItemType, Item, Collection, ItemCollection, Tag, TagsOnItems), initial migration applied to Neon dev branch. Seed script populates system item types, demo user, collections, tags, and items. Added db scripts to package.json.
