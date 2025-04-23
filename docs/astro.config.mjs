import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export default defineConfig({
  site: "https://fiberplane.com",
  redirects: {
    "/docs": "/docs/get-started"
  },
  experimental: {
    contentIntellisense: true
  },
  integrations: [
    starlight({
      // logo: {
      //   dark: "@/assets/fp-logo-dark.png",
      //   light: "@/assets/fp-logo-light.png",
      //   replacesTitle: true,
      //   alt: "Fiberplane icon logo & text"
      // },
      title: "HONC",
      description:
        "HONC is the zero-config stack for lightweight data APIs",
      social: {
        github: "https://github.com/fiberplane/create-honc-app",
        discord:"https://discord.com/invite/ugAwAK6Yzm"
      },
      sidebar: [
        {
          label: "Docs",
          items: [
            {
              label: "Quickstart",
              items: ["docs"]
            },
            // {
            //   label: "Features",
            //   autogenerate: { directory: "docs/features" }
            // }
          ]
        },
        // { label: "Blog", link: "/blog" },
      ],
      favicon: "/favicon/favicon.ico",
      head: [
        {
          tag: "link",
          attrs: {
            rel: "icon",
            type: "image/png",
            href: "/favicon/favicon-32x32.png",
            sizes: "32x32"
          }
        },
        {
          tag: "link",
          attrs: {
            rel: "shortcut icon",
            href: "/favicon/favicon.ico"
          }
        },
        {
          tag: "link",
          attrs: {
            rel: "apple-touch-icon",
            sizes: "180x180",
            href: "/favicon/apple-touch-icon.png"
          }
        },
        {
          tag: "meta",
          attrs: {
            name: "apple-mobile-web-app-title",
            content: "HONC"
          }
        },
        {
          tag: "link",
          attrs: {
            rel: "manifest",
            href: "/favicon/site.webmanifest"
          }
        },
        // {
        //   tag: "script",
        //   attrs: {
        //     type: "text/partytown",
        //     src: "https://www.googletagmanager.com/gtag/js?id=G-FMRLG4PY3L",
        //     async: true
        //   }
        // },
        // {
        //   tag: "script",
        //   attrs: {
        //     type: "text/partytown"
        //   },
        //   content: `
        //     window.dataLayer = window.dataLayer || [];
        //     function gtag(){dataLayer.push(arguments);}
        //     gtag('js', new Date());
        //     gtag('config', 'G-FMRLG4PY3L');
        //   `
        // }
      ],
      components: {
        Banner: "@/components/Banner.astro",
        Footer: "@/components/Footer.astro",
        Head: "@/components/Head.astro",
        Header: "@/components/Header.astro",
        Hero: "@/components/Hero.astro"
      },
      customCss: ["@/main.css"],
      expressiveCode: {
        themes: ["github-dark", "github-light"],
        styleOverrides: {
          borderRadius: "var(--border-radius)"
        }
      }
    }),
    sitemap(),
    // partytown({
    //   config: {
    //     forward: ["dataLayer.push"]
    //   }
    // })
  ],
  markdown: {
    rehypePlugins: [
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap"
        }
      ]
    ]
  }
});