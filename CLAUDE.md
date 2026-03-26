# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# DevStash

A developer knowledege hub for snippest, commands,prompts ,notes,image, links,file and custom type


## Context Files

Read the folliwing to get the full context of the projects:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Tech Stack

- **Next.js 16.1.6** with App Router (not Pages Router)
- **React 19.2.3** — server components by default
- **TypeScript 5** — strict mode enabled
- **Tailwind CSS 4** via `@tailwindcss/postcss`
- **ESLint 9** with `core-web-vitals` and `typescript` presets

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
npm run test     # Run unit tests (single run)
npm run test:watch  # Run tests in watch mode
```

## Neon Database (MCP)

- **Project ID:** `sparkling-bonus-45695065`
- **Development Branch ID:** `br-autumn-morning-amvjyhev` (named "development" in Neon dashboard)
- **ALWAYS** use the development branch for all Neon MCP operations (pass `branchId: "br-autumn-morning-amvjyhev"`)
- **NEVER** query or modify the production/main branch unless explicitly instructed by the user
- This applies to all MCP tools: `run_sql`, `describe_branch`, `get_database_tables`, etc.

