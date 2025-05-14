// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

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
          items: [{ label: "Hono", slug: "stack/hono" }],
        },
        {
          label: "Solutions",
          autogenerate: { directory: "solutions" },
        },
      ],
      expressiveCode: {
        themes: ["github-dark", "github-light"],
        styleOverrides: {
          borderRadius: "var(--border-radius)",
        },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
