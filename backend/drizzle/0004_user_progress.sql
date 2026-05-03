-- User Progress Tracking Table
-- This migration creates the user_progress table for tracking question completion

CREATE TABLE IF NOT EXISTS "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_progress_user_question_unique" UNIQUE("user_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade;
--> statement-breakpoint
CREATE INDEX "idx_user_progress_user" on "user_progress" ("user_id");
--> statement-breakpoint
CREATE INDEX "idx_user_progress_question" on "user_progress" ("question_id");
--> statement-breakpoint
CREATE INDEX "idx_user_progress_user_question" on "user_progress" ("user_id","question_id");
