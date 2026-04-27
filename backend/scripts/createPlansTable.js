import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function createPlansTable() {
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: "require",
    prepare: false,
  });

  try {
    console.log("Creating plans table...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "plans" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "semester" integer NOT NULL,
        "plan" jsonb NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action
      );
    `);

    console.log("✅ Plans table created successfully!");
  } catch (error) {
    console.error("❌ Failed:", error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

createPlansTable();
