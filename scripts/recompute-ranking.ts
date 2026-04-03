import { runJobCli } from "./run-job";

runJobCli(["recompute-ranking"]).catch((error) => {
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
  process.exit(1);
});
