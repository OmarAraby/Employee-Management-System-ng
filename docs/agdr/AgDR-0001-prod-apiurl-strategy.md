# Production apiUrl strategy — relative URL + same-origin reverse proxy

> In the context of shipping a deployable production build of the EMS Angular client, facing an undefined production API endpoint (and the discovery that `environment.prod.ts` was never wired via `fileReplacements`, so prod builds shipped the dev localhost URL), I decided to use a relative `apiUrl` (`/api`) with a same-origin reverse proxy in every production deployment to achieve a hosting-agnostic, CORS-free bundle, accepting that all production hosting must put a reverse proxy in front of the API.

## Context

- `environment.prod.ts` had `apiUrl` commented out AND was dead code — `angular.json` had no `fileReplacements`, so production builds used `environment.ts` with `apiUrl: 'https://localhost:7185/api'` (the dev URL).
- The ASP.NET Core API configures **no CORS policy** — any absolute cross-origin URL would fail in the browser regardless of which value we baked in.
- Immediate deployment target is local Docker Compose (initiative `ems-completion`); cloud hosting is undecided.

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| Build-time bake (absolute URL in `environment.prod.ts`) | Simplest; zero runtime moving parts | One bundle per environment; requires CORS on the API; URL must be known at build time |
| Runtime config (`assets/config.json` + APP_INITIALIZER) | One bundle serves all environments | New loading code + failure mode before app start; still requires CORS for cross-origin APIs |
| **Relative `/api` + same-origin reverse proxy** | One bundle for every environment; no CORS needed at all; standard nginx/App-Gateway pattern; pairs exactly with the compose stack (M1) | Every deployment MUST front the API with a proxy; direct-to-API hosting (e.g. static CDN + separate API domain) would need revisiting |

## Decision

Chosen: **relative `/api` + same-origin reverse proxy**, because the immediate target (Docker Compose with an nginx-served Angular container) provides the proxy for free, it eliminates the CORS gap without touching the API, and the bundle stays environment-agnostic. Also wired the missing `fileReplacements` so `environment.prod.ts` actually participates in production builds — without it any strategy is dead code.

## Consequences

- The M1 compose stack's ng container (nginx) must `proxy_pass /api` → the API container.
- Dev workflow unchanged (`environment.ts` keeps the absolute localhost URL; dev-server CORS behaviour to be verified in the E2E pass — ng#4).
- If hosting later splits the SPA and API onto different origins, revisit: either add runtime config or enable CORS + bake.

## Artifacts

- Ticket: OmarAraby/Employee-Management-System-ng#2
- Initiative: `projects/initiatives/ems-completion.md` (private portfolio repo), Milestone 2
