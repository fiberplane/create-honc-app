## 🪿 Retrieval Augmented Goose (Cloudflare Docs Edition)

This is a project created with the `create-honc-app` template.

Learn more about the HONC stack on the [website](https://honc.dev) or the main [repo](https://github.com/fiberplane/create-honc-app).

### Getting started

Make sure you have Neon set up and configured with your database. Create a .dev.vars file with the `DATABASE_URL` and `OPENAI_API_KEY` keys and values (see: `.dev.vars.example`).

> **The `OPENAI_API_KEY` is necessary to produce embeddings for the vector store.**

### Project structure

```#
├── src
│   ├── index.ts # Hono app entry point
│   └── db
│       └── schema.ts # Database schema
├── scripts
│   ├── create-vectors.ts # Script to create vectors
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
pnpm run db:setup
```

Run the development server:

```sh
pnpm run dev
```

Add the vectors to the database (requires `OPENAI_API_KEY` in `.dev.vars`):

```sh
# Download a copy of the Cloudflare docs repo
cd data
bash copy-cf-docs.sh
# Build the docs since HTML is easier to chunk and vectorize than MDX
#   THIS TAKES A LOOOONG TIME just fyi
#   (as of writing, this is output to `cloudflare-docs/dist`)
cd cloudflare-docs
npm i
npm run build
# Create the vectors
cd ../../
pnpm run vectors:create
```

### Developing

When you iterate on the database schema, you'll need to generate a new migration and apply it:

```sh
pnpm run db:generate
pnpm run db:migrate
```

### Deploying

Set your `DATABASE_URL` secret (and any other secrets you need) with wrangler:

```sh
pnpx wrangler secret put DATABASE_URL
```

Deploy with wrangler:

```sh
pnpm run deploy
```