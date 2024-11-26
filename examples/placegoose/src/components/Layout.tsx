export default function Layout({ children }: { children?: unknown }) {
  const meta = {
    // todo
    title: "",
    description: "",
    domain: "PROD_DOMAIN",
    url: "PROD_URL",
  };

  return (
    <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={meta.description} />
        <meta name="og:title" content={meta.title} />
        <meta name="og:description" content={meta.description} />
        <meta name="og:url" content={meta.url} />
        <meta name="og:site_name" content={meta.domain} />
        <meta name="og:image" content="" />
        <meta name="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:domain" content={meta.domain} />
        <meta name="twitter:url" content={meta.url} />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <title>Placegoose</title>
        <link rel="stylesheet" href="static/styles.css" />
        <link
          rel="apple-touch-icon"
          type="image/png"
          sizes="16x16"
          href="static/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="static/favicon/16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="static/favicon/32x32.png"
        />
      </head>
      <body>
        <header>
          <h1>Placegoose</h1>
        </header>
        <main>
          {children}
        </main>
        <footer>
          Built with 🪿 by Fiberplane
        </footer>
      </body>
    </html>
  );
}
