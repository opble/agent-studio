# agent-studio — Build Brief

## What is agent-studio?

An open-source, self-hosted private studio for Mastra-based agent systems. It replaces the Mastra Studio dev tool for production/remote use, with Auth0 authentication built in. Designed to work across multiple Mastra deployments (work projects, personal projects, etc.).

## Why it exists

Mastra's official Studio is a dev-only tool (localhost, no auth). Their managed platform with RBAC and remote access is a paid product. agent-studio fills the gap for teams and individuals who want:
- Remote access to their agent/workflow UI from anywhere
- Auth0-based login (no anonymous access)
- A self-hostable, open-source alternative

## Tech Stack

- **React + Vite** — pure static SPA, no server required
- **@auth0/auth0-react** — PKCE flow, tokens in memory (not cookies), no backend needed
- **Tailwind CSS** — styling
- **React Query (TanStack Query)** — API data fetching, polling for workflow run status
- **React Router** — client-side routing
- **TypeScript** — strict mode

## Auth Architecture

Auth0 SPA (PKCE) flow:
1. User visits the app → redirected to Auth0 login if not authenticated
2. Auth0 returns access token to the browser (memory only, not localStorage)
3. Every Mastra API call includes `Authorization: Bearer <access_token>`
4. Mastra server validates the token (via its own serverMiddleware or API Gateway JWT Authorizer)

No backend/BFF needed. Token never touches a server we control.

## Mastra API Integration

The app connects to a configurable Mastra server URL (set via env var `VITE_MASTRA_API_URL`).

Key Mastra REST endpoints to integrate (all under `/api`):

```
GET  /api/agents                          — list all agents
POST /api/agents/:agentId/generate        — run agent (stream response)
POST /api/agents/:agentId/stream          — stream agent response

GET  /api/workflows                       — list all workflows
POST /api/workflows/:workflowId/execute   — trigger workflow run
GET  /api/workflows/:workflowId/runs      — list runs for a workflow
GET  /api/workflows/:workflowId/runs/:runId — get specific run + step status

GET  /api/system/status                   — health check / verify connection
```

All requests must include:
```
Authorization: Bearer <auth0_access_token>
Content-Type: application/json
```

## Environment Variables

```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-mastra-api-url/api
VITE_MASTRA_API_URL=https://your-mastra-deployment.com
```

## Project Structure

```
agent-studio/
├── public/
├── src/
│   ├── auth/
│   │   ├── Auth0Provider.tsx       — wraps app with Auth0 context
│   │   └── ProtectedRoute.tsx      — redirects to login if not authenticated
│   ├── api/
│   │   ├── client.ts               — base fetch wrapper (injects Bearer token)
│   │   ├── agents.ts               — agent API calls
│   │   └── workflows.ts            — workflow API calls
│   ├── pages/
│   │   ├── LoginPage.tsx           — Auth0 login redirect page
│   │   ├── AgentsPage.tsx          — list and run agents
│   │   ├── WorkflowsPage.tsx       — list and trigger workflows
│   │   ├── WorkflowRunPage.tsx     — view live run status + step results
│   │   └── HistoryPage.tsx         — past workflow runs
│   ├── components/
│   │   ├── Layout.tsx              — sidebar nav, header, user avatar/logout
│   │   ├── AgentChat.tsx           — chat interface for running an agent
│   │   ├── WorkflowForm.tsx        — input form to trigger a workflow
│   │   ├── RunStatus.tsx           — step-by-step run progress display
│   │   └── StreamOutput.tsx        — streaming text output for agent responses
│   ├── hooks/
│   │   ├── useAgents.ts            — React Query hook for agents
│   │   ├── useWorkflows.ts         — React Query hook for workflows
│   │   └── useWorkflowRun.ts       — polling hook for run status
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .env.example
├── CLAUDE.md
└── package.json
```

## v1 Feature Scope

### In scope
- Auth0 login / logout
- Connection to configurable Mastra URL (env var)
- **Agents**: list all agents, run agent with text input, stream response output
- **Workflows**: list all workflows, trigger with JSON input form, view step-by-step run progress (polling), view run output
- **History**: list past workflow runs per workflow
- Health check indicator (connected / disconnected to Mastra)

### Out of scope for v1
- Multi-user / RBAC
- Multiple Mastra server connections in one UI
- Observability / traces viewer
- Other auth providers (interface abstracted, Auth0 only implemented)
- Agent memory / thread management

## Deployment

Static build — deploy anywhere:
- Vercel (recommended for others — one-click deploy button in README)
- Cloudflare Pages
- S3 + CloudFront
- Netlify
- Any static host

`pnpm build` → `dist/` folder is the entire deployable artifact.

## Auth0 Application Setup (for README)

1. Create a **Single Page Application** in Auth0 dashboard
2. Set **Allowed Callback URLs**: `http://localhost:5173, https://your-domain.com`
3. Set **Allowed Logout URLs**: same as above
4. Set **Allowed Web Origins**: same as above
5. Create an **API** in Auth0 with identifier = `VITE_AUTH0_AUDIENCE` value
6. Copy Domain and Client ID to `.env`

## Key Design Decisions

- **React + Vite over Next.js**: No server needed. Static build deploys anywhere. Auth0 PKCE SPA flow handles auth fully client-side. Next.js server-side token handling adds unnecessary complexity for a frontend-only tool.
- **Tokens in memory only**: PKCE flow + in-memory token storage. No localStorage. Acceptable security posture for a personal/team internal tool.
- **No Mastra SDK dependency**: Call Mastra REST API directly via fetch. Avoids version coupling and keeps the project framework-agnostic.
- **Polling for run status**: Mastra workflow runs are async. Poll `GET /runs/:runId` every 2s until status is `completed` or `failed`. Use React Query's `refetchInterval`.
- **Open source name**: `agent-studio` — avoids "mastra" to prevent trademark issues. README describes it as working with Mastra. Positioned to support other agent frameworks in future.
