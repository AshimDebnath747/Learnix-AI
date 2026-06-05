import { pgTable, uuid, uniqueIndex, numeric } from "drizzle-orm/pg-core";
import { tests } from "./testsSchema.js";
import { mcqQuestions } from "./mcqQuestionsSchema.js";
import { text } from "drizzle-orm/gel-core";
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
        isCorrect: numeric("is_correct").notNull(),
        selectedOption: text("selected_option")
    },
    (table) => ({
        uniqueTestMcq: uniqueIndex("unique_test_mcq").on(
            table.testId,
            table.mcqId
        ),
    })
);