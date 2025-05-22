---
title: Cloudflare Workers
description: Serverless runtime and deployment platform for HONC applications
---

[Cloudflare Workers](https://workers.cloudflare.com/) provide a serverless runtime and deployment platform for building and scalling applications across Cloudflare's global network.
Cloudflare handles the infrastructure and enables automatic scaling with exeptional performance.

In terms of HONC Cloudflare workers are used as a serverless runtime for backend applications eanbling building serverless APIs, background jobs, scheduled tasks, etc.

## Worker Configuration
The configuration for Cloudflare worker in the HONC stack is stored in `wrangler.toml`. Note wrangler also supports JSON (`wrangler.json` or `wrangler.jsonc`).
The configuration file allows to defiine development and deployment setup's. Further is allows you to create binding to different Cloudflare services (see section below).

```toml
name = "honc-d1-template"
compatibility_date = "2025-02-04"
compatibility_flags = [ "nodejs_compat" ]
```

## Local Development with Wrangler
Cloudflare supports two main tools for local development: Wrangler and Vite.
- Honc templates are using Wrangler for local development 
- Wrangler uses Miniflare for local development
- Wrangler is best for backend- workers applications
- Remote development with `--remote` flag

To start your local development server, HONC templates include a preconfigured script in the project's `package.json`:

```json, title="package.json"
{
  "scripts": {
    "dev": "wrangler dev src/index.ts",
  }
}
```

For testing against Cloudflare services running on the Cloudflare network rather than emulated ones, Wrangler supports remote development with the --remote flag:
```bash
pnpm run dev --remote
```

This creates a temporary deployment on Cloudflare's network, enabling testing against real production services while maintaining the development workflow.


## Deploy with Wrangler
- CLI deployment workflow
- Environment deployments (production vs. preview)
- Continuous deployment options
- Deployment configuration in wrangler.toml
- Rollbacks and version management
 


## Cloudflare Developer Platform - Integrate with Workers

### Bindings

### TypeScript Types from Bindings 

### Cloudflare's Developer Platform Services
- Storage & Database
  - KV
  - D1
  - R2
- Dirstributed System Architecture components
  - Durable Objects
  - Queues
  - Workflows
- AI features
  - Worker's AI
  - Vectorize
  - AI Gateway 
