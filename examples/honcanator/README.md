## 🪿 honcanator - AI geese photo generator

Generate comic / anime style geese with Cloudflare AI and store the resulting image in D2. Metadata about the Goose gets stored in a Neon Postgres database.

This is a project created with the `create-honc-app` template.
Learn more about the HONC stack on the [website](https://honc.dev) or the main [repo](https://github.com/fiberplane/create-honc-app).

### Getting started

Make sure you have Neon set up and configured with your database. Create a .dev.vars file with the `DATABASE_URL` key and value (see: `.dev.vars.example`).

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

Once you call the `NewGoose` endpoint and you have not yet authenticated Wrangler with your Cloudflare account, you will be automatically prompted with a OAuth login in your browser.
This is required because Cloudflare AI always contacts the Cloudflare servers, which also means you will get charged.

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

Create a new R2 bucket to match the one in `wrangler.toml`:

```sh
pnpx wrangler r2 bucket create honcanator-geese
```

Finally, change the name of the project in `wrangler.toml` to something appropriate for your project

```toml
name = "my-neon-project"
```

Deploy with wrangler:

```sh
npm run deploy
```
