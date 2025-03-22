import type { FC } from "hono/jsx";

function truncateJoke(joke: string) {
  const lines = joke.split('\n');
  const filteredLines = lines.filter(l => {
    if (l.toLowerCase().trim().startsWith('explanation:')) {
      return false;
    }
    if (l.toLowerCase().trim().startsWith('here')) {
      return false;
    }
    if (l.toLowerCase().trim().startsWith('here is a new joke:')) {
      return false;
    }
    if (l.toLowerCase().trim().includes('new joke')) {
      return false;
    }
    if (l.toLowerCase().trim().includes('this joke')) {
      return false;
    }
    return !!l.trim();
  });

  const joinedJoke = filteredLines.join('\n');
  return joinedJoke;
}

export const HomePage: FC<{ joke: string }> = ({ joke }) => {
  const shareableJoke = truncateJoke(joke);
  const post = `Here is a very funny goose joke:\n\n${shareableJoke}\n\nWowww funny! Find more goose comedy at: https://goose-joke-generator.mies.workers.dev/\n#HONC`;
  const honcStackTwitterHandle = "@honcstack";
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${post} ${honcStackTwitterHandle}`)}`;
  const honcStackBlueskyHandle = "@honcstack.bsky.social";
  // Don't know why, but newlines are not decoded correctly in the bluesky share url
  // https://docs.bsky.app/docs/advanced-guides/intent-links
  const blueskyShareUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(`${post} ${honcStackBlueskyHandle}`)}`;

  return (
    <html lang="en">
      <head>
        <title>Goose Joke Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦢</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,400;0,700;1,700&display=swap"
          rel="stylesheet"
        />
        <style
          // biome-ignore lint/security/noDangerouslySetInnerHtml: we do not want quotes to be escaped
          dangerouslySetInnerHTML={{
            __html: `
          body {
            font-family: "Comic Neue", "Comic Sans MS", "Comic Sans", serif;
            background-color: #ffffcc;
            color: #333;
            text-align: center;
            padding: 50px;
          }
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
          }
          h1 {
            color: #ff6600;
            font-size: 36px;
            margin-bottom: 30px;
          }
          .joke-container {
            background-color: #fff;
            border: 3px solid #ff6600;
            border-radius: 10px;
            padding: 30px;
            margin: 0 auto;
            margin-bottom: 30px;
            max-width: 600px;
          }
          .joke {
            font-size: 24px;
            line-height: 1.4;
          }
          .refresh-btn {
            font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", serif;
            background-color: #ff6600;
            color: #fff;
            border: none;
            padding: 12px 24px;
            font-size: 18px;
            cursor: pointer;
            border-radius: 5px;
          }
          .refresh-btn:hover {
            background-color: #ff8533;
          }
          .share-btn {
            font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", serif;
            background-color: rgb(0, 133, 255);
            color: #fff;
            border: none;
            padding: 12px 24px;
            font-size: 18px;
            cursor: pointer;
            border-radius: 5px;
            margin-left: 10px;
            text-decoration: none;
            display: inline-block;
          }
          .share-btn:hover {
            background-color: rgb(0, 89, 255);;
          }

          .share-btn--gray {
            font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", serif;
            background-color: #808080;
            color: #fff;
            border: none;
            padding: 12px 24px;
            font-size: 18px;
            cursor: pointer;
            border-radius: 5px;
            margin-left: 10px;
            text-decoration: none;
            display: inline-block;
          }
          .share-btn--gray:hover {
            background-color: #a9a9a9;
          }
          .button-container {
            margin-top: 20px;
          }
        `,
          }}
        />
      </head>
      <body>
        <h1>🦢 Goose Joke Generator 🦢</h1>
        <div class="joke-container">
          <p class="joke">
            {joke.split("\n").map((line, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: this is not react
              <span key={index}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        </div>
        <div class="button-container">
          <button class="refresh-btn" type="submit" onclick="location.reload()">
            more joke pls!
          </button>
          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="share-btn--gray"
          >
            share on twttr 🐦
          </a>

          <a
            href={blueskyShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="share-btn"
          >
            bsky nicer 🦋
          </a>
        </div>
      </body>
    </html>
  );
};
