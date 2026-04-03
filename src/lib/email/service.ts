import { eq } from "drizzle-orm";

import { db } from "@/db";
import { emailDeliveries, type EmailDeliveryStatus } from "@/db/schema";
import { isLocalAppRuntime, mailDeliveryMode, mailFrom, mailFromName, resendApiKey } from "@/lib/env";

export type AppEmailTemplate = "project-claim" | "project-comment" | "moderation-status";

type SendAppEmailInput = {
  template: AppEmailTemplate;
  recipient: string;
  subject: string;
  html: string;
  text: string;
  metadata?: Record<string, unknown>;
};

function resolveEffectiveMode() {
  if (mailDeliveryMode === "simulate" || mailDeliveryMode === "live") {
    return mailDeliveryMode;
  }

  if (isLocalAppRuntime) {
    return "simulate" as const;
  }

  return resendApiKey && mailFrom ? ("live" as const) : ("simulate" as const);
}

async function updateDelivery(id: string, values: Partial<typeof emailDeliveries.$inferInsert>) {
  await db.update(emailDeliveries).set(values).where(eq(emailDeliveries.id, id));
}

export async function sendAppEmail(input: SendAppEmailInput) {
  const sender = mailFrom ?? "noreply@local.test";
  const senderHeader = mailFrom ? `${mailFromName} <${mailFrom}>` : sender;
  const [delivery] = await db
    .insert(emailDeliveries)
    .values({
      provider: "resend",
      template: input.template,
      status: "queued",
      recipient: input.recipient.toLowerCase(),
      subject: input.subject,
      fromEmail: sender,
      htmlBody: input.html,
      textBody: input.text,
      metadataJson: input.metadata ?? {}
    })
    .returning({
      id: emailDeliveries.id
    });

  const mode = resolveEffectiveMode();

  if (mode === "simulate" || !resendApiKey || !mailFrom) {
    const simulatedStatus: EmailDeliveryStatus = "simulated";
    await updateDelivery(delivery.id, {
      status: simulatedStatus,
      sentAt: new Date(),
      error: mode === "simulate" ? "로컬 simulate 모드로 메일을 저장했습니다." : "Resend 설정이 없어 simulate 모드로 저장했습니다."
    });

    return {
      id: delivery.id,
      status: simulatedStatus
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: senderHeader,
        to: [input.recipient],
        subject: input.subject,
        html: input.html,
        text: input.text
      })
    });

    const payload = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      error?: string;
    };

    if (!response.ok) {
      const message = payload.message ?? payload.error ?? "Resend 메일 발송에 실패했습니다.";
      await updateDelivery(delivery.id, {
        status: "failed",
        error: message
      });

      return {
        id: delivery.id,
        status: "failed" as const,
        error: message
      };
    }

    await updateDelivery(delivery.id, {
      status: "sent",
      providerMessageId: payload.id ?? null,
      sentAt: new Date(),
      error: null
    });

    return {
      id: delivery.id,
      status: "sent" as const,
      providerMessageId: payload.id ?? null
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Resend 메일 발송 중 알 수 없는 오류가 발생했습니다.";
    await updateDelivery(delivery.id, {
      status: "failed",
      error: message
    });

    return {
      id: delivery.id,
      status: "failed" as const,
      error: message
    };
  }
}
