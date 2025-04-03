## 🪿 Website Uptime Monitor

A serverless website monitoring application built with the HONC stack (Hono, OpenTelemetry, and Cloudflare). This application allows you to monitor the uptime of websites by performing periodic health checks and storing the results in a D1 database.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/fiberplane/create-honc-app/tree/main/examples/uptime-monitor)

### Features

- Monitor multiple websites simultaneously
- Configurable check intervals per website
- Track response times and HTTP status codes
- Calculate uptime percentages
- RESTful API for managing monitored websites
- Simple web interface to view monitored sites

### Technology Stack

- **Hono**: Lightweight web framework for Cloudflare Workers
- **D1**: Cloudflare's serverless SQL database
- **Drizzle ORM**: Type-safe database toolkit
- **Durable Objects**: For managing persistent monitoring schedules
- **OpenTelemetry**: For observability and monitoring

### Getting Started

[D1](https://developers.cloudflare.com/d1/) is Cloudflare's serverless SQL database. Running this application involves two key steps: first, setting up the project locally, and second, deploying it in production.

### Project Structure

```#
├── src
│   ├── index.tsx # Hono app entry point
│   └── db
│       └── schema.ts # Database schema
├── .dev.vars.example # Example .dev.vars file
├── .prod.vars.example # Example .prod.vars file
├── seed.ts # Optional script to seed the db
├── drizzle.config.ts # Drizzle configuration
├── package.json
├── tsconfig.json # TypeScript configuration
└── wrangler.toml # Cloudflare Workers configuration
```

### Commands for local development

Create a `.dev.vars` file from the example file:

```sh
cp .dev.vars.example .dev.vars
```

Run the migrations and (optionally) seed the database:

```sh
# this is a convenience script that runs db:touch, db:generate, db:migrate, and db:seed
npm run db:setup
```

Run the development server:

```sh
npm run dev
```

As you iterate on the database schema, you'll need to generate a new migration file and apply it like so:

```sh
npm run db:generate
npm run db:migrate
```

### Commands for deployment

Before deploying your worker to Cloudflare, ensure that you have a running D1 instance on Cloudflare to connect your worker to.

You can create a D1 instance by navigating to the `Workers & Pages` section and selecting `D1 SQL Database.`

Alternatively, you can create a D1 instance using the CLI:

```sh
npx wrangler d1 create <database-name>
```

After creating the database, update the `wrangler.toml` file with the database id.

```toml
[[d1_databases]]
binding = "DB"
database_name = "uptime-d1-database"
database_id = "<database-id-you-just-created>"
migrations_dir = "drizzle/migrations"
```

Include the following information in a `.prod.vars` file:

```sh
CLOUDFLARE_D1_TOKEN="" # An API token with D1 edit permissions. You can create API tokens from your Cloudflare profile
CLOUDFLARE_ACCOUNT_ID="" # Find your Account id on the Workers & Pages overview (upper right)
CLOUDFLARE_DATABASE_ID="" # Find the database ID under workers & pages under D1 SQL Database and by selecting the created database
```

If you haven’t generated the latest migration files yet, run:
```shell
npm run db:generate
```

Afterwards, run the migration script for production:
```shell
npm run db:migrate:prod
```

Change the name of the project in `wrangler.toml` if you want to, but for now it is:

```toml
name = "uptime-monitor"
```

Finally, deploy your worker

```shell 
npm run deploy
```


