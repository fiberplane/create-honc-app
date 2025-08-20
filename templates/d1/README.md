## 🪿 HONC

This is a project created with the `create-honc-app` template. 

Learn more about the HONC stack on the [website](https://honc.dev) or the main [repo](https://github.com/fiberplane/create-honc-app).

> There is also an [Awesome HONC collection](https://github.com/fiberplane/awesome-honc) with further guides, use cases and examples.

This template uses a [Cloudflare D1](https://developers.cloudflare.com/d1) (sqlite) database. Running HONC with a D1 database involves two key steps: first, setting up the project locally, and second, deploying it in production. You can spin up your D1 database locally using Wrangler. If you're planning to deploy your application for production use, ensure that you have created a D1 instance in your Cloudflare account. Check out our docs learn more about [working with D1 databases](https://docs.honc.dev/stack/databases/#cloudflare-d1)!

### Getting started

Update the database name in your `wrangler.toml`:

```toml
database_name = "honc-d1-database"
```

Create the database, generate and apply migrations, and (optionally) seed the database:

```sh
npm run db:touch    # Create the database
npm run db:generate # Generate migration files
npm run db:migrate  # Apply migrations to (local) database
npm run db:seed     # Seed the (local) database with random data
```

Or just run `db:setup` to execute all four scripts!

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

This template comes with Vitest set up, and example tests to validate endpoints in `index.ts`. Remember to create a db and apply migrations before running tests (e.g., by running `db:setup`)!

To execute tests, run:

```sh
npm run test
```

Note that the `/tests` directory includes required module declaration and `setup` files.


### Deploying

Before deploying your worker to Cloudflare, ensure that you have a running D1 instance on Cloudflare to connect your worker to.

You can create a D1 instance by navigating to the `Workers & Pages` section and selecting `D1 SQL Database.`

Alternatively, you can create a D1 instance using the CLI:

```sh
npx wrangler d1 create <database-name>
```

After creating the database, update the `wrangler.toml` file with the database name and id.

```toml
[[d1_databases]]
binding = "DB"
database_name = "<new-database-name>"
database_id = "<database-id-you-just-created>"
migrations_dir = "drizzle/migrations"
```

Add the following secrets to a `.prod.vars` file:

```sh
CLOUDFLARE_D1_TOKEN=""    # An API token with D1 edit permissions. You can create API tokens from your Cloudflare profile
CLOUDFLARE_ACCOUNT_ID=""  # Find your Account id on the Workers & Pages overview (upper right)
CLOUDFLARE_DATABASE_ID="" # Find the database ID under workers & pages under D1 SQL Database and by selecting the created database
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
name = "my-d1-project"
```

Finally, deploy your worker:

```shell 
npm run deploy
```
