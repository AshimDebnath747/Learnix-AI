import { pgTable, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { tests } from "./testsSchema.js";
import { mcqQuestions } from "./mcqQuestionsSchema.js";
export const testMcqs = pgTable(
    "test_mcqs",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        testId: uuid("test_id")
            .notNull()
            .references(() => tests.id, { onDelete: "cascade" }),

        mcqId: uuid("mcq_id")
            .notNull()
            .references(() => mcqQuestions.id, { onDelete: "cascade" }),
    },
    (table) => ({
        uniqueTestMcq: uniqueIndex("unique_test_mcq").on(
            table.testId,
            table.mcqId
        ),
    })
);