import { cleanupExpiredPendingProjects, recomputeProjectRankSnapshots, runLinkHealthChecks } from "@/lib/services/maintenance";

export const maintenanceJobNames = ["check-links", "cleanup-unclaimed", "recompute-ranking"] as const;

export type MaintenanceJobName = (typeof maintenanceJobNames)[number];

export type MaintenanceJobResultMap = {
  "check-links": Awaited<ReturnType<typeof runLinkHealthChecks>>;
  "cleanup-unclaimed": Awaited<ReturnType<typeof cleanupExpiredPendingProjects>>;
  "recompute-ranking": Awaited<ReturnType<typeof recomputeProjectRankSnapshots>>;
};

export type MaintenanceJobRunResult<Name extends MaintenanceJobName = MaintenanceJobName> = {
  job: Name;
  title: string;
  description: string;
  suggestedSchedule: string;
  options: Record<string, unknown>;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  summary: string;
  result: MaintenanceJobResultMap[Name];
};

export type MaintenanceJobBatchEntry =
  | ({
      ok: true;
    } & MaintenanceJobRunResult)
  | {
      ok: false;
      job: MaintenanceJobName;
      title: string;
      description: string;
      suggestedSchedule: string;
      startedAt: string;
      finishedAt: string;
      durationMs: number;
      error: string;
    };

type MaintenanceJobDefinition<Name extends MaintenanceJobName> = {
  name: Name;
  title: string;
  description: string;
  suggestedSchedule: string;
  parseOptions: (input: unknown) => Record<string, unknown>;
  run: (options: Record<string, unknown>) => Promise<MaintenanceJobResultMap[Name]>;
  summarize: (result: MaintenanceJobResultMap[Name]) => string;
};

type MaintenanceJobRegistry = {
  [Name in MaintenanceJobName]: MaintenanceJobDefinition<Name>;
};

function parseObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function parseCheckLinksOptions(input: unknown) {
  const raw = parseObject(input);
  const limitValue = typeof raw.limit === "number" ? raw.limit : Number(raw.limit);

  if (!Number.isFinite(limitValue) || limitValue <= 0) {
    return {};
  }

  return {
    limit: Math.min(Math.trunc(limitValue), 200)
  };
}

const maintenanceJobs: MaintenanceJobRegistry = {
  "check-links": {
    name: "check-links",
    title: "링크 헬스체크",
    description: "공개 프로젝트의 라이브 링크를 확인하고 healthy/degraded/broken 상태를 기록합니다.",
    suggestedSchedule: "매시간 또는 하루 2~4회",
    parseOptions: parseCheckLinksOptions,
    run: (options) => runLinkHealthChecks(options),
    summarize: (result) =>
      `checked=${result.checked} healthy=${result.healthy} degraded=${result.degraded} broken=${result.broken}`
  },
  "cleanup-unclaimed": {
    name: "cleanup-unclaimed",
    title: "미claim 정리",
    description: "기한이 지난 pending 제출과 만료된 claim 토큰을 정리합니다.",
    suggestedSchedule: "하루 1회",
    parseOptions: () => ({}),
    run: () => cleanupExpiredPendingProjects(),
    summarize: (result) => `deletedProjects=${result.deletedProjects}`
  },
  "recompute-ranking": {
    name: "recompute-ranking",
    title: "랭킹 재계산",
    description: "클릭, 저장, 댓글 신호를 기반으로 프로젝트 랭킹 스냅샷을 다시 계산합니다.",
    suggestedSchedule: "매시간 또는 하루 2~6회",
    parseOptions: () => ({}),
    run: () => recomputeProjectRankSnapshots(),
    summarize: (result) => `inserted=${result.inserted}`
  }
};

export function getMaintenanceJobDefinitions() {
  return maintenanceJobNames.map((name) => maintenanceJobs[name]);
}

export function isMaintenanceJobName(value: string): value is MaintenanceJobName {
  return maintenanceJobNames.includes(value as MaintenanceJobName);
}

export function parseMaintenanceJobOptions(jobName: MaintenanceJobName, input: unknown) {
  return maintenanceJobs[jobName].parseOptions(input);
}

export async function runMaintenanceJob<Name extends MaintenanceJobName>(jobName: Name, input?: unknown) {
  const definition = maintenanceJobs[jobName] as MaintenanceJobDefinition<Name>;
  const startedAt = new Date();
  const options = definition.parseOptions(input);
  const result = await definition.run(options);
  const finishedAt = new Date();

  return {
    job: definition.name,
    title: definition.title,
    description: definition.description,
    suggestedSchedule: definition.suggestedSchedule,
    options,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    summary: definition.summarize(result),
    result
  } satisfies MaintenanceJobRunResult<Name>;
}

export async function runAllMaintenanceJobs(input?: unknown) {
  const startedAt = new Date();
  const jobs: MaintenanceJobBatchEntry[] = [];

  for (const jobName of maintenanceJobNames) {
    const definition = maintenanceJobs[jobName];
    const jobStartedAt = new Date();

    try {
      const result = await runMaintenanceJob(jobName, input);
      jobs.push({
        ok: true,
        ...result
      });
    } catch (error) {
      const finishedAt = new Date();
      jobs.push({
        ok: false,
        job: definition.name,
        title: definition.title,
        description: definition.description,
        suggestedSchedule: definition.suggestedSchedule,
        startedAt: jobStartedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - jobStartedAt.getTime(),
        error: error instanceof Error ? error.message : "내부 작업 실행에 실패했습니다."
      });
    }
  }

  const finishedAt = new Date();
  const succeeded = jobs.filter((entry) => entry.ok).length;
  const failed = jobs.length - succeeded;

  return {
    scope: "all" as const,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    succeeded,
    failed,
    summary: `completed=${succeeded} failed=${failed}`,
    jobs
  };
}
