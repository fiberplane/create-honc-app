import { defineConfig } from "tsup";

const isDev = process.env.npm_lifecycle_event === "dev";

console.log("isDev", isDev);
console.log("process.env.npm_lifecycle_event", process.env.npm_lifecycle_event);

export default defineConfig({
  clean: true,
  entry: ["src/index.ts"],
  format: ["esm"],
  minify: !isDev,
  target: "esnext",
  outDir: "dist",
  sourcemap: true,
  onSuccess: isDev ? "node dist/index.js" : undefined,
  noExternal: ["tar", "minipass"],
});
