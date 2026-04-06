import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-800 bg-[#0A0A0A]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-neutral-500 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="font-semibold text-white">Viber</div>
          <p>바이브코딩 프로젝트를 발견하고, 피드백하고, 함께 성장하는 커뮤니티</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/blog" className="transition hover:text-white">블로그</Link>
          <Link href="/policy/content" className="transition hover:text-white">운영 정책</Link>
          <Link href="/policy/privacy" className="transition hover:text-white">개인정보 안내</Link>
          <Link href="/submit" className="transition hover:text-white">프로젝트 등록</Link>
        </div>
      </div>
    </footer>
  );
}
