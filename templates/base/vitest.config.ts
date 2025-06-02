import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig(async () => {
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
      noExternal: [
        "@sagold/json-pointer",
        "json-schema-library",
        "@fiberplane/hono"
      ],
    }
  }
});
