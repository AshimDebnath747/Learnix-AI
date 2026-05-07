import {
    pgTable,
    uuid,
    text,
    timestamp
} from "drizzle-orm/pg-core";

export const mcqQuestions = pgTable("mcq_questions", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    question: text("question")
        .notNull(),

    optionA: text("option_a"),
    optionB: text("option_b"),
    optionC: text("option_c"),
    optionD: text("option_d"),

    correctOption: text("correct_option"),

    topic: text("topic"),

    createdAt: timestamp("created_at")
        .defaultNow()
});