 db:## 🪿 HONC

This is a project created with the `create-honc-app` template. 

### Getting started
[D1](https://developers.cloudflare.com/d1/) is Cloudflare's serverless SQL database. Running HONC with a D1 database involves two key steps: first, setting up the project locally, and second, deploying it in production. You can spin up your D1 database locally using Wrangler. If you're planning to deploy your application for production use, ensure that you have created a D1 instance in your Cloudflare account.

### Project structure

```#
├── src
│   ├── index.ts # Hono app entry point
│   └── db
│       └── schema.ts # Database schema
├── .dev.vars.example # Example .dev.vars file
├── .prod.vars.example # Example .prod.vars file
├── client.ts # Optional client script to seed the db
├── drizzle.config.ts # Drizzle configuration
├── package.json
├── tsconfig.json # TypeScript configuration
└── wrangler.toml # Cloudflare Workers configuration
```

### Commands for local development

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
npm run db:seed
```


### Commands for deployment
Before deploying your worker to Cloudflare, ensure that you have a running D1 instance on Cloudflare to connect your worker to.

You can create a D1 instance by navigating to the `Workers & Pages` section and selecting `D1 SQL Database.`

Include the following information in the `.prod.vars` file:
```
CLOUDFLARE_D1_TOKEN="" // An API token with D1 edit rights. You can create API tokens from your Cloudflare profil
CLOUDFLARE_ACCOUNT_ID="" // You find the Account id on the Workers & Pages overview (upper right)
CLOUDFLARE_DATABASE_ID="" // You find the database ID under workers & pages under D1 SQL Database and by selecting the created database
```
If you haven’t generated the tables yet, run:
```shell
npm run db:generate
```

Afterwards, run the migration script for production:
```shell
npm run db:migrate:prod
```

Finally deploy your worker
```shell 
npm run deploy
```

You can now visit the worker’s address and access the API. If you wish, you can update the endpoint in the `client.ts` file to point to your deployed worker's address and run the script with `npm run client` to populate the D1 database in production.

Learn more about the HONC stack on the [website](https://honc.dev) or the main [repo](https://github.com/fiberplane/create-honc-app).

