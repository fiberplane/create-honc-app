CREATE TABLE IF NOT EXISTS "jokes" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
