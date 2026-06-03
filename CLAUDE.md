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
- All Mastra API calls go through `src/api/client.ts` which injects the Bearer token
- Never import the Mastra SDK — call the REST API directly via fetch
- Keep components small and focused — extract hooks for all data fetching
- All environment variables must be prefixed with `VITE_`
- Use `pnpm` as the package manager

## Environment Variables

```env
VITE_AUTH0_DOMAIN=         # e.g. your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=      # Auth0 SPA application client ID
VITE_AUTH0_AUDIENCE=       # Auth0 API identifier, e.g. https://your-mastra-url/api
VITE_MASTRA_API_URL=       # Full URL of your Mastra server, e.g. https://agent.xoai.dev
```

## Key Architecture

### Auth flow
Auth0 PKCE SPA flow via `@auth0/auth0-react`. All routes except `/login` are wrapped in `ProtectedRoute` which redirects to Auth0 if not authenticated. The access token is retrieved via `useAuth0().getAccessTokenSilently()` and injected into every API request.

### API client pattern
```typescript
// src/api/client.ts
// All API calls go through this — never call fetch directly in components
export async function mastraFetch(path: string, options: RequestInit, token: string) {
  return fetch(`${import.meta.env.VITE_MASTRA_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
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

GET  /api/system/status                        Health check
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
"lint": "eslint src --ext ts,tsx"
```

## Deployment

`pnpm build` produces a static `dist/` folder. Deploy to any static host:
- Vercel (recommended — add "Deploy to Vercel" button in README)
- Cloudflare Pages
- Netlify
- S3 + CloudFront

The app has no server-side component. Set env vars in the host's dashboard.
