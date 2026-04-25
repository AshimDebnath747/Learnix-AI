import "dotenv/config"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
console.log("env", process.env.DATABASE_URL)
const client = postgres(process.env.DATABASE_URL, {
    ssl: "require",
    prepare: false,
})

export const db = drizzle(client)
