# Drafts.io — Backend

NestJS 11 REST API for the Drafts.io writing platform.

---

## Stack

| | |
|---|---|
| Framework | NestJS 11 |
| ORM | Prisma 6 |
| Database | PostgreSQL |
| Auth | Passport JWT (access + refresh tokens) |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| TTS | Google Cloud Text-to-Speech (Neural2) |
| File storage | Cloudinary |
| Email | Resend |

---

## Project structure

```
src/
├── ai/             # Translation (stream + batch) and AI agent chat
├── auth/           # JWT strategy, guards, decorators, token refresh
├── bookmarks/      # Bookmark toggle and saved-drafts list
├── comments/       # Inline comments anchored to document positions
├── content/        # Markdown → Tiptap JSON conversion (ContentService)
├── drafts/         # Core draft CRUD, likes, pagination
├── email/          # Transactional emails via Resend (reset, verification, account alerts)
├── global_search/  # Cross-draft title search
├── recently-read/  # Track and retrieve recently-read drafts per user
├── relations/      # Follow / unfollow between users
├── settings/       # Profile, email, password, account management
├── translations/   # Per-user draft translations (save, fetch, delete)
├── tts/            # Text-to-speech synthesis and caching
├── user/           # User profile read and update
└── utils/          # Cloudinary upload/delete, error handling
```

---

## API modules

### Auth — `/api/auth`
JWT-based authentication. Issues short-lived access tokens and long-lived refresh tokens. Includes sign-up, sign-in, token refresh, and password reset via email.

### Settings — `/api/settings`
Account management for the current user.
- `GET /me` — returns full user profile plus settings-related flags (`hasPassword`, `language`, etc.)
- `GET /username/check?username=` — availability check
- `PATCH /profile` — update name, username, bio, avatar
- `POST /email/request` — request email change (sends 6-char verification code)
- `POST /email/confirm` — confirm email change with code
- `POST /password/request` — request password change or set a first password (OAuth accounts); sends code
- `POST /password/confirm` — confirm password change with code
- `DELETE /account` — deactivate or permanently delete account (requires password if set)

### Drafts — `/api/drafts`
Full CRUD for drafts. Supports pagination (cursor-based), public/private visibility, like toggling, and Y.js document state snapshots (`ydoc` field stored as bytes). On deletion, all Cloudinary audio files cached for that draft are also deleted.

### Notifications — `/api/notifications`
Real-time in-app notifications delivered over SSE.
- `GET /stream?token=` — SSE stream (token passed as query param because `EventSource` cannot send headers). Sends two event types: `notification` (new notification object) and `unread_count` (current unread count, also sent immediately on connect). Multiple tabs/connections per user are supported via an in-memory `Map<userId, Set<Subject>>`.
- `GET /` — paginated notification list (`?take=&cursor=`)
- `GET /unread-count` — `{ count: number }`
- `PATCH /:id/read` — mark one notification as read
- `PATCH /read-all` — mark all as read
- `DELETE /:id` — delete one notification
- `DELETE /` — delete all notifications
- `GET /preferences` — get notification preferences (auto-created with all enabled on first access)
- `PATCH /preferences` — update per-type preferences (`notifyOnFollow`, `notifyOnLike`, `notifyOnComment`)

Notifications are created automatically inside `RelationsService.follow()`, `DraftsService.toggleLike()`, and `CommentsService.createComment()`. Self-notifications (actor === recipient) and disabled preference types are silently skipped.

### Bookmarks — `/api/bookmarks`
- `POST /:draftId/toggle` — toggle bookmark on a draft
- `GET /` — list all bookmarked drafts for the current user

### Recently read — `/api/recently-read`
- `POST /:draftId` — record or refresh a read event for the current user
- `GET /` — return the user's recently-read draft list (newest first)

### Comments — `/api/comments`
Inline comments with `from`/`to` character positions anchored to the document. Supports create, read, update, and delete.

### AI — `/api/ai`
- `POST /translate` — translate a text string to a target language
- `POST /translate/stream` — streaming SSE translation
- `POST /translate/batch` — translate an array of text segments (used by the editor)
- `POST /chat` — Drafts AI agentic assistant (SSE stream). Runs an agentic loop with Claude tool use. Available tools: `get_my_drafts`, `get_draft`, `get_public_drafts`, `create_draft`, `update_draft`, `delete_draft`, and `search_images` (Unsplash). `create_draft` requires `title`, `content_markdown` (converted to Tiptap JSON via `ContentService`), and `cover` (URL from `search_images`). Includes clickable links using the app URL structure (`/app/drafts/{id}`).

