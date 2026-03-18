import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),

  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  username: text("username").notNull()
});