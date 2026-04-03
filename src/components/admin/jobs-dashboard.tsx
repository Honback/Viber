"use client";

import { useMemo, useState } from "react";

type SchedulerJob = {
  name: string;
  title: string;
  description: string;
  suggestedSchedule: string;
};

type JobResultMap = Record<string, string>;

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function JobsDashboard({ jobs }: { jobs: SchedulerJob[] }) {
  const [runningKey, setRunningKey] = useState<string | null>(null);
  const [results, setResults] = useState<JobResultMap>({});
  const [error, setError] = useState<string | null>(null);

  const jobRouteMap = useMemo(
    () =>
      Object.fromEntries(
        jobs.map((job) => [
          job.name,
          {
            ...job,
            path: `/api/internal/jobs/${job.name}`
          }
        ])
      ),
    [jobs]
  );

  async function runJob(path: string, key: string) {
    setRunningKey(key);
    setError(null);

    try {
      const response = await fetch(path, {
        method: "POST"
      });
      const payload = await response.json();
      const serialized = formatJson(payload);

      if (!response.ok) {
        setError(payload?.error ?? "작업 실행에 실패했습니다.");
      }

      setResults((current) => ({
        ...current,
        [key]: serialized
      }));
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "작업 실행에 실패했습니다.");
    } finally {
      setRunningKey(null);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[28px] border border-line bg-white/90 p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground">전체 유지보수 실행</h2>
            <p className="text-sm leading-7 text-foreground-muted">
              링크 헬스체크, 미claim 정리, 랭킹 재계산을 순차 실행합니다. 운영 cron이 붙기 전에도 같은 경로를 바로 확인할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => runJob("/api/internal/jobs/run-all", "run-all")}
            disabled={runningKey !== null}
            className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {runningKey === "run-all" ? "실행 중..." : "전체 실행"}
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-[rgba(255,253,248,0.96)] px-4 py-4 text-sm text-foreground-muted">
          권한 규칙: 로컬 loopback 요청, 관리자 세션, 또는 <code>JOBS_RUNNER_TOKEN</code> Bearer 토큰 중 하나가 필요합니다.
        </div>

        {results["run-all"] ? (
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-line bg-[#111827] p-4 text-xs leading-6 text-white">
            {results["run-all"]}
          </pre>
        ) : null}
      </section>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4">
        {jobs.map((job) => (
          <article key={job.name} className="rounded-[28px] border border-line bg-white/90 p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex rounded-full bg-[rgba(47,106,97,0.1)] px-3 py-1.5 text-xs font-semibold text-green">
                  {job.name}
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">{job.title}</h3>
                  <p className="mt-1 text-sm leading-7 text-foreground-muted">{job.description}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => runJob(jobRouteMap[job.name].path, job.name)}
                disabled={runningKey !== null}
                className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {runningKey === job.name ? "실행 중..." : "이 작업 실행"}
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-[rgba(255,253,248,0.96)] px-4 py-4 text-sm text-foreground">
              권장 주기: <span className="font-semibold">{job.suggestedSchedule}</span>
            </div>

            {results[job.name] ? (
              <pre className="mt-4 overflow-x-auto rounded-2xl border border-line bg-[#111827] p-4 text-xs leading-6 text-white">
                {results[job.name]}
              </pre>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
