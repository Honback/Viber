import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "../src/db/schema";

function getConnectionString() {
  return (
    process.env.MIGRATION_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@127.0.0.1:54329/vibe_showcase"
  );
}

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

async function main() {
  const connectionString = getConnectionString();
  const sql = postgres(connectionString, {
    max: 1,
    ...getPostgresConnectionOptions(connectionString)
  });
  const db = drizzle(sql, { schema, casing: "snake_case" });

  await sql`create extension if not exists pgcrypto;`;
  await sql`create extension if not exists pg_trgm;`;

  await migrate(db, {
    migrationsFolder: "src/db/migrations"
  });

  await sql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
