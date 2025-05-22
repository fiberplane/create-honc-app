---
title: Cloudflare Workers
description: Serverless runtime and deployment platform for HONC applications
---

[Cloudflare Workers](https://workers.cloudflare.com/) provide a serverless runtime and deployment platform for building and scaling applications across Cloudflare's global network.
Cloudflare handles the infrastructure and enables automatic scaling with exceptional performance.

In the HONC stack, Cloudflare Workers serve as a serverless runtime for backend applications, enabling serverless APIs, background jobs, scheduled tasks, and more.

## Worker Configuration
The configuration for Cloudflare Workers in the HONC stack is stored in `wrangler.toml` (or alternatively `wrangler.json`/`wrangler.jsonc`). This configuration file defines settings for both development and production environments, including deployment configurations for different environments and bindings to Cloudflare services.

```toml
name = "honc-d1-template"
compatibility_date = "2025-02-04"
compatibility_flags = [ "nodejs_compat" ]
```

## Local Development with Wrangler
Cloudflare supports two main tools for local development: Wrangler and Vite. Honc templates use Wrangler as the primary local development tool. Wrangler, which internally uses Miniflare, is particularly well-suited for backend worker applications. 

To start the local development server, HONC templates include a preconfigured script in the project's `package.json`:

```json, title="package.json"
{
  "scripts": {
    "dev": "wrangler dev src/index.ts",
  }
}
```

Additionally, for testing against Cloudflare services running on the Cloudflare network rather than emulated ones, Wrangler supports remote development with the `--remote` flag:
```bash
pnpm run dev --remote
```


## Deploy with Wrangler

Wrangler provides a CLI deployment workflow for managing Cloudflare Workers. The tool supports both manual deployments via CLI (using `wrangler deploy`) and continuous deployment integrations through platforms like GitHub Actions. Cloudflare maintains version history of deployments, which can be managed through the Cloudflare dashboard.

To simplify the deployment process, HONC templates include a preconfigured deployment script in `package.json`:
```json, title="package.json"
{
    "scripts": {
    "deploy": "wrangler deploy --minify src/index.ts"
    }
}
```


## Cloudflare Developer Platform - Integrate with Workers

### Bindings

Bindings are connections between Workers and Cloudflare services, defined in `wrangler.toml`. They enable Workers to interact with platform services securely and provide access to resources like databases, storage, and environment variables. For example, to connect to a D1 database:

```toml
[[d1_databases]]
name = "DB"
database_id = "<your-database-id>"
```

### TypeScript Types from Bindings

When using TypeScript with Workers, Cloudflare provides type definitions for all platform services. These types are automatically available through the `@cloudflare/workers-types` package, which is included in HONC templates. The Worker's environment interface will be automatically populated with the correct types based on the bindings:

```typescript
interface Env {
  DB: D1Database;
  MY_KV: KVNamespace;
  MY_BUCKET: R2Bucket;
}
```

### Cloudflare's Developer Platform Services

Cloudflare offers several managed services that can be integrated with Workers:

#### Storage & Database Options
- **D1**: SQLite-compatible serverless database, ideal for relational data with SQL query support. HONC comes with a D1 template to store data in a SQLite database.
- **KV (Key-Value)**: A global, low-latency key-value data store, perfect for caching and small data storage needs.
- **R2**: Object storage service compatible with S3 API, suitable for storing large files and assets.

#### Distributed System Architecture
- **Durable Objects**: Provide global coordination and consistent storage with a unique object-oriented approach.
- **Queues**: Managed message queue system for handling asynchronous tasks and job processing.
- **Pub/Sub**: Real-time message broadcasting system for building event-driven applications.

#### AI Features
Cloudflare provides AI capabilities that can be integrated into Workers:

- **Workers AI**: Run machine learning models directly at the edge, supporting various tasks like:
  - Text generation and completion
  - Image classification and analysis
  - Text embedding generation
  - Translation and language processing

- **Vectorize**: A vector database service designed for AI applications, offering:
  - Efficient similarity search for AI embeddings
  - Automatic index management
  - Seamless integration with Workers AI
  - Support for various vector embedding models

- **AI Gateway**: A service that provides:
  - Managed access to popular AI models
  - API key management and rate limiting
  - Cost optimization and caching
  - Integration with major AI providers
