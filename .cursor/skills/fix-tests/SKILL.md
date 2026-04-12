---
name: fix-tests
description: Fix failing Jest unit and e2e tests in a NestJS project. Use when tests fail, a test suite won't compile, imports can't be resolved, or providers are missing from a test module.
---

# Fix Tests

## Workflow

1. Run the failing suite to read the full error output.
2. Identify the root cause from the categories below.
3. Apply the fix, then re-run to confirm green.

## Commands

```bash
npm test              # unit tests
npm run test:e2e      # e2e tests
npm run test:cov      # coverage
```
