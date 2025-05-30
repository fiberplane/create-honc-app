# :goose: HONC Stack Example Projects :goose:

This directory contains example projects built with the HONC stack, showcasing different use cases, patterns, and integrations.

> 📚 For more examples and templates, check out the [Awesome Honc](https://github.com/fiberplane/awesome-honc) repository.

## Projects

### 🎯 [Placegoose](./placegoose)
A mock REST API service providing goose-themed data, similar to JSON Placeholder. Great for seeing how to use middleware for validation in Hono.

- Blog post developing the api: https://fiberplane.com/blog/placegoose-guide/
- Blog post on deploying the api: https://fiberplane.com/blog/placegoose-to-prod/
- See it live: https://placegoose.fp.dev

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/fiberplane/create-honc-app/tree/main/examples/placegoose)

<details>
<summary>Integrations</summary>

- Cloudflare D1 for data storage
- Cloudflare Asset Bindings for Workers
- UI: Markdown rendered with Remark
</details>

### 📊 [Website Uptime Monitor](./uptime-monitor)
A serverless monitoring application that tracks website uptime. Features configurable health checks, response time tracking, and a web interface. Uses Cloudflare D1 and Durable Objects.

- Blog post: https://fiberplane.com/blog/honc-up-time-monitor/

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/fiberplane/create-honc-app/tree/main/examples/uptime-monitor)

<details>
<summary>Integrations</summary>

- Cloudflare D1 for data storage
- Cloudflare Durable Objects for serverless state
- UI: SSR with hono/jsx
</details>

### 😄 [Goose Joke Generator](./goose-joke-generator)
A web app that generates (terrible) goose-themed jokes using Cloudflare AI. Stores jokes in a D1 sqlite database and includes rate limiting functionality.

- See it live: https://goose-jokes.fp.dev

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/fiberplane/create-honc-app/tree/main/examples/goose-joke-generator)

<details>
<summary>Integrations</summary>

- Neon serverless Postgres for data storage
- Cloudflare AI (Llama-3.1-8B-Instruct)
</details>

### 🤖 [Retrieval Augmented Goose](./cf-retrieval-augmented-goose)
A RAG (Retrieval Augmented Generation) example that uses Cloudflare docs as a knowledge base. Demonstrates vector embeddings and AI integration with the HONC stack using Neon Postgres.

- Blog: https://fiberplane.com/blog/retrieval-augmented-geese/
- See it live: https://cf-retrieval-augmented-goose.mies.workers.dev

<details>
<summary>Integrations</summary>

- Neon serverless Postgres for data storage and vector search
- OpenAI for embeddings generation
- UI: SSR with hono/jsx and Fiberplane's "ascuii" SSR ui components
</details>


### 🎨 [Honcanator](./honcanator)
An AI-powered goose image generator that creates comic/anime style goose images using Cloudflare AI. Stores images in R2 and metadata in Neon Postgres.

- Blog post: https://fiberplane.com/blog/ai-goose-generator/

<details>
<summary>Integrations</summary>

- Neon serverless Postgres for relational data storage
- Cloudflare R2 for blob storage
- Cloudflare AI for image generation (Flux-1-Schnell)
</details>

### 🧑‍🎄 [HONC the Halls](./honc-the-halls)

A Made-for-TV Christmas Movie idea geneator using `llama3.3-70b-instruct` and Together AI. Uses Hono's streaming utilities to stream the response back to the client, and Hono's `hono/jsx` to render the UI.

<details>
<summary>Integrations</summary>

- Cloudflare D1 to store movie ideas
- Together AI to generate movie ideas
</details>

### 🪿 [Goose Review Bot](./goose-review-bot)

A GitHub PR review bot that provides "goosey" code reviews using Claude. Built with Neon Postgres and Cloudflare Workers.

<details>
<summary>Integrations</summary>

- GitHub Octokit to handle webhooks and pull requests
- Claude (Anthropic) to provide code reviews
</details>
