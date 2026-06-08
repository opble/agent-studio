# CLAUDE.md — agent-studio

## Project Overview

agent-studio is an open-source, self-hosted private studio for Mastra-based agent systems. It provides Auth0-authenticated remote access to run agents and workflows — a production-ready alternative to Mastra's dev-only Studio.

## Stack

- React 18 + Vite
- TypeScript (strict)
- Tailwind CSS
- React Router v6
- TanStack Query (React Query) v5
- @auth0/auth0-react

## Rules

- This is a **pure static SPA** — no backend, no SSR, no server-side code
- Never use `localStorage` or `sessionStorage` for tokens — Auth0 handles token storage in memory
- `localStorage` is allowed **only** for UI preferences (e.g. theme key `agent-studio-theme`)
- All Mastra API calls go through `src/api/client.ts` which injects the Bearer token
- Never import the Mastra SDK — call the REST API directly via fetch
- All environment variables must be prefixed with `VITE_`
- Use `pnpm` as the package manager

## Component Design Rules

- **One responsibility per file.** A component file does one thing. If it does two things, split it.
- **Max ~150 lines per component file** (excluding types/icons). Extract sub-components when approaching this limit.
- **No logic in pages.** Pages compose components; they don't contain business logic. All data fetching lives in hooks.
- **Shared UI atoms** live in `src/components/ui/` (e.g. `Spinner`, `EmptyState`, `Avatar`, `Badge`).
- **Feature components** live in `src/components/<feature>/` (e.g. `src/components/agents/`, `src/components/workflows/`).
- **Layout components** live in `src/components/layout/` (e.g. `Sidebar`, `Header`, `MobileNav`).
- Extract hooks for **all** data fetching and non-trivial state — never fetch inside a component body.

## Mobile-First Design Rules

- **Design mobile-first**, then enhance for larger screens using Tailwind's `md:` / `lg:` prefixes.
- **Navigation:** bottom tab bar on mobile (`< md`), sidebar on desktop (`md+`).
- **Touch targets:** minimum 44×44px for all interactive elements.
- **No horizontal overflow** — every layout must be verified at 375px viewport width.
- **Readable text:** minimum `text-sm` (14px) for body; `text-xs` (12px) only for labels/metadata.
- **Spacing:** prefer `p-4` / `gap-4` on mobile, scale up with `md:p-6` / `md:gap-6` on desktop.
- Test every new page/component at 375px (mobile) and 1280px (desktop) widths.

## Testing

- Test runner: **Vitest** with `jsdom` environment
- Every logic function in `src/api/`, `src/hooks/`, and `src/utils/` **must** have a corresponding unit test under `tests/` mirroring the same path (e.g. `src/utils/theme.ts` → `tests/utils/theme.test.ts`)
- Components are kept logic-light; test them only when they contain non-trivial logic
- Run tests with `pnpm test`; all tests must pass before merging

## Environment Variables

```env
VITE_AUTH0_DOMAIN=         # e.g. your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=      # Auth0 SPA application client ID
VITE_AUTH0_AUDIENCE=       # Auth0 API identifier, e.g. https://your-mastra-url/api
VITE_MASTRA_API_URL=       # Full URL of your Mastra server, e.g. https://agent.xoai.dev
```

> **Adding a new env var? Update all three places:**
> 1. `.env` / `.env.example` — local dev values
> 2. `src/vite-env.d.ts` — add to `ImportMetaEnv` interface for TypeScript
> 3. `public/config.js` — add with an empty-string placeholder so it ships in the release zip

## Key Architecture

### Auth flow
Auth0 PKCE SPA flow via `@auth0/auth0-react`. All routes except `/login` are wrapped in `ProtectedRoute` which redirects to Auth0 if not authenticated. The access token is retrieved via `useAuth0().getAccessTokenSilently()` and injected into every API request.

### API client pattern
```typescript
// src/api/client.ts
// All API calls go through this — never call fetch directly in components.
// Use getEnv() from src/utils/env.ts to read config — never import.meta.env directly.
export function createMastraClient(token: string): MastraClient {
  return new MastraClient({
    baseUrl: getEnv('VITE_MASTRA_API_URL'),
    headers: { Authorization: `Bearer ${token}` },
  })
}
```

### Workflow run polling
Workflow runs are async. After triggering a run, poll `GET /api/workflows/:id/runs/:runId` every 2 seconds using React Query's `refetchInterval` until status is `completed` or `failed`. Stop polling when terminal state is reached.

### Streaming agent responses
Agent `generate` endpoint supports streaming. Use `ReadableStream` / `TextDecoder` to consume the stream and update UI incrementally. Do not buffer the full response before displaying.

