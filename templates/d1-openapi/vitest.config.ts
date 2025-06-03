import path from "node:path";
import { defineWorkersConfig, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig(async () => {
  const migrationsPath = path.join(__dirname, 'drizzle/migrations');
  const migrations = await readD1Migrations(migrationsPath);

    return {
      test: {
        setupFiles: ["./tests/setup.ts"],
        globals: true,
        poolOptions: {
          workers: {
            wrangler: { configPath: "./wrangler.toml" },
              miniflare: {
                compatibilityFlags: ['nodejs_compat'],
                compatibilityDate: '2024-04-01',
                d1Databases: ['DB'],
                bindings: { TEST_MIGRATIONS: migrations }
              }
          },
        },
      },
      build: {
        rollupOptions: {
          external: ["@fiberplane/hono"],
        }
      },
      ssr: {
        /**
         * Instruct Vitest to inline these dependencies since Workered
         * is unable to load them dynamically in the test environment.
         * @see https://github.com/fiberplane/fiberplane/issues/589
         */
        noExternal: [
          "@sagold/json-pointer",
          "json-schema-library",
          "@fiberplane/hono"
        ],
      }
    }
});
