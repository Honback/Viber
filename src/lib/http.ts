import { NextResponse } from "next/server";

import { ensureAbsoluteUrl } from "@/lib/utils/urls";

export function buildRedirectPath(basePath: string | null | undefined, params?: Record<string, string | undefined | null>) {
  const url = new URL(ensureAbsoluteUrl(basePath || "/"), "http://local.origin");

  for (const [key, value] of Object.entries(params ?? {})) {
    if (!value) continue;
    url.searchParams.set(key, value);
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function buildRequestUrl(request: Request, basePath: string | null | undefined, params?: Record<string, string | undefined | null>) {
  const fallback = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? fallback.host;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol = forwardedProto ? `${forwardedProto.replace(/:$/, "")}:` : fallback.protocol;

  return new URL(buildRedirectPath(basePath, params), `${protocol}//${host}`);
}

export function createRedirectResponse(basePath: string | null | undefined, params?: Record<string, string | undefined | null>, status = 303) {
  return new NextResponse(null, {
    status,
    headers: {
      Location: buildRedirectPath(basePath, params)
    }
  });
}

export function parseOptionalString(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function parseRequiredString(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function parseCheckbox(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") return false;
  return ["on", "true", "1", "yes"].includes(value.toLowerCase());
}

export function parseCsvList(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function countLinks(value: string) {
  return (value.match(/https?:\/\/[^\s)]+/g) ?? []).length;
}
