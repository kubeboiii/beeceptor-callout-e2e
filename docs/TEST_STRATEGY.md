# Test Strategy — Beeceptor HTTP Callout

## Feature overview

HTTP Callout lets a Beeceptor mock endpoint forward part of an incoming request to an external URL. Beeceptor supports two modes:

| Mode | Caller experience | Use case |
|------|-------------------|----------|
| **Sync** | Waits for callout response and returns it | Proxy-style integrations |
| **Async** | Gets instant mock response; callout runs in background | Webhooks, background jobs |

This suite automates **sync** mode on the Free plan.

## Testing objectives

**In scope**

- UI creation of a sync HTTP Callout rule on a Beeceptor endpoint (skipped if rule already exists)
- HTTP trigger of the mock URL via Playwright `request` fixture
- Verification that postman-echo.com response is forwarded to the caller

**Out of scope**

- Automated UI rule deletion (manual cleanup in Beeceptor if needed)

- Async callout automation (verification on Free plan needs Live Traffic Inspector or Team API)
- Request History / Management APIs (Team plan only)
- Load, retry, timeout, and failure-path testing
- Callouts to other `*.beeceptor.com` endpoints (returns 582 Invalid target)

## Critical path under test

1. Authenticate to Beeceptor (Google + saved browser session)
2. Open `kubeboiii-mock` console → Mock Rules
3. Create **New Callout Rule**: `POST /trigger`, sync, callout → `https://postman-echo.com/post` (skip if rule exists)
4. `POST https://kubeboiii-mock.free.beeceptor.com/trigger`
5. Assert `200` and JSON fields from postman-echo.com

## Configuration

| Setting | Value |
|---------|--------|
| Primary endpoint | `kubeboiii-mock` |
| Trigger path | `/trigger` |
| Callout target | `https://postman-echo.com/post` |
| Auth | Google OAuth with Playwright `storageState` |

## Callout target selection (discovered during manual testing)

| Target | Result |
|--------|--------|
| `kubeboiii-sink.free.beeceptor.com` | 582 Invalid target |
| `httpbin.org/post` | Intermittent 503 |
| `postman-echo.com/post` | Reliable 200 + JSON |

## Assertions

```javascript
expect(response.status()).toBe(200);
expect(body.url).toBe('https://postman-echo.com/post');
expect(body.headers['x-forwarded-host']).toBe('kubeboiii-mock.free.beeceptor.com');
```

## Assumptions

- Beeceptor Free plan and public endpoint remain available
- Google session is valid (re-run `npm run auth:chrome` then `npm run auth:save` if expired)
- postman-echo.com is reachable from Beeceptor servers
- At most 3 rules on the endpoint; test skips create when `/trigger` already exists

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| UI selector changes | Page object with role/text locators; trace on retry |
| OAuth session expires | Document `npm run auth:chrome` + `auth:save` re-auth flow |
| Orphan rules after failure | Idempotent setup skips create when rule exists; manual delete if needed |
| 50 requests/day limit | Avoid tight test loops during development |
| Flaky external target | postman-echo.com chosen after manual verification |

## Assignment requirement mapping

| Requirement | How we satisfy it |
|-------------|-------------------|
| Playwright opens Beeceptor | UI rule setup via page object |
| Create/configure HTTP Callout | Sync callout rule in Mock Rules UI (create if missing) |
| Trigger API call | `request.post(triggerUrl)` |
| Verify callout behavior | Forwarded postman-echo JSON |

## Demo video talking points

- Sync vs async and why sync was automated on Free plan
- Why postman-echo.com instead of a second Beeceptor endpoint
- Page object structure and assertion strategy
- Live test run with `npx playwright test`
