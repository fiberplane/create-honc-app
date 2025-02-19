## 🪿 HONC The Halls

A Made-for-TV Christmas Movie idea generator.

**See it live: https://honc-the-halls.fp.dev**

> This is a project created with a `create-honc-app` template.
> For the original README that describes the HONC stack, see [README-honc.md](./README-honc.md)

Learn more about the HONC stack on the [website](https://honc.dev) or the main [repo](https://github.com/fiberplane/create-honc-app).


### Deploying

Set the following secrets:

- `DATABASE_URL`
- `TOGETHER_API_KEY`

```sh
npx wrangler secret put DATABASE_URL
npx wrangler secret put TOGETHER_API_KEY
```

Deploy with wrangler:

```sh
npm run deploy
```