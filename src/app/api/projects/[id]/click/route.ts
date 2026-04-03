import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth/session";
import { createRedirectResponse, parseRequiredString } from "@/lib/http";
import { getVisitorSessionHash } from "@/lib/auth/visitor";
import { recordProjectClick } from "@/lib/services/mutations";
import { clickActionSchema } from "@/lib/validations/forms";
import type { RankingClickSource } from "@/lib/utils/ranking";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function mapLegacySource(source: string, target: "live" | "github" | "demo" | "docs"): RankingClickSource {
  if (source === "home_try" || source === "projects_try" || source === "tag_try" || source === "detail_try" || source === "detail_demo" || source === "detail_docs" || source === "detail_github" || source === "activity_try") {
    return source;
  }

  if (source === "featured_card") {
    return "home_try";
  }

  if (source === "project_card") {
    return "projects_try";
  }

  if (source === "detail_primary") {
    return "detail_try";
  }

  if (source === "detail_secondary" && target === "github") {
    return "detail_github";
  }

  if (target === "github") {
    return "detail_github";
  }

  if (target === "demo") {
    return "detail_demo";
  }

  if (target === "docs") {
    return "detail_docs";
  }

  return "projects_try";
}

export async function POST(request: Request, context: RouteContext) {
  const viewer = await getCurrentProfile();
  const { id } = await context.params;
  const formData = await request.formData();

  try {
    const parsed = clickActionSchema.parse({
      source: parseRequiredString(formData.get("source")),
      target: parseRequiredString(formData.get("target"))
    });
    const sessionHash = await getVisitorSessionHash(viewer?.id);
    const result = await recordProjectClick({
      projectId: id,
      source: mapLegacySource(parsed.source, parsed.target),
      sessionHash,
      userId: viewer?.id
    });

    return NextResponse.redirect(result.targetUrl, { status: 303 });
  } catch (error) {
    return createRedirectResponse("/projects", {
      error: error instanceof Error ? error.message : "링크 이동에 실패했습니다."
    });
  }
}
