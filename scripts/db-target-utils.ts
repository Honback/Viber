export type DbScope = "local" | "remote" | "unknown";

export function parseDatabaseUrl(urlString?: string | null) {
  if (!urlString) {
    return null;
  }

  try {
    const url = new URL(urlString);
    const host = url.hostname;
    const port = url.port || "(default)";
    const database = url.pathname.replace(/^\//, "") || "(unknown)";
    const isLocal = ["127.0.0.1", "localhost"].includes(host);

    return {
      host,
      port,
      database,
      scope: isLocal ? ("local" as const) : ("remote" as const),
    };
  } catch {
    return null;
  }
}

export function getDbScope(urlString?: string | null): DbScope {
  return parseDatabaseUrl(urlString)?.scope ?? "unknown";
}
