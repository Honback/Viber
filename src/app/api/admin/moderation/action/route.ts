import { revalidatePath } from "next/cache";

import { requireAdminProfile } from "@/lib/auth/session";
import { createRedirectResponse, parseOptionalString, parseRequiredString } from "@/lib/http";
import {
  moderatePostStatus,
  moderateProjectStatus,
  setProjectFeature,
  updateReportStatus
} from "@/lib/services/mutations";
import { moderationProjectSchema } from "@/lib/validations/forms";

function mapProjectActionToStatus(action: string) {
  if (action === "publish" || action === "restore") return "published" as const;
  if (action === "limit") return "limited" as const;
  if (action === "hide") return "hidden" as const;
  if (action === "reject") return "rejected" as const;
  if (action === "archive") return "archived" as const;
  return null;
}

function mapPostActionToStatus(action: string) {
  if (action === "publish") return "published" as const;
  if (action === "hide") return "hidden" as const;
  if (action === "reject") return "rejected" as const;
  return null;
}

function mapReportActionToStatus(action: string) {
  if (action === "reviewing") return "reviewing" as const;
  if (action === "resolved") return "resolved" as const;
  if (action === "rejected") return "rejected" as const;
  return null;
}

export async function POST(request: Request) {
  const admin = await requireAdminProfile();
  const formData = await request.formData();

  try {
    const parsed = moderationProjectSchema.parse({
      targetType: parseRequiredString(formData.get("targetType")),
      targetId: parseRequiredString(formData.get("targetId")),
      action: parseRequiredString(formData.get("action")),
      reason: parseOptionalString(formData.get("reason")) ?? "",
      redirectTo: parseRequiredString(formData.get("redirectTo")),
      featuredOrder: parseOptionalString(formData.get("featuredOrder")) ?? undefined
    });

    if (parsed.targetType === "project" && (parsed.action === "feature" || parsed.action === "unfeature")) {
      await setProjectFeature({
        projectId: parsed.targetId,
        featured: parsed.action === "feature",
        order: parsed.featuredOrder ?? null,
        admin
      });
    } else if (parsed.targetType === "project") {
      const nextStatus = mapProjectActionToStatus(parsed.action);

      if (!nextStatus) {
        throw new Error("지원하지 않는 프로젝트 액션입니다.");
      }

      await moderateProjectStatus({
        projectId: parsed.targetId,
        nextStatus,
        reason: parsed.reason,
        admin
      });
    } else if (parsed.targetType === "post") {
      const nextStatus = mapPostActionToStatus(parsed.action);

      if (!nextStatus) {
        throw new Error("지원하지 않는 활동 액션입니다.");
      }

      await moderatePostStatus({
        postId: parsed.targetId,
        nextStatus,
        reason: parsed.reason,
        admin
      });
    } else {
      const nextStatus = mapReportActionToStatus(parsed.action);

      if (!nextStatus) {
        throw new Error("지원하지 않는 신고 액션입니다.");
      }

      await updateReportStatus({
        reportId: parsed.targetId,
        nextStatus,
        reason: parsed.reason,
        admin
      });
    }

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin/moderation");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/feature");

    return createRedirectResponse(parsed.redirectTo, { notice: "운영 액션을 적용했습니다." });
  } catch (error) {
    return createRedirectResponse("/admin/moderation", {
      error: error instanceof Error ? error.message : "운영 액션 적용에 실패했습니다."
    });
  }
}
