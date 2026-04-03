import { resolveTxt } from "node:dns/promises";

import { getDomain } from "tldts";

const sharedHostSuffixes = ["vercel.app", "github.io", "notion.site", "supabase.co"];

export type DomainVerificationTarget = {
  hostname: string;
  registrableDomain: string;
  recordName: string;
};

function parseHostname(liveUrl: string) {
  try {
    return new URL(liveUrl).hostname.toLowerCase();
  } catch {
    throw new Error("도메인 검증 대상 live URL 형식을 해석하지 못했습니다.");
  }
}

function isSharedHost(hostname: string) {
  return sharedHostSuffixes.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));
}

export function getDomainVerificationTarget(liveUrl: string): DomainVerificationTarget {
  const hostname = parseHostname(liveUrl);

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    throw new Error("로컬 개발 주소는 도메인 검증 대상으로 사용할 수 없습니다.");
  }

  if (isSharedHost(hostname)) {
    throw new Error("공유 호스트 도메인은 검증할 수 없습니다. 직접 DNS를 제어하는 도메인을 사용해 주세요.");
  }

  const registrableDomain = getDomain(hostname, { allowPrivateDomains: true });

  if (!registrableDomain) {
    throw new Error("등록 가능 도메인을 추출하지 못했습니다. live URL을 다시 확인해 주세요.");
  }

  return {
    hostname,
    registrableDomain,
    recordName: `_viber-verify.${registrableDomain}`
  };
}

export async function lookupDomainVerificationTokens(recordName: string) {
  try {
    const rows = await resolveTxt(recordName);
    return rows.flat().map((value) => value.trim()).filter(Boolean);
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

    if (code === "ENOTFOUND" || code === "ENODATA" || code === "SERVFAIL" || code === "ETIMEOUT") {
      return [];
    }

    throw error;
  }
}
