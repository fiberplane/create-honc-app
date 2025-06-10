declare module "cloudflare:test" {
  // ProvidedEnv controls the type of `import("cloudflare:test").env`
  interface ProvidedEnv extends Env {
    // Set in `vitest.config.ts` each time tests are run
    TEST_MIGRATIONS: D1Migration[];
  }
}
