ALTER TABLE "routine_questions" DROP CONSTRAINT "routine_questions_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "idx_routine_questions_user_plan";--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "active" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "test_mcqs" ADD COLUMN "is_correct" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "test_mcqs" ADD COLUMN "selected_option" text;--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "active" boolean;--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "submitted_at" datetime;--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "duration" double precision;--> statement-breakpoint
CREATE INDEX "idx_routine_questions_user_plan" ON "routine_questions" USING btree ("plan_id");--> statement-breakpoint
ALTER TABLE "routine_questions" DROP COLUMN "user_id";