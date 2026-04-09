# E2E tests (Playwright) — `apps/example/tests/e2e`

**Audience:** agents / LLM. Pyramid: E2E only for **essential auth flows**; keep
the suite minimal.

## Test with E2E (allowed)

- Sign-in (valid credentials)
- Sign-in errors (invalid credentials)
- Sign-out
- Protected route redirect

## Do not add E2E for

Form validation, UI components, API integration, DB/RLS, business logic — use
unit/integration/RLS tests.

## Why minimal

Slow, brittle, expensive CI; unit/integration cover most cases. Target ~5% E2E
in the pyramid.

## Commands

```bash
pnpm exec playwright install          # first time
pnpm exec playwright test --ui
pnpm exec playwright test
pnpm exec playwright test auth.spec.ts
pnpm exec playwright test --project=chromium
```

## CI

Playwright is wired from repo root `playwright.config.ts` (not only this
folder). Quality workflow may run E2E when enabled.

## Environment

- Base URL: `http://localhost:3000` (or `E2E_BASE_URL`)
- Browsers: chromium / firefox / webkit per config
- Auth tests needing a user: `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD` (use
  `test.skip` when unset)

## Config

See monorepo `playwright.config.ts` (timeouts, reporter, `webServer`).

## POM

Not used (< ~10 tests). If the suite grows, consider `pages/` under this
directory.

## Debug

```bash
pnpm exec playwright test --debug
PWDEBUG=1 pnpm exec playwright test auth.spec.ts
pnpm exec playwright show-report
```

## Troubleshooting

- Timeout: ensure dev server; check `E2E_BASE_URL`; raise timeout in config.
- Element not found: selectors vs i18n locale; use `--debug`.
- Slow: expected for E2E; reduce projects in CI if needed.

## Adding tests (discouraged)

If essential: extend `auth.spec.ts` or add `.spec.ts`, `test.skip` for env gaps,
document why E2E is required in the spec file.

## See also

- `docs/architecture/testing.md`
- `tests/unit/`, `tests/integration/`, `tests/rls/`
