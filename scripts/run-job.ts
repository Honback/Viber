import { sql } from "../src/db";
import { type MaintenanceJobName, isMaintenanceJobName, runAllMaintenanceJobs, runMaintenanceJob } from "../src/lib/jobs/maintenance-jobs";

function parseArgs(argv: string[]) {
  const [jobName, ...rest] = argv;

  if (!jobName || (jobName !== "all" && !isMaintenanceJobName(jobName))) {
    throw new Error("지원하는 작업 이름을 입력해 주세요. all | check-links | cleanup-unclaimed | recompute-ranking");
  }

  const options: Record<string, unknown> = {};

  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];

    if (value === "--limit") {
      const nextValue = rest[index + 1];

      if (!nextValue) {
        throw new Error("--limit 값이 필요합니다.");
      }

      options.limit = Number(nextValue);
      index += 1;
    }
  }

  return {
    jobName: jobName as MaintenanceJobName | "all",
    options
  };
}

export async function runJobCli(argv: string[]) {
  const { jobName, options } = parseArgs(argv);
  const result =
    jobName === "all" ? await runAllMaintenanceJobs(options) : await runMaintenanceJob(jobName, options);
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  await sql.end();
}

if (process.argv[1]?.endsWith("run-job.ts")) {
  runJobCli(process.argv.slice(2)).catch(async (error) => {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error: error instanceof Error ? error.message : "작업 실행에 실패했습니다."
        },
        null,
        2
      )
    );
    await sql.end();
    process.exit(1);
  });
}
