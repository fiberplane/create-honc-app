import { applyD1Migrations, env } from "cloudflare:test";

/**
 * Apply migrations written from file to test-only environment
 * varible in `vitest.config.ts`
 * @see https://github.com/cloudflare/workers-sdk/tree/main/fixtures/vitest-pool-workers-examples/d1
 */
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
