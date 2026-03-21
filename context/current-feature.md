# Current Feature: UI Improvements — Dashboard

## Status

In Progress

## Goals

### High Priority
- [ ] Add Suspense boundaries with skeleton fallbacks for each dashboard section (Stats, Collections, Pinned Items, Recent Items)

### Medium Priority
- [ ] Restyle PRO badge with amber/premium visual distinction
- [ ] Add Clock icon to "Recent Items" section heading for consistency with "Pinned Items"
- [ ] Increase collection card color overlay opacity (0.03→0.06, hover 0.07→0.12)
- [ ] Increase stats card icon background opacity (5%→10-15%)
- [ ] Widen search bar max-width (max-w-md→max-w-xl) for better desktop use
- [ ] Add DevStash logomark to mobile topbar when sidebar is closed

### Low Priority
- [ ] Show short "New" label on mobile instead of icon-only for New Item button
- [ ] Tighten collection card description spacing (mt-5→mt-4)
- [ ] Improve view toggle active state visibility (add shadow or border)
- [ ] Add subtle color tint to sidebar "Recent" Clock icon
- [ ] Add group-focus-within:opacity-100 to collection card options button for keyboard accessibility

## Notes

- Spec file: `tests/main/improvements.md`
- All changes target the `/dashboard` route and its components
- 1 high priority, 6 medium priority, 5 low priority items
- Most changes are small CSS/class tweaks; skeleton loading is the largest task

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-03-15** — Initial Next.js 16 project setup with Create Next App. Cleaned up default boilerplate, added CLAUDE.md and context docs, pushed to GitHub.
- **2026-03-15** — Dashboard UI Phase 1 completed. Initialized shadcn/ui, set up dark mode, created /dashboard route with top bar (search, settings, new collection/item buttons), sidebar and main placeholders.
- **2026-03-15** — Dashboard UI Phase 2 completed. Collapsible sidebar with item types (colored icons, links to /items/TYPE, PRO badges), favorite/recent collections, user avatar area with settings. Mobile drawer via Sheet component. Switched app font to Plus Jakarta Sans. Installed shadcn Sheet, Separator, Avatar, Tooltip components.
- **2026-03-16** — Dashboard UI Phase 3 completed. Main content area with 4 stats cards (items, collections, favorites), collections grid with color overlay and motion.div hover animation, pinned items section, 10 recent items grid. Grid/list view toggle for pinned and recent sections. Installed motion package. Item cards with colored left border, dark code preview, tags. Collection cards with dominant type color overlay, spring bounce hover effect. Max-width container (max-w-7xl) for spacious layout.
- **2026-03-16** — Prisma 7 + Neon PostgreSQL setup completed. Installed Prisma 7 with driver adapter (@prisma/adapter-pg), created prisma.config.ts, full schema with all models (User, Account, Session, VerificationToken, ItemType, Item, Collection, ItemCollection, Tag, TagsOnItems), initial migration applied to Neon dev branch. Seed script populates system item types, demo user, collections, tags, and items. Added db scripts to package.json.
- **2026-03-17** — Seed data overhaul completed. Rewrote prisma/seed.ts to match seed-spec.md. Demo user (demo@devstash.io), 7 system item types (lowercase names), 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources), 18 items with realistic content, 25 tags. Installed bcryptjs for password hashing. All links use real URLs.
- **2026-03-17** — Dashboard Collections (Real Data) completed. Created `src/lib/db/collections.ts` with `getUserCollections` and `getDashboardStats` Prisma queries. Converted dashboard page to server component fetching real data from Neon. Updated CollectionCard to accept type objects as props (dominant type = most-used). Updated StatsCards to accept stats as props. Extracted items sections into DashboardItems client component (still mock data for now). Fixed pg SSL deprecation warning.
- **2026-03-17** — Dashboard Items (Real Data) completed. Created `src/lib/db/items.ts` with `getPinnedItems` and `getRecentItems` Prisma queries. Updated DashboardItems to accept real data as props. Updated ItemCard and ItemCardList to accept type info (name, icon, color) as props instead of looking up from mock data. Removed mock-data dependency from all item components. Added `suppressHydrationWarning` for relative time stamps. If no pinned items exist, the section is hidden.
- **2026-03-18** — Stats & Sidebar (Real Data) completed. Wired sidebar to real database data: system item types with correct order, icons, and links. Favorite collections with star icons, recent collections with colored circles based on dominant item type. Added "View all collections" link. Created db functions for sidebar data. Replaced all mock data in dashboard layout and sidebar with Prisma queries.
- **2026-03-20** — UI/UX Refinement completed. Reduced stat card height (smaller padding, font, icon). Improved typography contrast: secondary text lightened to zinc-400, timestamps to zinc-500, snippet previews to zinc-400 on bg-black/40, tags brightened to zinc-300 with bg-white/8. Increased card padding (+4px). Increased section margins (space-y-10, mb-6). Added hover shadow glow (shadow-white/3) on all cards. Limited dashboard collections to 4 to fit grid.
- **2026-03-22** — Prisma 7 compliance audit completed. Verified all v7 breaking changes already addressed: prisma.config.ts with defineConfig(), @prisma/adapter-pg driver adapter, correct PrismaClient import from generated output, no url in datasource block, no deprecated preview flags, Node.js 22.13.1, TypeScript 5.9.3. No code changes needed — project was set up with Prisma 7 from the start.
