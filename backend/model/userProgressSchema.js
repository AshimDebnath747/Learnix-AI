import {
  pgTable,
  serial,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  unique
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./userschema.js";

export const userProgress = pgTable(
  "user_progress",
  {
    id: serial("id").primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    questionId: text("question_id").notNull(),

    completed: boolean("completed").notNull().default(false),

    completedAt: timestamp("completed_at", { withTimezone: true })
  },
  (table) => [
    // Unique constraint: user can only have one progress entry per question
    unique("user_progress_user_question_unique").on(
      table.userId,
      table.questionId
    ),
    // Index for faster queries by user
    index("idx_user_progress_user").on(table.userId),
    // Index for faster queries by question
    index("idx_user_progress_question").on(table.questionId),
    // Composite index for queries filtering by user AND question
    index("idx_user_progress_user_question").on(table.userId, table.questionId)
  ]
);