## Mastra API Endpoints

Base URL: `VITE_MASTRA_API_URL`

```
GET  /api/agents                               List all agents
POST /api/agents/:agentId/generate             Run agent (streaming)

GET  /api/workflows                            List all workflows
POST /api/workflows/:workflowId/execute        Trigger a workflow run
GET  /api/workflows/:workflowId/runs           List runs for a workflow
GET  /api/workflows/:workflowId/runs/:runId    Get run status + step results

GET  /api/agents                               Health probe (Mastra has no dedicated status endpoint)
```

## File Structure

```
src/
├── auth/
│   ├── Auth0Provider.tsx       Wraps app with Auth0Context
│   └── ProtectedRoute.tsx      Redirects unauthenticated users to login
├── api/
│   ├── client.ts               Base fetch with token injection
│   ├── agents.ts               Agent API functions
│   └── workflows.ts            Workflow API functions
├── pages/
│   ├── LoginPage.tsx
│   ├── AgentsPage.tsx
│   ├── WorkflowsPage.tsx
│   ├── WorkflowRunPage.tsx
│   └── HistoryPage.tsx
├── components/
│   ├── Layout.tsx              Sidebar + header shell
│   ├── AgentChat.tsx           Chat UI for agent interaction
│   ├── WorkflowForm.tsx        JSON input form for triggering workflows
│   ├── RunStatus.tsx           Step-by-step run progress
│   └── StreamOutput.tsx        Streaming text display
├── hooks/
│   ├── useAgents.ts
│   ├── useWorkflows.ts
│   └── useWorkflowRun.ts       Polling hook, stops on terminal state
├── App.tsx                     Router setup
└── main.tsx                    Auth0Provider + QueryClientProvider wrapping
```

## v1 Scope

Build only these features:
1. Auth0 login / logout with user avatar in header
2. Agents page: list agents, click to open chat, stream response
3. Workflows page: list workflows, click to trigger, show input form, live step progress
4. History page: list past runs per workflow, click to view output
5. Connection health indicator (green/red dot, checks `/api/system/status`)

Do not build: multi-user RBAC, multiple server connections, traces/observability, non-Auth0 providers.

## Scripts

```json
"dev": "vite",
"build": "tsc && vite build",
"preview": "vite preview",
"lint": "eslint src tests",
"lint:fix": "eslint src tests --fix",
"format": "prettier --write \"src/**/*.{ts,tsx,css}\" \"tests/**/*.{ts,tsx}\"",
"format:check": "prettier --check \"src/**/*.{ts,tsx,css}\" \"tests/**/*.{ts,tsx}\"",
"check": "pnpm lint && pnpm format:check",
"test": "vitest run",
"test:watch": "vitest"
```

## Code Quality — Mandatory Enforcement

**After every code change, you MUST run fix before considering the task complete:**

```bash
pnpm fix
```

Rules enforced:
- **ESLint** (`eslint.config.js`): `typescript-eslint` strict typed rules, `react-hooks`, `jsx-a11y`, `import/order`, `prettier` integration
- **Prettier** (`prettier.config.js`): single quotes, no semi, 100-char print width, trailing commas (ES5), LF line endings
- **TypeScript**: strict mode with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`

Never commit code that has ESLint **errors** (exit code 1). Warnings are acceptable only for Vitest `vi.mock()` import-order patterns which cannot be reordered without breaking test hoisting.

## Deployment

`pnpm build` produces a static `dist/` folder. Deploy to any static host:
- Vercel (recommended — add "Deploy to Vercel" button in README)
- Cloudflare Pages
- Netlify
- S3 + CloudFront

The app has no server-side component. Set env vars in the host's dashboard.

## Release Process

The project uses a two-track release pipeline via `.github/workflows/release.yml`:

| Track | Trigger | Tag | Use |
|---|---|---|---|
| **Dev build** | Every push to `main` | `latest` (moving) | Testing latest code — not for production |
| **Stable release** | Push to `main` where `package.json` version is new | `vX.Y.Z` (permanent) | Production deployments |

### Rules

- **Never commit a version bump directly to `main`.** Always bump in a PR so it gets reviewed.
- **Use `pnpm version` to bump** — it updates `package.json` and commits atomically:
  ```bash
  pnpm version patch   # bug fixes:        0.1.0 → 0.1.1
  pnpm version minor   # new features:     0.1.0 → 0.2.0
  pnpm version major   # breaking changes: 0.1.0 → 1.0.0
  ```
- **One version bump per PR.** Don't stack multiple semver bumps.
- **Dev builds are not for production.** Direct users to a stable `vX.Y.Z` release.
- `package.json` version is the single source of truth — never create git tags manually.
