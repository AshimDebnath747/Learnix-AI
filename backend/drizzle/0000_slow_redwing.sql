CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" text,
	"subject_code" text,
	"semester" integer,
	"module_id" text,
	"topic" text,
	"marks" integer,
	"instruction" text,
	"output" text,
	CONSTRAINT "questions_question_id_unique" UNIQUE("question_id")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"semester" integer NOT NULL,
	"plan" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_code" text NOT NULL,
	"subject_title" text NOT NULL,
	"semester" integer NOT NULL,
	"university" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"username" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_subject_code_subjects_subject_code_fk" FOREIGN KEY ("subject_code") REFERENCES "public"."subjects"("subject_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_questions_sem_module" ON "questions" USING btree ("semester","module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subject_code_unique" ON "subjects" USING btree ("subject_code");