CREATE TABLE IF NOT EXISTS "movie_ideas" (
	"id" serial PRIMARY KEY NOT NULL,
	"prompt" text,
	"response" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
