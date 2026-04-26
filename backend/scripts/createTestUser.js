import postgres from "postgres";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config({ path: ".env" });

async function createTestUser() {
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: "require",
    prepare: false,
  });

  try {
    const userId = "550e8400-e29b-41d4-a716-446655440000";
    const hashedPassword = await bcrypt.hash("password123", 10);

    console.log("Creating test user...");
    await sql`
      INSERT INTO "users" ("id", "email", "password", "username")
      VALUES (${userId}, ${'testuser@example.com'}, ${hashedPassword}, ${'testuser'})
      ON CONFLICT (id) DO NOTHING;
    `;

    console.log("✅ Test user created successfully!");
  } catch (error) {
    console.error("❌ Failed:", error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

createTestUser();
