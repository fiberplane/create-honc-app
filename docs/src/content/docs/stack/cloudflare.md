---
title: Cloudflare Workers
description: Serverless runtime and deployment platform for HONC applications
---

[Cloudflare Workers](https://workers.cloudflare.com/) provide a serverless runtime and deployment platform for building and scaling applications across Cloudflare's global network. Workers utilize edge runtime/deployment, which means your code runs on Cloudflare's edge network across 300+ locations worldwide.

Cloudflare handles the infrastructure and enables automatic scaling with exceptional performance.

**Pros of Edge Runtime/Deployment:**
- Extremely low latency due to code execution closer to users
- Automatic global distribution without additional configuration
- Built-in DDoS protection and security features
- Consistent performance across all regions

**Cons of Edge Runtime/Deployment:**
- Limited runtime duration (CPU time caps)
- Restricted access to some Node.js APIs and features
- Memory limitations compared to traditional servers

Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up).

In the HONC stack, Cloudflare Workers serve as a serverless runtime for backend applications, enabling serverless APIs, background jobs, scheduled tasks, and more.

## Worker Configuration
[The configuration](https://developers.cloudflare.com/workers/wrangler/configuration/) for Cloudflare Workers in the HONC stack is stored in `wrangler.toml` (or alternatively `wrangler.json`/`wrangler.jsonc`). This configuration file defines settings for both development and production environments, including deployment configurations for different environments and bindings to Cloudflare services.

```toml
name = "honc-d1-template"
compatibility_date = "2025-02-04"
compatibility_flags = [ "nodejs_compat" ]
```

## Cloudflare Worker Bindings

[Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/#what-is-a-binding)
 are connections between Workers and Cloudflare services, defined in `wrangler.toml`. They enable Workers to interact with platform services securely and provide access to resources like databases, storage, and environment variables. 
 Bindings require minimal configuration and Cloudflare handles the connection. For example, to connect to a D1 database:

```toml
[[d1_databases]]
binding = "DB"
database_name = "our-prod-db"
database_id = "<our-database-id>"
```


### TypeScript Types from Bindings

TypeScript is a first-class language on Cloudflare Workers. All APIs provided in Workers are fully typed, and type definitions are generated directly from [workerd](https://github.com/cloudflare/workerd), the open-source Workers runtime.

#### Generate types that match your Worker's configuration

Cloudflare continuously improves workerd, the open-source Workers runtime. Changes in workerd can introduce JavaScript API changes, thus changing the respective TypeScript types.

The correct types for your Worker depend on:
- The Worker's compatibility date
- The Worker's compatibility flags
- The Worker's bindings, defined in the Wrangler configuration file
- Module rules specified in the Wrangler configuration file under rules


To ensure that type definitions always match the Worker's configuration, generate types by running:

```bash
npx wrangler types
```
It generates a `worker-configuration.d.ts` file that makes Env available globally. The command must be re-run each time `wrangler.toml` is updated, which is especially important for testing.

When using TypeScript with Workers, the Worker's environment interface is automatically populated with the correct types based on the bindings:

```typescript
interface Env {
  DB: D1Database;
  MY_KV: KVNamespace;
  MY_BUCKET: R2Bucket;
}
```

### Available Bindings

Cloudflare offers several managed services that can be integrated with Workers:

#### Storage & Database Options
- **[D1](https://developers.cloudflare.com/d1/)**: SQLite-compatible serverless database, ideal for relational data with SQL query support. HONC comes with a D1 template to store data in a SQLite database. Note: D1 has some [important limitations](#d1-limitations) to consider before use.
- **[KV (Key-Value)](https://developers.cloudflare.com/kv/)**: A global, low-latency key-value data store, perfect for caching and small data storage needs.
- **[R2](https://developers.cloudflare.com/r2/)**: Object storage service compatible with S3 API, suitable for storing large files and assets.

#### Distributed System Architecture
- **[Durable Objects](https://developers.cloudflare.com/durable-objects/)**: Provide strongly consistent coordination and durable state management across multiple Workers. They're particularly useful for WebSocket connections and real-time applications.
- **[Queues](https://developers.cloudflare.com/queues/)**: Managed message queue system for handling asynchronous tasks and job processing.
- **[Workflows](https://developers.cloudflare.com/workflows/)**: Orchestration service for coordinating multiple Workers and managing complex, multi-step and long running processes.

#### AI Features
Cloudflare provides AI capabilities that can be integrated into Workers:

- **[Workers AI](https://developers.cloudflare.com/workers-ai/)**: Run machine learning models directly at the edge, supporting various tasks like:
  - Text generation and completion
  - Image classification and analysis
  - Text embedding generation
  - Translation and language processing

- **[Vectorize](https://developers.cloudflare.com/vectorize/)**: A vector database service designed for AI applications, offering:
  - Efficient similarity search for AI embeddings
  - Automatic index management
  - Seamless integration with Workers AI
  - Support for various vector embedding models

- **[AI Gateway](https://developers.cloudflare.com/ai-gateway/)**: A service that provides:
  - Managed access to popular AI models
  - API key management and rate limiting
  - Cost optimization and caching
  - Integration with major AI providers

## Local Development with Wrangler
Cloudflare supports two main tools for [local development](https://developers.cloudflare.com/workers/development-testing/#local-development): Wrangler and Vite. Honc templates use Wrangler as the primary local development tool. Wrangler, which internally uses Miniflare, is particularly well-suited for backend worker applications. 

To start the local development server, HONC templates include a preconfigured script in the project's `package.json`:

```json, title="package.json"
{
  "scripts": {
    "dev": "wrangler dev src/index.ts"
  }
}
```

### Secrets
For managing secrets during local development, create a `.dev.vars` file in the project root. This file contains the required environment variables for the application. The `.dev.vars` file follows a `dotenv` structure with `KEY="value"` pairs.

```env, title=".dev.vars"
DATABASE_URL="your-db-url-here"
``` 

### [Bindings](#cloudflare-worker-bindings)
Local instances of Bindings (D1, KV, R2, etc.) are automatically created when running `wrangler dev`.

Use the wrangler CLI to interact with these local bindings. For instance, to [add data](https://developers.cloudflare.com/workers/development-testing/local-data/#populating-local-resources-with-data) to them.

Additionally, for testing against Cloudflare services running on the Cloudflare network rather than emulated ones, Wrangler supports [remote bindings](https://developers.cloudflare.com/workers/development-testing/#remote-bindings)  with the `--x-remote-bindings` flag (still in beta):

```toml, title="wrangler.toml"
[[r2_buckets]]
bucket_name = "screenshots-bucket"
binding = "screenshots_bucket"
experimental_remote = true

```bash
npx wrangler dev --x-remote-bindings
```

[This table](https://developers.cloudflare.com/workers/development-testing/bindings-per-env/#local-development) gives an overview of which bindings support which local development mode

## Deploy with Wrangler

Wrangler provides a CLI deployment workflow for managing Cloudflare Workers. The tool supports both manual deployments via CLI (using `wrangler deploy`) and continuous deployment integrations through platforms like [GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/). Cloudflare maintains version history of deployments, which can be managed through the Cloudflare dashboard.

To simplify the deployment process, HONC templates include a preconfigured deployment script in `package.json`:
```json, title="package.json"
{
    "scripts": {
      "deploy": "wrangler deploy --minify src/index.ts"
    }
}
```

### Secrets
Secrets and other env variables are essentially handled as bindings once added
For [managing secrets](https://developers.cloudflare.com/workers/configuration/secrets/) in deployed Workers, use Wrangler: 
```bash
# Add a secret
npx wrangler secret put <KEY>

# Delete a secret
npx wrangler secret delete <KEY>

```
Secrets can also be added and deleted via the Cloudflare dashboard.

## D1 Limitations

While D1 is a powerful serverless database solution, it's important to be aware of its key limitations:

- **No Transaction Support**: D1 currently does not support transactions, and there are no plans to implement this feature
- **Horizontal Scaling**: While D1 is designed to be horizontally scalable, there's no out-of-the-box solution for this beyond read replicas
- **Query Limitations**: Some SQL features and complex queries may not be supported
- **Data Size**: There are limits on database size and query response size

For more details about these limitations, refer to the [official D1 documentation](https://developers.cloudflare.com/d1/platform/limits/).
