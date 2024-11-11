## 🪿 Goose Joke Generator

This is a project created with the Neon HONC template.

It is a simple Goose Joke Generator that uses Cloudflare AI to generate jokes, and store them in a Neon Postgres database.

The jokes are of a particularly poor quality.

### Getting started

Make sure you have Neon set up and the api is configured to use your database. 

To do this, create a `.dev.vars` file with your Neon connection string as the `DATABASE_URL` key and value (see: `.dev.vars.example`).

Also make sure you are logged in to Cloudflare and have access to Workers AI.

Then, run `pnpm dev` to kick off the app locally.

### Project structure

```#
├── src
│   ├── index.tsx # Hono app entry point
│   ├── HomePage.tsx # Extremely good looking home page
│   ├── rate-limiter.ts # Rate limiter middleware
│   └── db
│       └── schema.ts # Database schema
├── seed.ts # Seeding script
├── .dev.vars.example # Example .dev.vars file
├── wrangler.toml # Cloudflare Workers configuration
├── drizzle.config.ts # Drizzle configuration
├── tsconfig.json # TypeScript configuration
└── package.json
```

### Commands

Run the migrations and (optionally) seed the database:

```sh
pnpm run db:generate
pnpm run db:migrate
pnpm run db:seed
```

Run the development server:

```sh
pnpm dev
```

Test and debug with Fiberplane:

```sh
pnpm fiberplane
```

### Deploying to Cloudflare

> **Remember this uses some AI!** So you will be billed for any newly generated goose jokes.

Deploy with Cloudflare Wrangler.

First set the DATABASE_URL as a secret:

```sh
pnpx wrangler secret put DATABASE_URL
# when prompted, enter your Neon connection string
```

Then, create the KV binding on your account, since we use that for the rate limiter:

```sh
pnpx wrangler kv namespace create GOOSE_JOKES_CACHE
```

And set the ID of the KV binding in `wrangler.toml`

```toml
[[kv_namespaces]]
binding = "GOOSE_JOKES_CACHE"
id = "<result from previous command>"
```

Then deploy:

```sh
pnpm run deploy
```

