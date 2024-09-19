import {
  OAuth2Client,
  generateCodeVerifier,
  generateState,
  type TokenResponseBody,
} from "oslo/oauth2";
import type { Context } from "@/context";
import { log } from "@clack/prompts";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import open from "open";

const NEON_OAUTH_HOST = "https://oauth2.neon.tech";
const NEON_CLIENT_ID = "neonctl";
const NEON_SCOPES = [
  "openid",
  "offline",
  "offline_access",
  "urn:neoncloud:projects:read",
];
const AUTH_TIMEOUT_MS = 60000;
const REDIRECT_URI = (port: number) => `http://127.0.0.1:${port}/callback`;

/*
 * Used if the user rejects the Neon setup flow
 */
export function neonSetupInstructions() {
  log.step("Setting up Neon:");
  log.step(`Create a Neon account and project, retrieve the connection key from the dashboard, and add it to your .dev.vars file.

DATABASE_URL=postgres://....
`);
  log.step(
    "Visit https://neon.tech/docs/get-started-with-neon/connect-neon to create an account and project.",
  );
}

export async function runNeonSetup(ctx: Context) {
  log.step(`Setting up Neon:

  In order to connect to your database project and retrieve the connection key, you'll need to authenticate with Neon.

  The token will *not* be stored anywhere after this session is complete.
  `);

  const token = await getNeonAuthToken();
  ctx.neonAuthToken = token.access_token;
  // WIP
  // Use the token to fetch Neon project details or connection info
}

async function getNeonAuthToken(): Promise<TokenResponseBody> {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const listenPort = (server.address() as AddressInfo).port;

  const client = new OAuth2Client(
    NEON_CLIENT_ID,
    `${NEON_OAUTH_HOST}/oauth2/auth`,
    `${NEON_OAUTH_HOST}/oauth2/token`,
    { redirectURI: REDIRECT_URI(listenPort) },
  );

  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const authorizationURL = await client.createAuthorizationURL({
    state,
    codeVerifier,
    codeChallengeMethod: "S256",
    scopes: NEON_SCOPES,
  });

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `Authentication timed out after ${AUTH_TIMEOUT_MS / 1000} seconds`,
        ),
      );
    }, AUTH_TIMEOUT_MS);

    server.on("request", async (req, res) => {
      if (!req.url?.startsWith("/callback")) {
        res.writeHead(404);
        res.end();
        return;
      }

      const url = new URL(req.url, REDIRECT_URI(listenPort));
      const code = url.searchParams.get("code");
      const returnedState = url.searchParams.get("state");

      if (returnedState !== state) {
        reject(new Error("State mismatch"));
        return;
      }

      if (code) {
        try {
          const token = await client.validateAuthorizationCode(code, {
            codeVerifier,
          });
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            "<code>Authentication with create-honc-app successful! You can close this window.</code>",
          );
          clearTimeout(timer);
          resolve(token);
          server.close();
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error("No code received"));
      }
    });

    log.step(`Awaiting authentication in web browser.

    Auth URL: ${authorizationURL.toString()}
    `);

    open(authorizationURL.toString()).catch((_err: unknown) => {
      log.error(
        "Failed to open web browser. Please copy & paste auth url to authenticate in browser.",
      );
    });
  });
}
