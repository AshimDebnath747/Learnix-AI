import { pgTable, uuid, text, integer, index, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./userschema.js";
import { plans } from "./routineSchema.js";

export const routineQuestions = pgTable(
  "routine_questions",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),

    

    questionId: text("question_id").notNull(),

    dayNo: integer("day_no"),

    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id)
  },
  (table) => [
    // Unique constraint: question can only appear once per plan
    unique("routine_questions_plan_question_unique").on(table.planId, table.questionId),
    // Index for faster queries by user and plan
    index("idx_routine_questions_user_plan").on(
    
      table.planId
    ),
    // Index for day-based queries
    index("idx_routine_questions_day").on(table.dayNo)
  ]
);
