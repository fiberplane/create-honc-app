## 🪿 HONC

This is a project created with the `create-honc-app` template.

Learn more about the HONC stack on the [website](https://honc.dev) or the main [repo](https://github.com/fiberplane/create-honc-app).

### Getting started

Make sure you have Neon set up and configured with your database. Create a .dev.vars file with the `DATABASE_URL` and `OPENAI_API_KEY` keys and values (see: `.dev.vars.example`).

These are necessary for the vector store to work.

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

Add the vectors to the database (requires `OPENAI_API_KEY` in `.dev.vars`):

```sh
npm run vectors:create
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
name = "retrieval-augmented-goose"
```

Deploy with wrangler:

```sh
npm run deploy
```