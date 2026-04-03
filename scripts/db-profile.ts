import fs from "node:fs";
import path from "node:path";

import { parseDatabaseUrl } from "./db-target-utils";

type ProfileName = "local-dev" | "prod-migrate" | "prod-app" | "status";

type ProfileStore = {
  localDev: {
    databaseUrl: string;
    migrationDatabaseUrl: string;
  };
  production: {
    runtimeDatabaseUrl: string;
    migrationDatabaseUrl: string;
  };
};

const ENV_PATH = path.join(process.cwd(), ".env");
const STORE_PATH = path.join(process.cwd(), ".env.db-profiles.json");
const DEFAULT_LOCAL_DATABASE_URL = "postgres://postgres:postgres@127.0.0.1:54329/vibe_showcase";

function normalizeValue(value: string) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function loadEnvFile() {
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error(".env 파일이 없습니다.");
  }

  const source = fs.readFileSync(ENV_PATH, "utf8");
  const values = new Map<string, string>();

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = normalizeValue(trimmed.slice(separatorIndex + 1));
    values.set(key, value);
  }

  return { source, values };
}

function writeEnvValue(source: string, key: string, value: string) {
  const escapedValue = value;
  const lineRegex = new RegExp(`^${key}=.*$`, "m");

  if (lineRegex.test(source)) {
    return source.replace(lineRegex, `${key}=${escapedValue}`);
  }

  const suffix = source.endsWith("\n") ? "" : "\n";
  return `${source}${suffix}${key}=${escapedValue}\n`;
}

function saveEnv(source: string) {
  fs.writeFileSync(ENV_PATH, source, "utf8");
}

function inferStore(values: Map<string, string>): ProfileStore {
  const currentDatabaseUrl = values.get("DATABASE_URL");
  const currentMigrationDatabaseUrl = values.get("MIGRATION_DATABASE_URL");

  const currentDb = parseDatabaseUrl(currentDatabaseUrl);
  const currentMigration = parseDatabaseUrl(currentMigrationDatabaseUrl);

  const productionRuntimeDatabaseUrl =
    values.get("PROD_DATABASE_URL") ||
    (currentDb?.scope === "remote" ? currentDatabaseUrl : undefined);
  const productionMigrationDatabaseUrl =
    values.get("PROD_MIGRATION_DATABASE_URL") ||
    (currentMigration?.scope === "remote"
      ? currentMigrationDatabaseUrl
      : currentDb?.scope === "remote"
        ? currentDatabaseUrl
        : undefined);

  if (!productionRuntimeDatabaseUrl || !productionMigrationDatabaseUrl) {
    throw new Error(
      "운영 DB 연결 문자열을 자동 추론하지 못했습니다. 먼저 원격 DATABASE_URL/MIGRATION_DATABASE_URL 상태에서 한 번 실행하거나 .env.db-profiles.json 을 직접 준비하세요.",
    );
  }

  return {
    localDev: {
      databaseUrl: values.get("LOCAL_DATABASE_URL") || DEFAULT_LOCAL_DATABASE_URL,
      migrationDatabaseUrl:
        values.get("LOCAL_MIGRATION_DATABASE_URL") ||
        values.get("LOCAL_DATABASE_URL") ||
        DEFAULT_LOCAL_DATABASE_URL,
    },
    production: {
      runtimeDatabaseUrl: productionRuntimeDatabaseUrl,
      migrationDatabaseUrl: productionMigrationDatabaseUrl,
    },
  };
}

function loadStore(values: Map<string, string>) {
  if (fs.existsSync(STORE_PATH)) {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf8")) as ProfileStore;
  }

  const store = inferStore(values);
  fs.writeFileSync(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  return store;
}

function printStatus(values: Map<string, string>, store: ProfileStore) {
  const databaseUrl = values.get("DATABASE_URL") ?? "";
  const migrationDatabaseUrl = values.get("MIGRATION_DATABASE_URL") ?? "";

  const activeProfile =
    databaseUrl === store.localDev.databaseUrl &&
    migrationDatabaseUrl === store.localDev.migrationDatabaseUrl
      ? "local-dev"
      : databaseUrl === store.localDev.databaseUrl &&
          migrationDatabaseUrl === store.production.migrationDatabaseUrl
        ? "prod-migrate"
        : databaseUrl === store.production.runtimeDatabaseUrl &&
            migrationDatabaseUrl === store.production.migrationDatabaseUrl
          ? "prod-app"
          : "custom";

  console.log(
    JSON.stringify(
      {
        activeProfile,
        app: parseDatabaseUrl(databaseUrl),
        migration: parseDatabaseUrl(migrationDatabaseUrl),
        storePath: STORE_PATH,
      },
      null,
      2,
    ),
  );
}

function switchProfile(profile: Exclude<ProfileName, "status">, source: string, store: ProfileStore) {
  let nextDatabaseUrl = store.localDev.databaseUrl;
  let nextMigrationDatabaseUrl = store.localDev.migrationDatabaseUrl;

  if (profile === "prod-migrate") {
    nextDatabaseUrl = store.localDev.databaseUrl;
    nextMigrationDatabaseUrl = store.production.migrationDatabaseUrl;
  }

  if (profile === "prod-app") {
    nextDatabaseUrl = store.production.runtimeDatabaseUrl;
    nextMigrationDatabaseUrl = store.production.migrationDatabaseUrl;
  }

  let nextSource = source;
  nextSource = writeEnvValue(nextSource, "DATABASE_URL", nextDatabaseUrl);
  nextSource = writeEnvValue(nextSource, "MIGRATION_DATABASE_URL", nextMigrationDatabaseUrl);
  saveEnv(nextSource);

  console.log(
    JSON.stringify(
      {
        switchedTo: profile,
        app: parseDatabaseUrl(nextDatabaseUrl),
        migration: parseDatabaseUrl(nextMigrationDatabaseUrl),
        storePath: STORE_PATH,
      },
      null,
      2,
    ),
  );
}

async function main() {
  const command = (process.argv[2] as ProfileName | undefined) ?? "status";

  if (!["local-dev", "prod-migrate", "prod-app", "status"].includes(command)) {
    throw new Error("사용법: npm run db:profile -- [status|local-dev|prod-migrate|prod-app]");
  }

  const { source, values } = loadEnvFile();
  const store = loadStore(values);

  if (command === "status") {
    printStatus(values, store);
    return;
  }

  switchProfile(command, source, store);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
