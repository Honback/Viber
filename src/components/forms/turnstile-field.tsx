"use client";

import { useEffect, useId, useRef, useState } from "react";
import Script from "next/script";
import { CLOUDFLARE_TURNSTILE_TEST_SITE_KEY, LOCAL_TURNSTILE_BYPASS_TOKEN } from "@/lib/security/turnstile-constants";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

type TurnstileFieldProps = {
  siteKey: string | null;
};

export function TurnstileField({ siteKey }: TurnstileFieldProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(() => typeof window !== "undefined" && Boolean(window.turnstile));
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current || widgetIdRef.current || !window.turnstile) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (value) => setToken(value),
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken(""),
      theme: "light"
    });

    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, scriptReady]);

  if (!siteKey) {
    return null;
  }

  if (siteKey === CLOUDFLARE_TURNSTILE_TEST_SITE_KEY) {
    return (
      <div className="grid gap-2">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
          Anti-Spam
        </label>
        <div
          id={id}
          className="rounded-2xl border border-dashed border-line bg-surface px-4 py-4 text-sm text-foreground-muted"
        >
          로컬 개발용 스팸 방지 확인이 활성화되어 있습니다.
        </div>
        <input type="hidden" name="turnstileToken" value={LOCAL_TURNSTILE_BYPASS_TOKEN} />
        <p className="text-xs text-foreground-muted">실서비스 키가 연결되면 이 영역은 실제 Turnstile 위젯으로 바뀝니다.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
        Anti-Spam
      </label>
      <div id={id} ref={containerRef} className="min-h-[65px]" />
      <input type="hidden" name="turnstileToken" value={token} />
      <p className="text-xs text-foreground-muted">자동화 요청을 막기 위해 사람 확인 토큰을 함께 보냅니다.</p>
    </div>
  );
}
