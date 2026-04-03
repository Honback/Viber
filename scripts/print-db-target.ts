import { loadLocalEnv } from "../tests/e2e/load-env";
import { parseDatabaseUrl } from "./db-target-utils";

loadLocalEnv();

async function main() {
  const value = process.env.DATABASE_URL;
  const migrationValue = process.env.MIGRATION_DATABASE_URL;

  if (!value) {
    throw new Error("DATABASE_URL 이 설정되지 않았습니다.");
  }

  const parsed = parseDatabaseUrl(value);
  const migrationParsed = migrationValue ? parseDatabaseUrl(migrationValue) : null;

  if (!parsed) {
    throw new Error("DATABASE_URL 형식을 해석하지 못했습니다.");
  }

  console.log(
    JSON.stringify(
      {
        app: {
          host: parsed.host,
          port: parsed.port,
          database: parsed.database,
          scope: parsed.scope
        },
        migration: migrationParsed
          ? {
              host: migrationParsed.host,
              port: migrationParsed.port,
              database: migrationParsed.database,
              scope: migrationParsed.scope
            }
          : null
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
