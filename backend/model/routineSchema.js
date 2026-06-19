import { pgTable, uuid, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./userschema.js";

export const plans = pgTable("plans", {
    id: uuid("id")
        .default(sql`gen_random_uuid()`)
        .primaryKey(),

    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),

    semester: integer("semester").notNull(),

    plan: jsonb("plan").notNull(), // 👈 full routine JSON

    active: boolean("active").notNull().default(true),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull()
});