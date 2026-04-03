import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:54329/vibe_showcase";

function getPostgresConnectionOptions(urlString: string) {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    const port = url.port;
    const isSupabasePooler = hostname.includes(".pooler.supabase.com") || port === "6543";

    return {
      prepare: !isSupabasePooler
    } as const;
  } catch {
    return {
      prepare: true
    } as const;
  }
}

declare global {
  var __vibeSql__: ReturnType<typeof postgres> | undefined;
}

const sql = global.__vibeSql__ || postgres(connectionString, {
  max: process.env.NODE_ENV === "development" ? 5 : 10,
  ...getPostgresConnectionOptions(connectionString)
});

if (process.env.NODE_ENV !== "production") {
  global.__vibeSql__ = sql;
}

export const db = drizzle(sql, { schema, casing: "snake_case" });
export { sql };
