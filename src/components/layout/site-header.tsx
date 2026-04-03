import Link from "next/link";
import { FolderKanban, Mail, Shield, Sparkles, TimerReset } from "lucide-react";

import type { SessionProfile } from "@/lib/auth/session";
import { navLinks } from "@/lib/constants";

type SiteHeaderProps = {
  viewer: SessionProfile | null;
};

function LoginForms() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/auth/sign-in?next=/me/projects"
        className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5"
      >
        로그인
      </Link>
    </div>
  );
}

function LoggedInControls({ viewer }: { viewer: SessionProfile }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-full bg-[rgba(47,106,97,0.08)] px-4 py-2 text-sm font-semibold text-green">
        <span>{viewer.displayName}</span>
        {viewer.role === "admin" ? <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-foreground">ADMIN</span> : null}
      </div>
      <form action="/api/auth/logout" method="post">
        <button className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5">
          로그아웃
        </button>
      </form>
    </div>
  );
}

export function SiteHeader({ viewer }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[rgba(250,248,244,0.9)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#111827] text-white">
                <Sparkles className="size-5" />
              </span>
              <span className="space-y-0.5">
                <span className="block text-[11px] font-semibold tracking-[0.16em] text-foreground-muted">PROJECT SHOWCASE</span>
                <span className="block text-lg font-extrabold tracking-tight">바이브 쇼케이스</span>
              </span>
            </Link>

            <nav className="flex flex-wrap items-center gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-foreground-muted transition hover:border-line hover:bg-white hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {viewer ? (
              <>
                <Link href="/me/saved" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5">
                  저장함
                </Link>
                <Link
                  href="/me/projects"
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5"
                >
                  <FolderKanban className="size-4" />
                  내 프로젝트
                </Link>
                {viewer.role === "admin" ? (
                  <>
                    <Link
                      href="/admin/moderation"
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5"
                    >
                      <Shield className="size-4" />
                      운영
                    </Link>
                    <Link
                      href="/admin/projects"
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5"
                    >
                      <FolderKanban className="size-4" />
                      프로젝트 관리
                    </Link>
                    <Link
                      href="/admin/jobs"
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5"
                    >
                      <TimerReset className="size-4" />
                      작업 실행
                    </Link>
                    <Link
                      href="/admin/mail"
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5"
                    >
                      <Mail className="size-4" />
                      메일 기록
                    </Link>
                  </>
                ) : null}
              </>
            ) : null}

            {viewer ? <LoggedInControls viewer={viewer} /> : <LoginForms />}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-foreground-muted">
          <span className="rounded-full bg-[rgba(23,32,44,0.05)] px-3 py-1.5">읽기는 바로</span>
          <span className="rounded-full bg-[rgba(23,32,44,0.05)] px-3 py-1.5">프로젝트 중심</span>
          <span className="rounded-full bg-[rgba(23,32,44,0.05)] px-3 py-1.5">업데이트는 owner만</span>
        </div>
      </div>
    </header>
  );
}
