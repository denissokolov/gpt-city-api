# GPT City API

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run checks

```bash
# All checks in one command
$ npm run check
```

```bash
# TypeScript Checks
$ npm run typecheck

# eslint
$ npm run test

# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Scalar

If you work on UI, design, or product and need to **see what the API returns**—status codes, JSON shape, headers—without writing backend code, use [Scalar](https://scalar.com/). It is a browser-based API explorer built into this project—no extra install needed.

**What you might use it for:** browsing all available endpoints in one place, reading request/response schemas, or trying out a request directly in the browser.

**How to get started**

The easiest way is the staging environment—no local setup required:

- **Staging:** [https://gpt-city-api-5950170b319a.herokuapp.com/api](https://gpt-city-api-5950170b319a.herokuapp.com/api)

To use it locally:

1. Clone this repository and install dependencies once: `npm install`.
2. Start the API locally: `npm run start`.
3. Open [http://localhost:3000/api](http://localhost:3000/api) in your browser.

The page lists every endpoint, shows expected parameters and response shapes, and lets you send requests without leaving the browser.

## Deployment

This project is deployed to [Heroku](https://www.heroku.com/). Pushes to `main` that pass CI are deployed automatically via the GitHub Actions workflow.

### Prerequisites

1. Create a Heroku app and add the **Heroku Postgres** addon.
2. Set the following in your GitHub repo:
   - **Secret:** `HEROKU_API_KEY`
   - **Variables:** `HEROKU_APP_NAME`, `HEROKU_EMAIL`

### Manual deploy

```bash
$ git push heroku main
```

### View logs

```bash
$ heroku logs --tail --app gpt-city-api
```
