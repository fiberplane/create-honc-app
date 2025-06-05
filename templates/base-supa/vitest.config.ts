import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig(async () => {
  return {
    test: {
      globals: true,
      poolOptions: {
        workers: {
          wrangler: { configPath: "./wrangler.toml" },
          miniflare: {
            compatibilityFlags: ["nodejs_compat"],
            compatibilityDate: "2024-04-01",
          },
        },
      },
    },
    build: {
      rollupOptions: {
        external: ["@fiberplane/hono"],
      },
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
        "@fiberplane/hono",
      ],
    },
  };
});
