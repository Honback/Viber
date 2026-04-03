import { type NextRequest } from "next/server";

import { getCurrentProfile } from "@/lib/auth/session";
import { isLocalAppRuntime, jobsRunnerToken } from "@/lib/env";

function getBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization");

  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(/\s+/, 2);

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

function isLoopbackRequest(request: NextRequest) {
  try {
    const hostname = new URL(request.url).hostname;
    return hostname === "127.0.0.1" || hostname === "localhost";
  } catch {
    return false;
  }
}

export async function canRunInternalJobs(request: NextRequest) {
  if (jobsRunnerToken) {
    return getBearerToken(request) === jobsRunnerToken;
  }

  if (isLocalAppRuntime && isLoopbackRequest(request)) {
    return true;
  }

  const viewer = await getCurrentProfile();
  return viewer?.role === "admin";
}
