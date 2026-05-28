# Drafts.io — Frontend

Next.js 16 application for the Drafts.io writing platform.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | HeroUI v3, Tailwind CSS v4 |
| Editor | tiptop-editor (custom package built on Tiptap), Y.js (WebRTC + WebSocket) |
| Animations | Framer Motion |
| Data fetching | SWR |
| Auth | NextAuth v5 |
| i18n | next-intl (10 languages) |
| Forms / validation | Zod |
| Markdown | react-markdown + remark-gfm |
| File uploads | react-dropzone → Cloudinary |

---

## Project structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Unauthenticated routes (sign-in, sign-up, reset password)
│   └── (secure)/app/       # Authenticated routes (feed, drafts, profile, settings, saved)
├── actions/                # Next.js server actions
│   ├── settings.ts         # Profile, email, password, account CRUD
│   └── translation.ts      # Save / fetch / delete draft translations
├── components/
│   ├── chat/               # Drafts AI panel (AiChatPanel, ChatMessage, ToolCard, ChatInput)
│   ├── card/               # Draft cards (feed list, library grid)
│   ├── draft/              # Draft detail view (DraftAuthorCard, etc.)
│   ├── editor/             # Tiptap editor extensions and hooks
│   ├── feed/               # Feed components
│   ├── pannels/            # Modals and panels (Sidebar, CommentDrawerContent, ModalDraftDetails, etc.)
│   ├── settings/           # Settings page sections and modals (ChangeEmailModal, ChangePasswordModal, DeleteAccountModal, etc.)
│   ├── suspense/           # Skeleton fallbacks
│   ├── toolbar/            # DraftToolbar (TTS, translation, bookmark, comments, delete)
│   └── ui/                 # Shared UI (navbar, ButtonAiTools, icons, etc.)
├── contexts/               # React contexts (session)
├── hooks/                  # Custom hooks (useAuthFetcher, useChatStream, useReader, etc.)
├── lib/                    # Types, validators, utilities, constants
├── messages/               # next-intl JSON message files (en, fr, es, de, it, jp, pt, ar, zh, ko)
├── stores/                 # Zustand stores (aiChatStore, sidebarStore)
└── styles/                 # Global CSS
```

---

## Key features

### Rich text editor
Built on tiptop-editor (a custom npm package built on top of Tiptap) with a custom extension set: headings, lists, blockquote, code blocks with syntax highlighting (lowlight), images, math equations (KaTeX), text alignment, and more. Editor state is synced via Y.js for real-time collaboration.

The editor exposes a `TiptopEditorHandle` ref with `getDocumentMap()` and `applyTargetedUpdate(s)` — used by the AI translation flow to apply word-level replacements.

### Drafts AI
A floating chat panel (compact / expanded) connects to the backend `/api/ai/chat` SSE endpoint. The assistant can create, update, delete, and fetch drafts on behalf of the user. Responses stream in real-time and render as markdown. Tool calls are shown as status cards with pending → success / error states. Opened via a FAB (floating action button) fixed at the bottom-right of the screen.

### Text-to-speech reader
The `useReader` hook fetches synthesised audio and word timestamps from the backend, schedules all audio buffers on the Web Audio API, and drives a `requestAnimationFrame` loop that highlights the active word in the editor in sync with playback.

### Comments
Inline comments are anchored to ProseMirror positions in the document using tiptop-editor's built-in comment extension. A `CommentsProvider` wraps the editor; `CommentDrawerContent` renders all active comments in a side panel. Active comment IDs are synced between the drawer and the editor so clicking a comment in the panel highlights the corresponding text (and vice versa).

### Tags
Tags are fetched from `/api/topics` and displayed in a searchable `Autocomplete`. Users can select existing tags or type new ones to create them on the fly. Selected tags are shown as dismissible chips.

### Draft translation
Any viewer can translate a draft to another language via the toolbar's translate button. Supported languages: English, French, Spanish, German, Italian, Japanese, Portuguese, Arabic, Chinese, Korean. Translations are saved per user via `actions/translation.ts` and stored server-side — the original draft content is never mutated. A language-switcher chip in the toolbar lets the user switch between the original and any previously saved translations without re-translating. Auto-save is blocked while viewing a translation. Image nodes (`imageUploader`) are language-independent and are always restored from the original content when a translation is displayed or saved.

### Internationalisation
The full UI is translated into 10 languages. Locale is stored in the user's profile (`language` field in the DB) and loaded via `TranslationsProvider` on mount. All user-visible strings use `useTranslations(namespace)` from `next-intl`. Arabic triggers RTL layout via `document.documentElement.dir = 'rtl'`.

### Bookmarks & recently read
Users can bookmark drafts from the toolbar or draft cards; bookmarked drafts appear on the `/saved` page. Reading a draft automatically records it in recently-read history, shown in the sidebar.

### Settings page
Full account management at `/settings`:
- **Profile** — name, username, bio, avatar upload
- **Security** — change email (with email verification), change / set password (with email verification)
- **Language** — UI language picker (10 options)
- **Danger zone** — deactivate account (hidden, reversible by signing in) or permanently delete account (irreversible)

### Sidebar
Notion-style collapsible sidebar. **Floating mode**: appears as a fixed overlay on hover over the burger button, with a shared 200 ms close timer so moving the cursor from the button into the sidebar keeps it open. The click-to-dismiss backdrop starts below the 44 px navbar so hovering the burger does not immediately re-trigger the close timer. **Docked mode**: click to pin — the sidebar becomes an in-flow element (260 px) that pushes the main content area to the right. State is managed by `sidebarStore` (Zustand). The sidebar closes automatically on route changes.

### Auth session handling
`useAuthFetcher` transparently refreshes expired JWTs. On a 401, it calls `getSession()` to get a fresh token and retries the request once. If the retry still fails — or no new token is available — it shows an error toast and calls `signOut({ callbackUrl: '/account/sign-in' })`.

---

## Environment variables

Create an `apps/frontend/.env.local` file (git-ignored). Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser; all others are server-side only.

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

---

## Development

```bash
pnpm install
pnpm dev        # starts on http://localhost:3000
```
