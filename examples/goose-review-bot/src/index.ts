import { instrument } from "@fiberplane/hono-otel";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { pullRequests, reviews } from "./db/schema";
import { eq } from "drizzle-orm";
import { Anthropic } from "@anthropic-ai/sdk";
import { Octokit } from "@octokit/rest";

type Bindings = {
  DATABASE_URL: string;
  GITHUB_TOKEN: string;
  ANTHROPIC_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Initialize Anthropic client
const initAnthropicClient = (apiKey: string) => {
  return new Anthropic({
    apiKey,
    // We pass in the global fetch to allow for automatic instrumentation
    fetch: globalThis.fetch,
  });
};

// Initialize GitHub client
const initGitHubClient = (token: string) => {
  return new Octokit({
    auth: token,
  });
};

// Get diff content from GitHub
async function getDiffContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<string> {
  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
  });

  const diffs = files
    .map((file) => `File: ${file.filename}\nChanges:\n${file.patch}`)
    .join("\n\n");
  return diffs;
}

// Generate code review using Claude
async function generateCodeReview(
  anthropic: Anthropic,
  diffContent: string,
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `You are an angry goose engineering manager.
        Please review this code diff and provide a detailed code review, but be goosey and angry. Use the goose emoji: 🪿 throughout the review. Focus on:
      1. Potential bugs and issues
      2. Security concerns
      3. Performance implications
      4. Code style and best practices
      5. Suggestions for improvement

      Here's the diff:
      ${diffContent}`,
      },
    ],
  });
  return message.content[0].text;
}

// Post review comment on GitHub
async function postReviewComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
  review: string,
) {
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: pullNumber,
    body: review,
  });
}

app.get("/", (c) => {
  return c.text("Honc! 🪿");
});

// TODO: enhance granularity of types of payloads and events
app.post("/api/pull-requests", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const payload = await c.req.json();

  // Handle GitHub webhook payload
  if (payload?.repository) {
    // This is a GitHub webhook
    //const headCommit = payload.head_commit; // does not exist in payload
    const repo = payload.repository;

    const newPullRequest = {
      title: payload.pull_request.title,
      description: `Branch: ${payload.pull_request.head.ref}\nCommit: ${payload.pull_request.url}`,
      authorId: payload.pull_request.user.id,
      githubPrId: payload.number,
      githubRepoId: repo.id,
      githubBranch: payload.pull_request.head.ref,
      githubCommitSha: payload.pull_request.head.sha,
      githubRepoFullName: repo.full_name,
    };

    const insertedPullRequest = await db
      .insert(pullRequests)
      .values(newPullRequest)
      .returning();

    try {
      const octokit = initGitHubClient(c.env.GITHUB_TOKEN);
      const anthropic = initAnthropicClient(c.env.ANTHROPIC_API_KEY);
      const owner = payload.repository.owner.login;
      const repo = payload.repository.name;
      const pullNumber = payload.number;

      const diffContent = await getDiffContent(
        octokit,
        owner,
        repo,
        pullNumber,
      );

      const review = await generateCodeReview(anthropic, diffContent);
      const [insertedReview] = await db
        .insert(reviews)
        .values({
          pullRequestId: payload.number, // Using githubPrId as per schema reference
          reviewerId: payload.pull_request.user.id, // Using author ID as reviewer for now
          // TODO: needs actual status
          status: "approved", // Using valid status value from seed data
          comments: review,
        })
        .returning();

      await postReviewComment(octokit, owner, repo, pullNumber, review);
    } catch (error) {
      console.error("Error posting review comment:", error);
    }

    return c.json(insertedPullRequest);
  }

  return c.json({ message: "No repository found in payload" }, 500);
});

app.put("/api/pull-requests/:id", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  const id = Number.parseInt(c.req.param("id"));
  const updatedData = await c.req.json();
  await db.update(pullRequests).set(updatedData).where(eq(pullRequests.id, id));
  return c.text("Pull request updated");
});

app.delete("/api/pull-requests/:id", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  const id = Number.parseInt(c.req.param("id"));
  await db.delete(pullRequests).where(eq(pullRequests.id, id));
  return c.text("Pull request deleted");
});

// CRUD for Reviews
app.get("/api/reviews", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  return c.json({
    reviews: await db.select().from(reviews),
  });
});

app.post("/api/reviews", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  const newReview = await c.req.json();
  const insertedReview = await db.insert(reviews).values(newReview).returning();
  return c.json(insertedReview);
});

app.put("/api/reviews/:id", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  const id = Number.parseInt(c.req.param("id"));
  const updatedData = await c.req.json();
  await db.update(reviews).set(updatedData).where(eq(reviews.id, id));
  return c.text("Review updated");
});

app.delete("/api/reviews/:id", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  const id = Number.parseInt(c.req.param("id"));
  await db.delete(reviews).where(eq(reviews.id, id));
  return c.text("Review deleted");
});

// TODO: Implement streaming or realtime updates for pull requests and reviews
// Streaming: https://hono.dev/docs/helpers/streaming#streaming-helper
// Realtime: https://developers.cloudflare.com/durable-objects/
// Realtime: https://fiberplane.com/blog/creating-websocket-server-hono-durable-objects/

export default instrument(app);
