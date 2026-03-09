import postgres from 'postgres'
import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });
const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString)

export default sql