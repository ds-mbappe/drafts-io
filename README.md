# Drafts.io

A full-stack writing platform where users create, publish, and discover written drafts. Built as a pnpm monorepo with a Next.js frontend and a NestJS backend.

---

## Features

### Writing
- Rich text editor powered by [Tiptap](https://tiptap.dev) with support for headings, lists, code blocks, images, math (KaTeX), and more
- Real-time collaborative editing via Y.js (WebRTC + WebSocket)
- Auto-save with debounced updates and local storage fallback
- Word count and character count tracking

### Drafts
- Create, update, and delete drafts
- Cover image upload via Cloudinary
- Multi-tag tagging with a searchable autocomplete
- Public / private visibility toggle
- Like and bookmark system with optimistic UI updates
- Estimated read time

### Discovery
- Public feed with Discover and Following tabs
- Global search across draft titles
- Recently read history
- Saved (bookmarked) drafts page

### Comments
- Inline comments anchored to text ranges in the document
- Node-level comments on block elements
- Comment threads with create, update, and delete
- Sidebar comment drawer with active-comment highlighting synced to the editor

### Drafts AI
- FAB (floating action button) at the bottom-right opens a compact ↔ expanded chat panel
- Powered by Claude (Anthropic) with agentic tool use: create, update, delete, and fetch drafts; cover images sourced automatically from Unsplash
- Newly created drafts always include generated content (markdown → Tiptap JSON) and a cover image
- Streaming responses with live text rendering and tool call status cards
- Markdown rendering in assistant messages
- Suggested prompts and animated welcome screen
- Conversation history held client-side (resets on refresh)

### Text-to-Speech
- Read-aloud feature using Google Cloud TTS (Neural2 voices)
- Per-word highlight synced to audio playback via Web Audio API
- MP3 audio stored in Cloudinary; only URLs + timestamps cached in the database
- Cloudinary audio files are deleted automatically when a draft is deleted

### Translation
- Translate draft content to 10 languages: English, French, Spanish, German, Italian, Japanese, Portuguese, Arabic, Chinese, Korean
- Batch translation via Claude with concurrency limiting for large documents
- Translations are saved per-user — the original draft is never overwritten
- Language switcher in the toolbar to toggle between original and any saved translation
- TTS read-aloud voice automatically matches the currently-viewed language
- Images are always restored from the original content when displaying or saving a translation

### Internationalisation (i18n)
- Full UI translation across 10 languages (same set as draft translation)
- Language preference saved per user in the database
- RTL layout support when Arabic is selected
- All user-visible strings managed via `next-intl` with 10 JSON message files

### Auth
- Email / password authentication with JWT (access + refresh tokens)
- Social login (OAuth — Google, GitHub, etc.) via NextAuth v5
- Password reset via email (Resend)
- Change email with 6-character email verification code
- Change password (or set a password for OAuth-only accounts) with email verification
- Session management with automatic token refresh

### Settings
- Profile section: update name, username, bio, avatar
- Security section: change email, change password, 2FA (coming soon)
- Language section: pick UI language
- Danger zone: deactivate or permanently delete account

### User profiles
- Avatar upload, bio, follow / unfollow system
- Public profile page with follower / following counts and draft list

---

## Monorepo structure

```
drafts-io/
├── apps/
│   ├── frontend/   # Next.js 16 app
│   └── backend/    # NestJS 11 API
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16 (App Router) |
| UI library | HeroUI v3 + Tailwind CSS v4 |
| Editor | tiptop-editor (custom package built on Tiptap) + Y.js (CRDT) |
| Animations | Framer Motion |
| State / data fetching | SWR + React Context |
| i18n | next-intl (10 languages) |
| Backend framework | NestJS 11 |
| Database | PostgreSQL (Prisma ORM) |
| Auth | NextAuth v5 + Passport JWT |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| TTS | Google Cloud Text-to-Speech |
| File storage | Cloudinary |
| Email | Resend |
| Package manager | pnpm workspaces |

---

## Getting started

### Prerequisites
- Node.js 20+
- pnpm
- A running PostgreSQL instance (or Prisma Postgres local via `npx prisma dev`)

### Install dependencies
```bash
pnpm install
```

### Environment variables

**`apps/backend/.env`**
```env
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ANTHROPIC_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-key.json
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
UNSPLASH_ACCESS_KEY=...    # optional — enables cover image search in AI agent
```

**`apps/frontend/.env.local`**
```env
# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# NextAuth v5
AUTH_URL=http://localhost:3000
AUTH_SECRET=...                            # generate with: npx auth secret

# Environment
NEXT_PUBLIC_VERCEL_ENV=development         # development | staging | production

# OpenAI (client-side AI features)
NEXT_PUBLIC_OPEN_API_KEY=...

# Email — Resend (server actions)
RESEND_API_KEY=...
RESEND_USERNAME=resend
RESEND_PASSWORD=...

# JWT (server actions / API routes)
JWT_SECRET=...
JWT_EXPIRES_IN=1d

# Cloudinary (server-side uploads)
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

# OAuth providers
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_FACEBOOK_ID=...
AUTH_FACEBOOK_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

### Database setup
```bash
cd apps/backend
npx prisma migrate deploy
npx prisma generate
```

### Run in development
```bash
# Backend (port 3001)
cd apps/backend && pnpm start:dev

# Frontend (port 3000)
cd apps/frontend && pnpm dev
```
