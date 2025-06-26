// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/": "/get-started",
  },
  integrations: [
    starlight({
      title: "HONC Docs",
      favicon: "/favicon/favicon.ico",
      customCss: ["./src/styles/global.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/fiberplane/create-honc-app",
        },
        {
          icon: "discord",
          label: "Discord",
          href: "https://discord.com/invite/ugAwAK6Yzm",
        },
      ],
      sidebar: [
        "get-started",
        {
          label: "The Stack",
          items: [
            { label: "Hono", slug: "stack/hono" },
            { label: "Cloudflare", slug: "stack/cloudflare" }
          ],
        },
        {
          label: "Solutions",
          autogenerate: { directory: "solutions" },
        },
      ],
      components: {
        Banner: "./src/components/Banner.astro",
        Footer: "./src/components/Footer.astro",
        Head: "./src/components/Head.astro",
        Header: "./src/components/Header.astro",
      },
      expressiveCode: {
        themes: ["github-dark", "github-light"],
        styleOverrides: {
          borderRadius: "var(--border-radius)",
        },
      },
    }),
  ]
});
