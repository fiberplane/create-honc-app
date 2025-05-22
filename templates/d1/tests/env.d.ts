import type { Bindings } from '../src/index';

declare module "cloudflare:test" {
    // ProvidedEnv controls the type of `import("cloudflare:test").env`
    interface ProvidedEnv extends Env {
      TEST_MIGRATIONS: D1Migration[];
    };
  }