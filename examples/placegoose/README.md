# placegoose

### todo
- rate-limit config
    - rate check on ip
- cors config
- page rendering
- abstraction of db calls
    - rel update business logic
- error responses
- landing page
- deployment instructionså
- type drilling


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
