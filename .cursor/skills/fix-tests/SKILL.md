---
name: fix-tests
description: Fix failing Jest unit and e2e tests in a NestJS project. Use when tests fail, a test suite won't compile, imports can't be resolved, or providers are missing from a test module.
---

# Fix Tests

## Workflow

1. Run the failing suite to read the full error output.
2. Identify the root cause from the categories below.
3. Apply the fix, then re-run to confirm green.
4. Always run **both** unit and e2e tests — fix all failures before finishing.

## Rules

- **Only change test files.** Never modify production code to make a test pass.
- If it is unclear whether the test or the production code is wrong, ask before making any change.

## Commands

```bash
npm test              # unit tests
npm run test:e2e      # e2e tests
npm run test:cov      # coverage
```
