import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // During build phase, DATABASE_URL might not be defined if static generation is attempted
  // We keep the error thrown only on runtime execution if missing
}

const sql = neon(connectionString || "");

export const db = drizzle(sql, { schema });

