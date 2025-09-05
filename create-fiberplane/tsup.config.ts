import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  minify: false,
  bundle: true,
  splitting: false,
  dts: false,
});
