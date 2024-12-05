# placegoose

## Take a gander!
```typescript
// Run this code in a console, or from any app:
fetch("https://placegoose.mies.workers.dev/geese/1")
    .then((response) => response.json())
    .then((json) => console.log(json));
```

## What's it good for?
Placegoose is a free online REST API for moments when you **just need some honkin data!** More than that, it's a learning resource for building blazing-fast REST APIs with the [HO(N)C stack.](https://honc.dev/#overview) You're welcome to use it as a reference, or clone the repo and modify the schema to fit your use-case.

## How does the API work?
Placegoose comes with 3 goose-themed resources, supporting _up to_ all 5 common HTTP verbs. We don't actually make updates to the DB in response to write requests, but we do validate payloads and verify the target exists. If something's not right, we'll return an error with a helpful message.

To learn more about making requests, or what different errors mean, [check out our guide!](https://placegoose.mies.workers.dev/#guide)

## Deployment
To deploy the app, you'll need to provision and configure a production D1 instance.
```sh
npx wrangler d1 create placegoose-d1
```
Update your wrangler.toml with the database id of the database you just created:
```toml
[[d1_databases]]
binding = "DB"
database_name = "placegoose-d1"
database_id = "<DATABASE-ID-FROM-ABOVE>"
migrations_dir = "drizzle/migrations"
```
Then, grab an API key from your Cloudflare dashboard that has permissions to modify D1 databases, and set the following values in a `.prod.vars` file:
```sh
CLOUDFLARE_D1_TOKEN=""
CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_DATABASE_ID=""
```
Then run
```sh
pnpm db:migrate:prod
pnpm db:seed:prod
```
Finally, you can deploy the app with
```sh
pnpm run deploy
```
