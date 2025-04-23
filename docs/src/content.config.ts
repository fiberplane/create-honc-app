import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection, z } from "astro:content";

const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema()
});


// const changelog = defineCollection({
//   loader: glob({
//     pattern: "**/[^_]*.{md,mdx}",
//     base: "./src/content/changelog"
//   }),
//   schema: z.object({
//     date: z.coerce.date(),
//     version: z.string(),
//     draft: z.boolean().optional()
//   })
// });

export const collections = {
  docs,
};