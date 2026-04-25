import {
    pgTable,
    serial,
    text,
    integer,
    index,
} from "drizzle-orm/pg-core";
import { subjects } from "./subjects";

export const questions = pgTable(
    "questions",
    {
        id: serial("id").primaryKey(),

        questionId: text("question_id").unique(),

        subjectCode: text("subject_code").references(
            () => subjects.subjectCode
        ),

        semester: integer("semester"),

        moduleId: text("module_id"),

        topic: text("topic"),

        marks: integer("marks"),

        instruction: text("instruction"),

        output: text("output")
    },
    (table) => [
        // composite index
        index("idx_questions_sem_module").on(
            table.semester,
            table.moduleId
        )
    ]
);