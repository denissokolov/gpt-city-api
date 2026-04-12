---
name: check
description: Run the full quality check suite for this NestJS project — typecheck, lint, unit tests, and e2e tests — one step at a time, then analyze failures and fix them. Use when the user asks to run checks, verify the build, run the full test suite, or validate code changes before committing or merging.
---

# Check

Run each step in order. Stop at the first failure, fix it, then re-run that step before continuing.

## Steps

1. `npm run typecheck` — TypeScript compilation errors
2. `npm run lint` — ESLint violations (auto-fixable ones are applied by `--fix`)
3. `npm run test` — Jest unit tests
4. `npm run test:e2e` — Jest e2e tests

## Workflow

```
for each step:
  run command
  if exit code != 0:
    analyze output
    fix all issues
    re-run step to confirm green
    then continue to next step
report final status
```

## Fixing failures

**typecheck** — fix type errors in the flagged files; never use `any` to silence an error.

**lint** — if `--fix` didn't resolve it, fix the rule violation manually; never disable a rule inline unless it is a genuine false positive.

**test / test:e2e** — read the failing test, understand the assertion, then fix the implementation (or the test if it is stale). Use the fix-tests skill for complex test failures.

## Reporting

After all steps pass, summarize in one line per step:

```
✓ typecheck
✓ lint
✓ test        (N passed)
✓ test:e2e    (N passed)
```

If a step could not be fixed, report what was tried and what is still failing.
