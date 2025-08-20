
<div align="center">
  <h1>Honc Honc!</h1>
  <img src="https://github.com/fiberplane/create-honc-app/blob/9290786147fe1efa2079899064853cf754f175e5/assets/honc.png" width="200" height="200" />
</div>

<p align="center">
    Scaffolding CLI for creating modular data APIs using TypeScript
</p>

<div align="center">
    <code>npm create honc-app@latest</code>
</div>
<br/>

[HONC](https://honc.dev) is a modular collection of choice technologies for building lightweight, type-safe, edge-enabled data apis that scale seamlessly to their demand.

  🪿 **[Hono](https://hono.dev)** as an api framework  
  🪿 **Nameyourdatabase** for maximum flexibility
  🪿 **[Drizzle](https://orm.drizzle.team/)** as the ORM and migrations manager  
  🪿 **[Cloudflare](https://workers.cloudflare.com/)** Workers for deployment hosting


> 📚 For more examples and templates, check out the [Awesome Honc](https://github.com/fiberplane/awesome-honc) repository.

## Quickstart

To get started run the following command:

```sh
npm create honc-app@latest
```

You'll be prompted a few simple questions, and then a fresh HONC project will arrive in a new directory on your machine.

### Commands

Run the development server:

```sh
npm run dev
```

Once you've [set up a database](https://docs.honc.dev/stack/databases/), you can generate migrations, apply them, and seed the database: 

```sh
npm run db:generate
npm run db:migrate
npm run db:seed
```

If you're inclined to deploy the app to the wild wild internet, you can do so as follows (requires a Cloudflare account):

```sh
npm run deploy
```

## More resources

Check out our docs at [honc.dev](https://honc.dev/)!

See the [examples](/examples) folder for some sample APIs.

We have an [Awesome HONC repository](https://github.com/fiberplane/awesome-honc) with further guides, use cases and examples.