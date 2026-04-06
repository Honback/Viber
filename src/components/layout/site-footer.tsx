export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[rgba(255,253,248,0.76)]">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-4 py-8 text-sm text-foreground-muted md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="font-semibold text-foreground">Viber</div>
          <p>바이브코딩 프로젝트를 발견하고, 피드백하고, 함께 성장하는 커뮤니티</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a href="/blog">블로그</a>
          <a href="/policy/content">운영 정책</a>
          <a href="/policy/privacy">개인정보 안내</a>
          <a href="/submit">프로젝트 등록</a>
        </div>
      </div>
    </footer>
  );
}
