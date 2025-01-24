# HONC Stack Example Projects

This directory contains example projects built with the HONC stack (Hono, OpenTelemetry, Neon/D1, Cloudflare), showcasing different use cases and integrations.

## Projects

### 🎯 [Placegoose](./placegoose)
A REST API service providing goose-themed data. Perfect for learning how to build and structure REST APIs with the HONC stack. Uses Cloudflare D1 for data storage.

- Blog post: https://fiberplane.com/blog/placegoose-guide/

### 🤖 [Retrieval Augmented Goose](./cf-retrieval-augmented-goose)
A RAG (Retrieval Augmented Generation) example that uses Cloudflare docs as a knowledge base. Demonstrates vector embeddings and AI integration with the HONC stack.

- Blog: https://fiberplane.com/blog/retrieval-augmented-geese/

### 📊 [Website Uptime Monitor](./uptime-monitor)
A serverless monitoring application that tracks website uptime. Features configurable health checks, response time tracking, and a web interface. Uses Cloudflare D1 and Durable Objects.

- Blog post: https://fiberplane.com/blog/honc-up-time-monitor/

### 🎨 [Honcanator](./honcanator)
An AI-powered goose image generator that creates comic/anime style goose images using Cloudflare AI. Stores images in R2 and metadata in Neon Postgres.

- Blog: https://fiberplane.com/blog/ai-goose-generator/

### 😄 [Goose Joke Generator](./goose-joke-generator)
A web app that generates (terrible) goose-themed jokes using Cloudflare AI. Stores jokes in a Neon Postgres database and includes rate limiting functionality.