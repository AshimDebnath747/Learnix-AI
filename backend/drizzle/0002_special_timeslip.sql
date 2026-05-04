ALTER TABLE "routine_questions" DROP CONSTRAINT "routine_questions_question_id_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "routine_questions" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "routine_questions" ALTER COLUMN "question_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "routine_questions" ALTER COLUMN "day_no" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "routine_questions" ADD CONSTRAINT "routine_questions_question_id_unique" UNIQUE("question_id");