### TTS — `/api/tts`
- `POST /speak` — synthesise speech for an array of text chunks. Accepts an optional `language` param (default `en`). MP3 audio is uploaded to Cloudinary; the response returns a Cloudinary URL and per-word timestamps per chunk. Results are cached in `DraftTts` by content hash + language, so repeated plays are served instantly from the DB (audio from CDN). Voice selection uses `VOICE_MAP` (Neural2 voices for `en`, `fr`, `es`, `de`, `it`, `jp`, `pt`, `zh`, `ko`; Wavenet for `ar`).

### Translations — `/api/translations`
Per-user translation storage. Translations are completely separate from the original draft — the original is never mutated.
- `POST /` — upsert a translation (`{ draftId, language, content }`)
- `GET /?draftId=` — list all translations saved by the current user for a draft
- `GET /:language?draftId=` — fetch a single translation
- `DELETE /:language?draftId=` — delete a translation

### Users — `/api/users`
Profile read and update (avatar, name, etc.).

### Relations — `/api/relations`
Follow and unfollow users. Returns follower/following counts.

### Global search — `/api/global-search`
Full-text title search across public drafts.

---

## Database schema (key models)

| Model | Purpose |
|---|---|
| `User` | Platform accounts. Stores profile, hashed password (nullable for OAuth-only accounts), language preference, and follower/following relations. |
| `Draft` | Written drafts with rich content (JSON), Y.js state (bytes), tags (text[]), visibility, like count. |
| `DraftTts` | Cached TTS entries per draft + content hash + language. Stores Cloudinary audio URLs and per-word timestamps. Cascade-deleted with the draft; Cloudinary files are cleaned up in the same operation. |
| `DraftTranslation` | Per-user translations of a draft. Unique per `(draftId, userId, language)`. Cascade-deleted with the draft or user. |
| `Comment` | Inline comments with character range anchors (`from`, `to`). |
| `Like` | Draft likes (userId + draftId). |
| `Bookmark` | Saved drafts per user (userId + draftId). |
| `RecentlyRead` | Recently-read draft history per user (userId + draftId + timestamp). |
| `Notification` | In-app notifications. Stores recipient (`userId`), actor (`actorId`), type (`FOLLOW` \| `LIKE` \| `COMMENT`), optional `draftId`, and `read` flag. Cascade-deleted with user or draft. |
| `NotificationPreferences` | Per-user toggle for each notification type. Auto-created on first access with all toggles enabled. |

---

## Email templates

Transactional emails sent via Resend:

| Template | Trigger |
|---|---|
| Password reset | `POST /api/auth/forgot-password` |
| Email change verification | `POST /api/settings/email/request` |
| Password change verification | `POST /api/settings/password/request` |
| Account deactivated | `DELETE /api/settings/account` with `type: "deactivate"` |
| Account deleted | `DELETE /api/settings/account` with `type: "delete"` |

---

## ContentService

`src/content/content.service.ts` — converts markdown to Tiptap-compatible ProseMirror JSON.

Uses `prosemirror-markdown`'s `defaultMarkdownParser` (pure Node.js, no DOM). The transform pipeline has two levels:

- **`transformBlockArray`** — handles block-level nodes. Paragraphs containing inline images are split: the image becomes a standalone `imageUploader` block (tiptop-editor's block-only image node), with any surrounding text becoming separate paragraphs.
- **`transformInlineNode`** — handles inline content (text, marks, `hard_break`). Maps ProseMirror's `image` inline node → `imageUploader` with the correct attrs (`src`, `id`, `uploading: false`, `progress: 100`, `selectMedia: false`).

Nodes that have inline children (headings, code blocks) are routed through `transformInlineArray`; nodes with block children (blockquote, list items) go through `transformBlockArray`. `NODE_TYPE_MAP` and `MARK_TYPE_MAP` are the single places to add new extension name mappings.

---

## Environment variables

```env
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ANTHROPIC_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-service-account.json
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
UNSPLASH_ACCESS_KEY=...    # optional — enables cover image search in AI agent
```

---

## Development

```bash
pnpm install
pnpm start:dev      # starts on http://localhost:3001 with hot reload
```

### Database
```bash
npx prisma generate         # regenerate Prisma client after schema changes
npx prisma migrate deploy   # apply pending migrations
npx prisma studio           # open visual DB browser
```
