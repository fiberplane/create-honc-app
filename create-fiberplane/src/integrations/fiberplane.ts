import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { randomBytes } from "node:crypto";
import open from "open";
import { TokenRequestResult } from "@oslojs/oauth2";

// const AUTH_HOST = "https://auth.fiberplane.com";
// const FP_API_HOST = "https://fiberplane.com";
const AUTH_HOST = "http://localhost:7777";
const FP_API_HOST = "http://localhost:7676";
const FP_CLIENT_ID = "fp-cli"; // arbitrary string; no pre-registration needed
const AUTH_TIMEOUT_MS = 200000;
const REDIRECT_URI = (port: number) => `http://127.0.0.1:${port}/callback`;

// Helper functions for OAuth2 PKCE
function generateState(): string {
  return randomBytes(32).toString("base64url");
}

function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function exchangeForCliToken(
  servicesAuthAccessToken: string,
): Promise<string> {
  const resp = await fetch(`${FP_API_HOST}/api/auth/tokens/cli-exchange`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${servicesAuthAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "CLI",
      scopes: ["projects:read", "projects:create"], // server validates
      ttlSeconds: 60 * 60 * 24 * 30, // server caps it
    }),
  });

  if (!resp.ok) {
    throw new Error(`Exchange failed: ${resp.status}`);
  }

  const responseData = await resp.json();
  console.log("Exchange responseData:", responseData);

  const { token } = responseData.data;
  return token; // Use this PAT as Authorization: Bearer fp_xxx for services-api
}

export async function getFpAuthToken(): Promise<string> {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const listenPort = (server.address() as AddressInfo).port;

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Manually construct the authorization URL
  const authorizationURL = new URL(`${AUTH_HOST}/authorize`);
  authorizationURL.searchParams.set("response_type", "code");
  authorizationURL.searchParams.set("client_id", FP_CLIENT_ID);
  authorizationURL.searchParams.set("redirect_uri", REDIRECT_URI(listenPort));
  authorizationURL.searchParams.set("state", state);
  authorizationURL.searchParams.set("code_challenge", codeChallenge);
  authorizationURL.searchParams.set("code_challenge_method", "S256");
  authorizationURL.searchParams.set("scope", "openid profile");
  // Optional: pick provider explicitly (not required if only one)
  authorizationURL.searchParams.set("provider", "github");

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
          // Create the token request body
          const body = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: FP_CLIENT_ID,
            redirect_uri: REDIRECT_URI(listenPort),
            code_verifier: codeVerifier,
          });

          // Make the token request
          const response = await fetch(`${AUTH_HOST}/token`, {
            method: "POST",
            body,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          });

          const data = await response.json();
          if (typeof data !== "object" || data === null) {
            throw new Error("Unexpected response");
          }

          // Use TokenRequestResult to parse the response
          const result = new TokenRequestResult(data);
          if (result.hasErrorCode()) {
            const error = result.errorCode();
            throw new Error(`Request failed: ${error}`);
          }

          // Get the services auth access token
          const servicesAuthAccessToken = result.accessToken();

          // Exchange the services auth token for a CLI token
          const cliToken = await exchangeForCliToken(servicesAuthAccessToken);

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            "<code>Authentication successful! You can close this window.</code>",
          );
          clearTimeout(timer);
          console.log("CLI token:", cliToken);
          resolve(cliToken);
          server.close();
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error("No code received"));
      }
    });

    open(authorizationURL.toString()).catch(() => {
      // Fall back to manual copy/paste
      console.error(
        "Failed to open browser. Please copy & paste:",
        authorizationURL.toString(),
      );
    });
  });
}
