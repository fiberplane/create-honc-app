## 🪿 HONC

This is a project created with the `create-honc-app` template.

Learn more about the HONC stack on the [website](https://honc.dev) or the main [repo](https://github.com/fiberplane/create-honc-app).

> There is also an [Awesome HONC collection](https://github.com/fiberplane/awesome-honc) with further guides, use cases and examples.

This template uses Drizzle to query a Supabase (postgres) database. It also has [a version of Hono](https://hono.dev/examples/zod-openapi) that can generate an OpenAPI spec from your code. The OpenAPI spec is served from the route `/openapi.json`. To explore your API interactively, run `npm run dev` and go to `http://localhost:8787/fp`.

### Getting started

Make sure you have Supabase set up and configured with your database. Create a .dev.vars file with the `DATABASE_URL` key and value (see: `.dev.vars.example`).

If you're working locally, your `DATABASE_URL` will be something like:

```sh
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

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

Change the name of the project in `wrangler.toml` to something appropriate for your project:

```toml
name = "my-supabase-project"
```

Deploy with wrangler:

```sh
npm run deploy
```
