
import {
    pgTable,
    uuid,
    timestamp,
    text
} from "drizzle-orm/pg-core";

import { users } from "./userschema.js";
import { plans } from "./routineSchema.js";

export const tests = pgTable("tests", {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" }),

    planId: uuid("plan_id")
        .references(() => plans.id, { onDelete: "cascade", onUpdate: "cascade" }),

    type: text("type"), // better to convert to enum later

    createdAt: timestamp("created_at").defaultNow()
});