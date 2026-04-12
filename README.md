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

## Bruno

If you need more control over requests—custom headers, scripting, chained calls—use [Bruno](https://www.usebruno.com/). It is a free, open-source desktop app (similar idea to Postman) for sending HTTP requests and reading responses.

**What you might use it for:** checking a response while you build a screen, confirming field names for a handoff, or reproducing a bug with a specific request.

**How to get started**

1. Install [Bruno](https://www.usebruno.com/) for your OS.
2. Clone this repository and install dependencies once: `npm install`.
3. Start the API locally: `npm run start`.
4. In Bruno, **Open Collection** and choose the `bruno/health` folder from this repo.
5. In the environment dropdown at the top, select **dev**. That profile points requests at the local server (for example `http://localhost:3000` via the `host` variable).

Collections and environments live in the repository as plain files, so the team shares the same requests and base URLs without a separate account for the tool.

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
