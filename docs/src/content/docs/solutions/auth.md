---
title: Auth
description: Endpoint security for data APIs.
sidebar:
  order: 2
---

Properly securing APIs is an essential part of developing any app exposed to the internet. Broadly speaking, “auth” workflows have two responsibilities:

- **Authentication:** identifying the request client (e.g., by user or account)
- **Authorization:**  verifying the client is allowed to access the requested resource

These two functions are typically coupled in a single auth workflow that validates credentials passed by the client via HTTP headers. Implementation details vary dramatically though, depending on an application’s architecture and requirements.

From an auth perspective, there are three main types of app or service:

- **Standalone APIs:** Requests come in from independent (usually registered) clients.
- **Machine-to-Machine (M2M):** Internal or external services call the API.
- **Full-Stack:** The app owns both the client and the API.

The HONC stack is designed for backend apps, so this guide will focus on API and M2M auth. These are also less documented than full-stack auth, and there are fewer off-the-shelf solutions available. If you’ve added a front end to your HONC app, there are a number of third-party auth tools to choose from, including [Lucia Auth](https://lucia-auth.com/), [SuperTokens](https://supertokens.com/), and [Stytch](https://stytch.com/).

Since implementation details vary broadly, and because application security is a complex field unto itself, this guide is limited to introducing a few key concepts, along with some tools and resources to help you get started.

## Key Concepts

### Access Tokens

In most cases, both authentication and authorization are achieved through the use of access tokens. These are secret string values, usually passed by the client in the [`Authorization` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Authorization). The server then uses the token to identify the client and determine whether the client should be allowed to access the requested resource. Using an [HTTPS connection](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS) is vital when using access tokens in order to prevent their interception and abuse.

### Permissions

App permissions restrict which resources clients are allowed to interact with, and are typically described in terms of roles and/or scopes.

- **Roles:** a collection of permissions reflecting real-world app usage, e.g., `admin` or `user`
- **Scopes:** specific permissions to perform operations like `read:users` or `edit:posts`

Both can be effective patterns for authorizing requests, and even used together. Role-based auth tends to work better for apps with a small set of defined user types though, while scopes are ideal when it’s necessary to grant access more variably or dynamically.

### Client Management

Even if your app is a backend-only service, it may need a minimal front end so that clients can register and manage their subscription. This can also make it easier for clients to get or reset access tokens, and for you to manage permissions or block clients that violate your terms of service. Notable exceptions include internal services, and apps that integrate with third-party platforms like GitHub, Discord, or Slack.

## Approaches

There are two common types of access tokens: **API Keys** and [**JSON Web Tokens (JWTs)**](https://jwt.io/introduction). Both are typically sent to the server using the Bearer Auth pattern in the `Authorization` header.

```bash
Authorization: Bearer <ACCESS_TOKEN>
```

While they are generally used to achieve the same result, there are some important differences in how they’re implemented and how they work. Most notably, while API keys are simpler to implement at first, JWTs are better equipped to support complex permissions.

### API Keys

Commonly used by both public and internal APIs, API keys are static tokens generated for each user or account, usually through a dashboard or CLI. Though they require a custom multi-tenant auth service, and don’t support scoped auth as well as JWTs, their simplicity offers a better cost/benefit for many use-cases.

#### Pros

- API keys are simpler to reason with, implement, and use.
- They’re easier to rotate or invalidate to mitigate against leaks.

#### Cons

- They must be securely stored in a database, and periodically rotated.
- A database call is required for each request to retrieve client data like ID or permissions.

### JSON Web Tokens

JWT-based auth is popular for public APIs and connecting to third-party services. [OAuth 2.0](https://oauth.net/2/) is the current standard for implementing JWT auth, and is supported by most auth platforms. When registering, clients receive an ID and a secret, which are exchanged for a JWT at the beginning of each session. They can then be automatically refreshed to keep the session active. 

#### Pros

- JWTs can encode (though not encrypt) client data like IDs and permissions.
- They can be set to expire automatically, so they don’t need to be rotated.

#### Cons

- JWT auth is more complicated to implement, and requires additional steps to use.
- They are more difficult to invalidate if they’re leaked.

## Tools & Solutions

### General Knowledge

[The Copenhagen Book](https://thecopenhagenbook.com/) is a free and open-source guideline for implementing a variety of auth patterns. For more information on security vulnerabilities, check out the [OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/index.html).

### Hono Bearer Auth Middleware

Hono comes with middleware for parsing [Bearer Auth tokens](https://hono.dev/docs/middleware/builtin/bearer-auth). This is most helpful when building your own static token auth, but could be used to create a custom JWT-based auth flow.

### Hono OAuth Middleware

The Hono ecosystem offers separately-installed [OAuth middleware](https://github.com/honojs/middleware/tree/main/packages/oauth-providers) that uses adapters to connect to a variety of popular social providers.

### Parsing JWTs

Hono provides middleware and helpers for parsing JWTs, but pairing the [`jsonwebtoken` library](https://www.npmjs.com/package/jsonwebtoken) with `hono/bearer-auth` is a more developer-friendly and robust alternative.