import { NextResponse, type NextRequest } from "next/server";

import { canRunInternalJobs } from "@/lib/jobs/auth";
import { getMaintenanceJobDefinitions } from "@/lib/jobs/maintenance-jobs";

export async function GET(request: NextRequest) {
  if (!(await canRunInternalJobs(request))) {
    return NextResponse.json(
      {
        error: "내부 작업 실행 권한이 없습니다."
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    runAllPath: "/api/internal/jobs/run-all",
    jobs: getMaintenanceJobDefinitions().map((job) => ({
      name: job.name,
      title: job.title,
      description: job.description,
      suggestedSchedule: job.suggestedSchedule
    }))
  });
}
