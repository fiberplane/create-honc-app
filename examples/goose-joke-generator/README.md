## 🪿 Goose Joke Generator

This is a project created with the D1 HONC template.

It is a simple Goose Joke Generator that uses Cloudflare AI to generate jokes, and store them in a D1 database.

The jokes are of a particularly poor quality.

### Getting started

Make sure you are logged in to Cloudflare and have access to Workers AI.

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

### Deploying to Cloudflare

> **Remember this uses some AI!** So you will be billed for any newly generated goose jokes.

Deploy with Cloudflare Wrangler.

#### Setting up the D1 database
First, create the D1 database:

```sh
pnpx wrangler d1 create goose-joke-generator
```

Then, update your wrangler.toml file to include the D1 database id:

```toml
[[d1_databases]]
binding = "DB"
database_name = "goose-joke-generator"
database_id = "<result from previous command>"
```

Finally, create a `.prod.vars` file with your Cloudflare API token, account ID, and database ID (See: `D1-explained.md`), and run the migrations against production:

```sh
pnpm run db:migrate:prod
```

#### Setting up KV for the rate limiter

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

