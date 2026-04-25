import { pgTable, serial, text, integer, uniqueIndex } from "drizzle-orm/pg-core";

export const subjects = pgTable(
    "subjects",
    {
        id: serial("id").primaryKey(),

        subjectCode: text("subject_code")
            .notNull(),

        subjectTitle: text("subject_title")
            .notNull(),

        semester: integer("semester")
            .notNull(),

        university: text("university")
    },
    (table) => ({
        subjectCodeUnique: uniqueIndex("subject_code_unique").on(
            table.subjectCode
        )
    })
);