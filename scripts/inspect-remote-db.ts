import postgres from "postgres";

async function main() {
  const url = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;

  if (!url) {
    throw new Error("MIGRATION_DATABASE_URL 또는 DATABASE_URL이 필요합니다.");
  }

  const sql = postgres(url, {
    max: 1,
    prepare: false,
    ssl: "require",
  });

  try {
    const tables = await sql`
      select table_schema, table_name
      from information_schema.tables
      where table_schema not in ('pg_catalog', 'information_schema')
      order by table_schema, table_name
    `;

    let migrations: Array<Record<string, unknown>> = [];
    let migrationError: string | null = null;

    try {
      migrations = (await sql`
        select *
        from drizzle.__drizzle_migrations
        order by id
      `) as Array<Record<string, unknown>>;
    } catch (error) {
      migrationError = error instanceof Error ? error.message : "unknown error";
    }

    console.log(
      JSON.stringify(
        {
          tableCount: tables.length,
          tables,
          migrationCount: migrations.length,
          migrations,
          migrationError,
        },
        null,
        2,
      ),
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
