import postgres from "postgres";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: "require",
    prepare: false,
  });

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, "../drizzle/0000_slow_redwing.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    // Split by statement breakpoint and filter empty statements
    const statements = migrationSQL
      .split("-->")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("statement-breakpoint"));

    console.log(`Running ${statements.length} statements...`);

    for (const statement of statements) {
      if (statement) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await sql.unsafe(statement);
      }
    }

    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
