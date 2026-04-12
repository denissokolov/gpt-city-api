# GPT City API

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

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

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Bruno

If you work on UI, design, or product and need to **see what the API returns**—status codes, JSON shape, headers—without writing backend code, use [Bruno](https://www.usebruno.com/). It is a free, open-source desktop app (similar idea to Postman) for sending HTTP requests and reading responses.

**What you might use it for:** checking a response while you build a screen, confirming field names for a handoff, or reproducing a bug with a specific request.

**How to get started**

1. Install [Bruno](https://www.usebruno.com/) for your OS.
2. Clone this repository and install dependencies once: `npm install`.
3. Start the API locally: `npm run start`.
4. In Bruno, **Open Collection** and choose the `bruno/health` folder from this repo.
5. In the environment dropdown at the top, select **dev**. That profile points requests at the local server (for example `http://localhost:3000` via the `host` variable).

Collections and environments live in the repository as plain files, so the team shares the same requests and base URLs without a separate account for the tool.

## Deployment

This project is deployed via [Mau](https://mau.nestjs.com), the official NestJS platform for deploying applications on AWS.

To deploy:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```
