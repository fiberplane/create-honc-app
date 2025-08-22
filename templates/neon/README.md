## 🪿 HONC

This is a project created with the `create-honc-app` template.

Learn more about the HONC stack on the [website](https://honc.dev) or the main [repo](https://github.com/fiberplane/create-honc-app).

> There is also an [Awesome HONC collection](https://github.com/fiberplane/awesome-honc) with further guides, use cases and examples.

This template uses a remote [Neon](https://neon.com/) (postgres) database for both local development and deployment. You can use Neon [database branches](https://neon.com/branching) to create isolated databases for each. Check out our docs to learn more about [working with Neon databases](https://docs.honc.dev/stack/databases/#neon)!

### Getting started

Create a Neon account and database if you haven't already, then add your database URL to a `.dev.vars` file (see: `.dev.vars.example`).

```sh
DATABASE_URL="postgresql://username:password@hostname.us-east-2.aws.neon.tech/databaseName?sslmode=require"
```

Generate and apply migrations, and (optionally) seed the database:

```sh
npm run db:generate # Generate migration files
npm run db:migrate  # Apply migrations to (local) database
npm run db:seed     # Seed the (local) database with random data
```

Or just run `db:setup` to execute all three scripts!

Run the development server:

```sh
npm run dev
```

### Project structure

```#
├── drizzle            # Migrations and database helpers
├── src
│   ├── index.ts       # Hono app entry point
│   └── db
│       └── schema.ts  # Database schema
├── tests              # Test suites and configuration
├── .dev.vars.example  # Example .dev.vars file
├── .prod.vars.example # Example .prod.vars file
├── biome.json         # Biome lint and format configuration
├── drizzle.config.ts  # Drizzle configuration
├── seed.ts            # Script to seed the db
├── package.json
├── tsconfig.json      # TypeScript configuration
├── vitest.config.ts   # Vitest configuration
└── wrangler.toml      # Cloudflare Workers configuration
```

### Developing

When you iterate on the database schema, you'll need to generate a new migration and apply it:
```sh
npm run db:generate
npm run db:migrate
```

To format code, run:

```bash
npm run lint && npm run format
```

### Testing

This template comes with Vitest set up, and example tests to validate endpoints in `index.ts`.

First, add your Neon Project ID and API Token to your `.dev.vars` file:

```sh
NEON_PROJECT_ID=""
NEON_API_TOKEN=""
```

To execute tests, run:

```sh
npm run test
```

Note that the `/tests` directory includes required module declaration and `setup` files.

The `setup` file spins up and tears down an isolated test database branch for each test run. The primary Neon database is used for convenience, but in practice test branches should be branched from a dedicated testing database branch to avoid leaking user data.

Run `wrangler types` to get type-safe access to environment variables in setup files.

### Deploying

Add your production `DATABASE_URL` (and any other production secrets) to a `.prod.vars` file:

```sh
DATABASE_URL="postgresql://username:password@hostname.us-east-2.aws.neon.tech/databaseName?sslmode=require"
```

You can do so manually, or using the `wrangler` CLI:

```sh
npx wrangler secret put <KEY>
```

If you haven’t generated the latest migration files yet, run:
```shell
npm run db:generate
```

Afterwards, run the migration script for production:
```shell
npm run db:migrate:prod
```

You can also run the seed script for production:
```shell
npm run db:seed:prod
```

Update your `wrangler.toml` with a name appropriate to your project:

```toml
name = "my-neon-project"
```

Finally, deploy your worker:

```sh
npm run deploy
```
