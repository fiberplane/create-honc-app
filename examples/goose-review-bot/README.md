# 🪿 GitHub PR Review Bot

An automated code review bot that provides "goosey" code reviews on your pull requests using Claude AI. Built with the [HONC stack](https://honc.dev).

## Features

- Automatically reviews new pull requests when opened
- Stores PR and review data in Neon Database
- Provides detailed code reviews focusing on:
  - Potential bugs and issues
  - Security concerns
  - Performance implications
  - Code style and best practices
  - Suggestions for improvement
- Reviews are posted as PR comments with an angry goose persona

## Tech Stack

- Hono - Web framework
- OpenTelemetry (via @fiberplane/hono-otel) - Observability
- Neon - Serverless Postgres database
- Claude (Anthropic) - AI code reviews
- Cloudflare Workers - Serverless runtime

## Getting Started

1. Set up your environment variables in `.dev.vars`:

```sh
DATABASE_URL= # Your Neon database URL
GITHUB_TOKEN= # GitHub Personal Access Token
ANTHROPIC_API_KEY= # Claude API Key
```

2. Add your webhook URL to the GitHub repo settings:

Within your GitHub repo, go to `Settings` -> `Webhooks` -> `Add webhook`. You can either deploy your worker to Cloudflare or run it locally and use the Fiberplane Studio Public URL to test.

3. Install dependencies:

```sh
pnpm install
```

4. Run the migrations and (optionally) seed the database:

```sh
pnpm run db:setup
```

5. Run the development server:

```sh
pnpm run dev
```

## API Endpoints

- `GET /` - Health check endpoint
- `POST /api/pull-requests` - Webhook endpoint for GitHub PR events
- `GET /api/reviews` - List all reviews
- `POST /api/reviews` - Create a new review
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

## Database Schema

The application uses two main tables:

### Pull Requests
- Stores PR metadata including title, description, author, and GitHub references
- Tracks PR status and timestamps

### Reviews
- Links to pull requests via `github_pr_id`
- Stores review comments, status, and reviewer information
- Maintains timestamps for review activity

### Project structure

```#
├── src
│   ├── index.ts # Hono app entry point
│   └── db
│       └── schema.ts # Database schema
├── seed.ts # Optional seeding script
├── .dev.vars.example # Example .dev.vars file
├── wrangler.toml # Cloudflare Workers configuration
├── drizzle.config.ts # Drizzle configuration
├── tsconfig.json # TypeScript configuration
└── package.json
```

### Commands

Run the migrations and (optionally) seed the database:

```sh
# this is a convenience script that runs db:generate, db:migrate, and db:seed
npm run db:setup
```

Run the development server:

```sh
npm run dev
```

### Developing

When you iterate on the database schema, you'll need to generate a new migration and apply it:

```sh
npm run db:generate
npm run db:migrate
```

### Deploying

Set your `DATABASE_URL` secret (and any other secrets you need) with wrangler:

```sh
npx wrangler secret put DATABASE_URL
```

Finally, change the name of the project in `wrangler.toml` to something appropriate for your project

```toml
name = "my-neon-project"
```

Deploy with wrangler:

```sh
npm run deploy
```