# DevStash

DevStash is a developer knowledge hub for storing snippets, prompts, commands, notes, links, files, and images in one searchable workspace.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma 7 with PostgreSQL
- NextAuth v5

## Core Features

- Email/password and GitHub authentication
- Email verification and password reset flows
- Dashboard with real database-backed collections and items
- Item creation, editing, deletion, pinning, and favoriting
- Collection pages, editing, and deletion
- Global command palette search
- Markdown editing and Monaco-based code editing
- Cloudflare R2 file and image upload support
- Editor preferences persisted per user

## Commands

```bash
npm run dev
npm run build
npm start
npm run lint
npm run test
```

## Environment

Use `.env` for local development. Keep production variable names aligned with `.env.production` and `.env._production`.

Key integrations used by the app:

- PostgreSQL via `DATABASE_URL`
- NextAuth secrets and GitHub OAuth credentials
- Resend for email delivery
- Upstash Redis for rate limiting
- Cloudflare R2 for file storage

## Project Context

Project-specific planning and history live in the `context/` directory:

- `context/project-overview.md`
- `context/coding-standards.md`
- `context/ai-interaction.md`
- `context/current-feature.md`
