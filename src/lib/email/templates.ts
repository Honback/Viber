type EmailTemplateInput = {
  title: string;
  intro: string;
  body: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  footer?: string[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderParagraphs(lines: string[]) {
  return lines
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 12px;color:#334155;font-size:14px;line-height:1.7;">${escapeHtml(line)}</p>`)
    .join("");
}

export function renderEmailTemplate(input: EmailTemplateInput) {
  const html = `
    <div style="background:#f5f1e8;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Noto Sans KR','Segoe UI',sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5ded1;border-radius:24px;padding:28px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:#7c6f57;text-transform:uppercase;">VIBE SHOWCASE</div>
        <h1 style="margin:12px 0 10px;font-size:28px;line-height:1.2;color:#111827;">${escapeHtml(input.title)}</h1>
        <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.8;">${escapeHtml(input.intro)}</p>
        ${renderParagraphs(input.body)}
        ${
          input.ctaLabel && input.ctaUrl
            ? `<div style="margin:24px 0 20px;"><a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 18px;border-radius:999px;">${escapeHtml(input.ctaLabel)}</a></div>`
            : ""
        }
        ${
          input.footer?.length
            ? `<div style="margin-top:24px;padding-top:18px;border-top:1px solid #ece6da;">${renderParagraphs(input.footer)}</div>`
            : ""
        }
      </div>
    </div>
  `.trim();

  const text = [
    input.title,
    "",
    input.intro,
    "",
    ...input.body,
    input.ctaLabel && input.ctaUrl ? "" : null,
    input.ctaLabel && input.ctaUrl ? `${input.ctaLabel}: ${input.ctaUrl}` : null,
    input.footer?.length ? "" : null,
    ...(input.footer ?? [])
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");

  return {
    html,
    text
  };
}
