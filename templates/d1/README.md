## 🪿 HONC

This is a project created with the `create-honc-app` template.

### Getting started
Text

### Project structure

```#
├── src
│   ├── index.ts # Hono app entry point
│   └── db
│       └── schema.ts # Database schema
├── client.ts # Optional client script to seed the db
├── .dev.vars.example # Example .dev.vars file
├── wrangler.toml # Cloudflare Workers configuration
├── drizzle.config.ts # Drizzle configuration
├── tsconfig.json # TypeScript configuration
└── package.json
```

### Commands

Run the migrations and (optionally) seed the database:

```sh
npm run db:touch
npm run db:generate
npm run db:migrate
```

Run the development server:

```sh
npm run dev
```
Once the application runs you can seed the database with the client script

```sh
npm run client
```

Learn more about the HONC stack on the [website](https://honc.dev) or the main [repo](https://github.com/fiberplane/create-honc-app).

