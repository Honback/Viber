import { isTurnstileConfigured, isTurnstileUsingTestKeys, turnstileBypassToken, turnstileSecretKey } from "@/lib/env";

type TurnstileVerificationResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export function shouldEnforceTurnstile() {
  return isTurnstileConfigured;
}

export async function verifyTurnstileToken(token: string | null | undefined, remoteIp?: string | null) {
  if (!shouldEnforceTurnstile()) {
    return;
  }

  if (!token) {
    throw new Error("스팸 방지 확인을 완료해 주세요.");
  }

  if (isTurnstileUsingTestKeys && token === turnstileBypassToken) {
    return;
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      secret: turnstileSecretKey!,
      response: token,
      ...(remoteIp ? { remoteip: remoteIp } : {})
    })
  });

  if (!response.ok) {
    throw new Error("스팸 방지 검증 요청에 실패했습니다.");
  }

  const payload = (await response.json()) as TurnstileVerificationResponse;

  if (!payload.success) {
    throw new Error("스팸 방지 확인에 실패했습니다. 다시 시도해 주세요.");
  }
}
