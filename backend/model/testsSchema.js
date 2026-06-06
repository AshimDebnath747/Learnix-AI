
import {
    pgTable,
    uuid,
    timestamp,
    text,
    boolean,
    doublePrecision
} from "drizzle-orm/pg-core";

import { users } from "./userschema.js";
import { plans } from "./routineSchema.js";
import { duration, timestamptz } from "drizzle-orm/gel-core";

export const tests = pgTable("tests", {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" }),

    planId: uuid("plan_id")
        .references(() => plans.id, { onDelete: "cascade", onUpdate: "cascade" }),

    type: text("type"), // better to convert to enum later
    active: boolean("active"),
    submittedAt: timestamptz("submitted_at"),
    createdAt: timestamp("created_at").defaultNow(),
    duration: doublePrecision("duration")
});