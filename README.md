# Beeceptor HTTP Callout — Playwright E2E

Playwright automation for [Beeceptor](https://beeceptor.com) **HTTP Callout** (sync mode): ensure a callout rule exists in the UI, trigger the mock API, and verify the forwarded response from [postman-echo.com](https://postman-echo.com).

## What this tests

- Sync HTTP Callout: caller waits for external response
- End-to-end flow: Beeceptor dashboard → mock URL → postman-echo.com → assertion
- Idempotent setup: create the rule only if `POST /trigger` is not already present

See [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md) for scope, constraints, and design decisions.

## Prerequisites

- Node.js 18+
- Beeceptor Free account with your own endpoint name (copy `.env.example` to `.env` and set `BEECEPTOR_PRIMARY_ENDPOINT`)
- Google login to Beeceptor

## Setup

```bash
git clone <your-repo-url>
cd assignment-bc
npm install
npx playwright install
cp .env.example .env
# Edit .env with your endpoint name and callout target
```

### One-time Google authentication

Google blocks **Sign in with Google** inside Playwright and codegen ("This browser or app may not be secure"). Use a **normal Chrome window** instead:

**Terminal 1** — open Chrome (not controlled by Playwright):

```bash
npm run auth:chrome
```

1. Chrome opens on Beeceptor login
2. Click **Sign in with Google** and complete sign-in
3. Wait until you see your endpoint dashboard
4. Leave this Chrome window **open**

**Terminal 2** — copy the session into Playwright:

```bash
npm run auth:save
```

Session saves to `playwright/.auth/user.json` (gitignored). You can close Chrome after `auth:save` succeeds.

**Alternative** if the above still fails:

```bash
npm run auth:persistent
```

If tests redirect to login later, delete `playwright/.auth/user.json` and repeat `auth:chrome` + `auth:save`.

**Security:** Never commit `.env` or `playwright/.auth/`. The auth file contains live session cookies for your Beeceptor account.

## Git / what to commit

Commit source files and `package-lock.json`. Do **not** commit:

- `.env` (local endpoint config)
- `playwright/.auth/` (Google session)
- `node_modules/`, `test-results/`, `playwright-report/`

## Run tests

```bash
npm test
```

Headed mode (debug UI):

```bash
npm run test:headed
```

HTML report:

```bash
npm run report
```

## Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `BEECEPTOR_PRIMARY_ENDPOINT` | Mock subdomain | `kubeboiii-mock` |
| `BEECEPTOR_CALLOUT_TARGET_URL` | External callout URL | `https://postman-echo.com/post` |
| `BEECEPTOR_TRIGGER_PATH` | Rule path | `/trigger` |

## Project structure

```
assignment-bc/
├── docs/TEST_STRATEGY.md
├── fixtures/auth.setup.js      # Google login → storageState
├── lib/config.js               # Env + URL helpers
├── pages/callout-rule.page.js  # Mock Rules UI interactions
├── tests/sync-callout.spec.js  # Main E2E test
├── playwright.config.js
└── .env.example
```

## Architecture

```
Playwright UI  →  Ensure sync callout rule on kubeboiii-mock (create if missing)
Playwright API →  POST /trigger
Beeceptor      →  Callout to postman-echo.com/post
Assertion      →  200 + forwarded JSON body
```

## Free plan notes

- No Request History API on Free plan — verification uses sync response body
- Callouts to other `*.beeceptor.com` URLs return 582
- 3 rules max per endpoint; delete unused rules manually in the Beeceptor UI if needed
- Automated rule deletion is not implemented (delete confirm UI is unreliable in Playwright)
- 50 requests/day per endpoint

## License

ISC
