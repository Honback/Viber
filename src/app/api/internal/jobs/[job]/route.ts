import { NextResponse, type NextRequest } from "next/server";

import { canRunInternalJobs } from "@/lib/jobs/auth";
import { isMaintenanceJobName, runAllMaintenanceJobs, runMaintenanceJob } from "@/lib/jobs/maintenance-jobs";

type RouteContext = {
  params: Promise<{ job: string }>;
};

async function readInput(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }

  const url = new URL(request.url);
  const limit = url.searchParams.get("limit");

  if (!limit) {
    return {};
  }

  return {
    limit
  };
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!(await canRunInternalJobs(request))) {
    return NextResponse.json(
      {
        error: "내부 작업 실행 권한이 없습니다."
      },
      { status: 401 }
    );
  }

  const { job } = await context.params;

  if (job === "run-all") {
    try {
      const input = await readInput(request);
      const payload = await runAllMaintenanceJobs(input);

      return NextResponse.json({
        ok: true,
        ...payload
      });
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          job,
          error: error instanceof Error ? error.message : "내부 작업 실행에 실패했습니다."
        },
        { status: 500 }
      );
    }
  }

  if (!isMaintenanceJobName(job)) {
    return NextResponse.json(
      {
        error: "지원하지 않는 작업입니다."
      },
      { status: 404 }
    );
  }

  try {
    const input = await readInput(request);
    const payload = await runMaintenanceJob(job, input);

    return NextResponse.json({
      ok: true,
      ...payload
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        job,
        error: error instanceof Error ? error.message : "내부 작업 실행에 실패했습니다."
      },
      { status: 500 }
    );
  }
}
