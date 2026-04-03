"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { ensureAbsoluteUrl } from "@/lib/utils/urls";

type CallbackStatus = "idle" | "processing" | "error";

function buildSignInPath(nextPath: string, error: string) {
  const url = new URL("/auth/sign-in", "http://local.origin");
  url.searchParams.set("next", ensureAbsoluteUrl(nextPath));
  url.searchParams.set("error", error);
  return `${url.pathname}${url.search}`;
}

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const startedRef = useRef(false);
  const [status, setStatus] = useState<CallbackStatus>("idle");
  const [message, setMessage] = useState("이메일에서 돌아온 인증 정보를 확인하고 있습니다.");

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    const run = async () => {
      const nextPath = ensureAbsoluteUrl(searchParams.get("next") ?? "/me/projects");
      const flowValue = searchParams.get("flow");
      const flow = flowValue === "setup" || flowValue === "recovery" ? flowValue : "login";
      const query = searchParams.toString();
      const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashError = hashParams.get("error_description") ?? hashParams.get("error");

      setStatus("processing");

      if (accessToken && refreshToken) {
        setMessage("인증 세션을 확인하고 있습니다.");

        try {
          const response = await fetch("/api/auth/callback/session", {
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({
              accessToken,
              refreshToken,
              flow,
              next: nextPath
            })
          });

          const payload = (await response.json().catch(() => null)) as { error?: string; destination?: string } | null;

          if (!response.ok || !payload?.destination) {
            window.location.replace(buildSignInPath(nextPath, payload?.error ?? "인증 세션을 저장하지 못했습니다."));
            return;
          }

          window.location.replace(payload.destination);
          return;
        } catch (error) {
          window.location.replace(
            buildSignInPath(nextPath, error instanceof Error ? error.message : "인증 세션을 저장하지 못했습니다.")
          );
          return;
        }
      }

      if (query && (searchParams.get("code") || searchParams.get("token_hash") || searchParams.get("token"))) {
        window.location.replace(`/auth/confirm?${query}`);
        return;
      }

      setStatus("error");
      setMessage(hashError ?? "유효한 이메일 인증 토큰이 없습니다. 이메일 링크를 다시 열어 주세요.");
      window.location.replace(buildSignInPath(nextPath, hashError ?? "유효한 이메일 인증 토큰이 없습니다."));
    };

    void run();
  }, [searchParams]);

  return (
    <PageShell className="max-w-[760px]">
      <section className="rounded-[36px] border border-line bg-[rgba(255,253,248,0.96)] p-6 shadow-soft">
        <SectionHeading eyebrow="Auth" title="인증 확인 중" description={message} />

        <div className="mt-6 grid gap-4 rounded-[28px] border border-line bg-white p-5 text-sm leading-7 text-foreground-muted">
          <p>{status === "error" ? "인증 정보가 올바르지 않아 로그인 화면으로 이동합니다." : "잠시만 기다려 주세요. 인증 결과를 확인한 뒤 적절한 화면으로 이동합니다."}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/auth/sign-in" className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-foreground">
            로그인 화면으로 돌아가기
          </Link>
          <Link href="/" className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-foreground">
            홈으로 이동
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
