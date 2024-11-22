
export default function Layout({ children }: { children?: unknown }) {
  return (
    <html lang="en-US">
      <head>
        <title>PlaceGoose</title>
        <link rel="icon" href="honc.png" />
        <link rel="stylesheet" href="styles.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <div>
        <h1>PlaceGoose</h1>
      </div>
      <body>{children}</body>
    </html>
  );
}
