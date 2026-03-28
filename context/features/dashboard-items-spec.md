# Dashboard Items Spec

## Overview

Display item data in the main area of the dashboard (right side) using Neon database queries via Prisma. This includes both pinned and recent items.

If there are no pinned items, nothing should display there.

## Requirements

- Create src/lib/db/items.ts with data fetching functions
- Fetch items directly in server component
- item card icon/border derived from the item type
- Display item type tags and anything else currently there. You can also reference the screenshot if needed
- Update collection stats display

## References

Check the `@context/screenshots/devstash-dashboard.png` screenshot if needed, but layout and design is already there.
