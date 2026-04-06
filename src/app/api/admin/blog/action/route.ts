import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdminProfile } from "@/lib/auth/session";
import { buildRedirectPath, parseRequiredString } from "@/lib/http";

function redir(basePath: string, params?: Record<string, string | undefined | null>) {
  return NextResponse.redirect(buildRedirectPath(basePath, params), { status: 303 });
}

const POSTS_FILE = join(process.cwd(), "src/lib/blog/posts.ts");

function readPostsFile(): string {
  return readFileSync(POSTS_FILE, "utf-8");
}

function writePostsFile(content: string): void {
  writeFileSync(POSTS_FILE, content, "utf-8");
}

export async function POST(request: Request) {
  await requireAdminProfile();
  const formData = await request.formData();

  const slug = parseRequiredString(formData.get("slug"));
  const action = parseRequiredString(formData.get("action"));
  const redirectTo = parseRequiredString(formData.get("redirectTo")) || "/admin/blog";

  if (!slug || !action) {
    return redir(redirectTo, { error: "잘못된 요청입니다." });
  }

  try {
    const source = readPostsFile();

    if (action === "publish") {
      // Find the post block and change status: "draft" to status: "published"
      const pattern = new RegExp(
        `(slug:\\s*"${escapeRegex(slug)}"[\\s\\S]*?status:\\s*)"draft"`,
      );
      if (!pattern.test(source)) {
        return redir(redirectTo, { error: "해당 포스트를 찾을 수 없습니다." });
      }
      const updated = source.replace(pattern, `$1"published"`);
      writePostsFile(updated);
    } else if (action === "unpublish") {
      const pattern = new RegExp(
        `(slug:\\s*"${escapeRegex(slug)}"[\\s\\S]*?status:\\s*)"published"`,
      );
      if (!pattern.test(source)) {
        return redir(redirectTo, { error: "해당 포스트를 찾을 수 없습니다." });
      }
      const updated = source.replace(pattern, `$1"draft"`);
      writePostsFile(updated);
    } else if (action === "delete") {
      // Remove the entire post object from the array
      // Find the object starting with { slug: "..." and ending with },
      const blockPattern = new RegExp(
        `\\s*\\{[\\s\\S]*?slug:\\s*"${escapeRegex(slug)}"[\\s\\S]*?\\},?`,
      );
      if (!blockPattern.test(source)) {
        return redir(redirectTo, { error: "해당 포스트를 찾을 수 없습니다." });
      }
      const updated = source.replace(blockPattern, "");
      writePostsFile(updated);
    } else {
      return redir(redirectTo, { error: "알 수 없는 액션입니다." });
    }

    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    revalidatePath("/sitemap.xml");

    const messages: Record<string, string> = {
      publish: "포스트가 공개되었습니다.",
      unpublish: "포스트가 비공개로 전환되었습니다.",
      delete: "포스트가 삭제되었습니다.",
    };

    return redir(redirectTo, { notice: messages[action] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return redir(redirectTo, { error: message });
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
