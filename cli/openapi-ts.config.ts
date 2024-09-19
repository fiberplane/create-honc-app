import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
	input: "https://neon.tech/api_spec/release/v2.json",
	output: "src/integrations/neon/api.ts",
  client: {
    bundle: true,
    name: "@hey-api/client-fetch",
  },
});
