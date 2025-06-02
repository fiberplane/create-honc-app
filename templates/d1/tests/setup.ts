import { applyD1Migrations, env } from 'cloudflare:test'

// https://github.com/cloudflare/workers-sdk/tree/main/fixtures/vitest-pool-workers-examples/d1
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
