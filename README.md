# agent-studio

An open-source, self-hosted private studio for [Mastra](https://mastra.ai)-based agent systems. It replaces Mastra's dev-only Studio for production and remote use, with Auth0 authentication built in.

## Why it exists

Mastra's official Studio is a dev-only tool (localhost, no auth). agent-studio fills the gap for teams and individuals who want:

- Remote access to their agent/workflow UI from anywhere
- Auth0-based login (no anonymous access)
- A self-hostable, open-source alternative to Mastra's managed platform

## Features

- **Auth0 login / logout** — PKCE SPA flow, tokens in memory only (no localStorage)
- **Agents** — list all agents, open a chat, stream responses in real time
- **Workflows** — list all workflows, trigger with a schema-validated input form, watch step-by-step progress live, resume suspended runs
- **History** — browse past workflow runs per workflow, inspect step output
- **Connection health indicator** — green/red dot showing Mastra server reachability
- **Dark / light theme** — persisted via localStorage (UI preference only)

## Tech Stack

- **React 18 + Vite** — pure static SPA, no server required
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **React Router v6**
- **TanStack Query v5** — data fetching and workflow run polling
- **@auth0/auth0-react** — PKCE flow
- **Zod** — schema-based form validation for workflow inputs

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-org/agent-studio.git
cd agent-studio
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-mastra-api-url/api
VITE_MASTRA_API_URL=https://your-mastra-deployment.com

# Optional: set to 'localstorage' to keep the session alive across page reloads
# VITE_AUTH0_CACHE_LOCATION=memory
```

### 3. Auth0 Application Setup

1. Create a **Single Page Application** in Auth0 dashboard
2. Set **Allowed Callback URLs**: `http://localhost:5173, https://your-domain.com`
3. Set **Allowed Logout URLs**: same as above
4. Set **Allowed Web Origins**: same as above
5. Create an **API** in Auth0 with identifier matching `VITE_AUTH0_AUDIENCE`
6. Copy Domain and Client ID to `.env.local`

### 4. Run locally

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Type-check + production build |
| `pnpm preview` | Preview production build locally |
| `pnpm test` | Run all tests |
| `pnpm fix` | Lint fix + format + lint check |
| `pnpm check` | Lint + format check (no writes) |

## Mastra API Integration

Connects to any Mastra server via `VITE_MASTRA_API_URL`. All requests carry `Authorization: Bearer <access_token>`.

```
GET  /api/agents                                — list all agents
POST /api/agents/:agentId/generate              — run agent (streaming)

GET  /api/workflows                             — list all workflows
POST /api/workflows/:workflowId                 — create a workflow run
POST /api/workflows/:workflowId/runs/:runId/start  — start a run with input
POST /api/workflows/:workflowId/runs/:runId/resume — resume a suspended run
GET  /api/workflows/:workflowId/runs            — list runs for a workflow
GET  /api/workflows/:workflowId/runs/:runId     — get run status + step results
```

> The health indicator probes `GET /api/agents` every 30 seconds (Mastra has no dedicated `/api/system/status` endpoint).

## Project Structure

```
src/
├── auth/
│   ├── Auth0Provider.tsx          — wraps app with Auth0 context
│   └── ProtectedRoute.tsx         — redirects to login if not authenticated
├── api/
│   ├── client.ts                  — base fetch wrapper (injects Bearer token)
│   ├── agents.ts                  — agent API calls
│   └── workflows.ts               — workflow API calls (create, start, resume, list)
├── pages/
│   ├── LoginPage.tsx
│   ├── AgentsPage.tsx
│   ├── WorkflowsPage.tsx
│   ├── WorkflowRunPage.tsx
│   └── HistoryPage.tsx
├── components/
│   ├── Layout.tsx                 — shell: sidebar + header + mobile nav
│   ├── AgentChat.tsx              — chat interface for agent interaction
│   ├── RunStatus.tsx              — step-by-step run progress display
│   ├── StreamOutput.tsx           — streaming text for agent responses
│   ├── agents/
│   │   ├── AgentHeader.tsx
│   │   ├── AgentListItem.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatMessage.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── HealthIndicator.tsx
│   │   ├── MobileNav.tsx
│   │   ├── NavLink.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── UserMenu.tsx
│   ├── ui/
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── EmptyState.tsx
│   │   └── Spinner.tsx
│   └── workflows/
│       ├── ResultRenderer.tsx
│       ├── RunListItem.tsx
│       ├── RunStepRow.tsx
│       ├── SchemaForm.tsx         — Zod-validated form built from workflow input schema
│       ├── StartRunModal.tsx
│       ├── StepStatusBadge.tsx
│       ├── WorkflowForm.tsx
│       └── WorkflowListItem.tsx
├── hooks/
│   ├── useAgents.ts
│   ├── useHealthCheck.ts          — polls /api/agents every 30s for connectivity
│   ├── useRunActions.ts           — start / resume workflow run actions
│   ├── useTheme.ts                — dark/light theme toggle (localStorage for preference)
│   ├── useWorkflowRun.ts          — polls run status until terminal state
│   ├── useWorkflowRuns.ts         — lists runs for a workflow
│   └── useWorkflows.ts
├── utils/
│   └── theme.ts                   — theme helpers (apply, save, toggle)
├── styles/
│   ├── index.css
│   └── theme.css                  — CSS custom properties for light/dark tokens
├── App.tsx
└── main.tsx
```

## Auth Architecture

Auth0 PKCE SPA flow:
1. User visits the app → redirected to Auth0 login if not authenticated
2. Auth0 returns an access token to the browser (memory only, not localStorage)
3. Every Mastra API call includes `Authorization: Bearer <access_token>`
4. Mastra server validates the token

No backend/BFF needed. Token never touches a server we control.

## Deployment

`pnpm build` produces a static `dist/` folder. Deploy to any static host:

- Vercel (recommended — set env vars in project settings)
- Cloudflare Pages
- Netlify
- S3 + CloudFront
- Any static file server

## Key Design Decisions

- **No Mastra SDK dependency** — call the REST API directly via fetch. Avoids version coupling and keeps the project framework-agnostic.
- **Tokens in memory only** — PKCE flow. Acceptable security posture for a personal/team internal tool.
- **Polling for run status** — workflow runs are async; poll `GET /runs/:runId` every 2s via React Query's `refetchInterval`, stopping on `completed` or `failed`.
- **Schema-driven workflow forms** — `SchemaForm` introspects the workflow's input schema (Zod/JSON Schema) so inputs are validated before submission.
- **Static SPA** — no backend, no SSR. Deploys anywhere. Auth0 PKCE handles auth fully client-side.

## v1 Scope

### In scope
- Auth0 login / logout
- Agents: list, chat, stream response
- Workflows: list, trigger, start, resume, live step progress
- History: list past runs, inspect step output
- Connection health indicator
- Dark / light theme

### Out of scope for v1
- Multi-user RBAC
- Multiple Mastra server connections
- Observability / traces viewer
- Non-Auth0 auth providers
- Agent memory / thread management
