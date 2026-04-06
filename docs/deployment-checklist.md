# Viber 배포 전 체크리스트

> 작성일: 2026-04-06
> 대상: vibehub.co.kr (Vercel + Supabase)
> 기존 런북: docs/24-vercel-deployment-runbook.md

---

## 전체 현황 요약

| 카테고리 | 상태 | 긴급도 |
|----------|------|--------|
| 빌드 | 빌드 실패 (TS 에러 1건) | CRITICAL |
| next.config.ts | 완전 비어있음 | HIGH |
| SEO 메타데이터 | 70% 완료 (전회차 작업) | MEDIUM |
| SEO 구조화 데이터 | 50% 완료 | MEDIUM |
| OG 이미지 | 0% (미구현) | HIGH |
| manifest.ts (PWA) | 미구현 | MEDIUM |
| 보안 헤더 | 미설정 | HIGH |
| 이미지 최적화 | `<img>` 직접 사용 (next/image 미사용) | MEDIUM |
| 외부 분석도구 | 미설정 (커스텀만 있음) | LOW |
| 에러 트래킹 | 미설정 | LOW |
| DB/Auth/Mail | 완료 | - |
| 배포 런북 | 완료 (docs/24-vercel-deployment-runbook.md) | - |

---

## 1. CRITICAL — 빌드 차단 이슈

### 1.1 ThemeToggle TypeScript 에러

**파일:** `src/components/theme-toggle.tsx:4`
**에러:** `Module '"./theme-provider"' has no exported member 'useTheme'`

**원인:** `theme-provider.tsx`는 빈 wrapper인데 `theme-toggle.tsx`가 `useTheme` 훅을 import

**해결 방안:**
- A) `theme-provider.tsx`에 `useTheme` 훅 구현
- B) `theme-toggle.tsx` 삭제 (현재 아무 곳에서도 사용 안 함)

**참고:** `ThemeToggle` 컴포넌트는 현재 어디에서도 import하지 않음 → 삭제가 가장 깔끔

---

## 2. HIGH — 배포 전 반드시 해야 할 것

### 2.1 next.config.ts 프로덕션 설정

현재 상태: 완전히 비어있음

**필요한 설정:**

```
- 이미지 최적화: Supabase Storage URL을 remotePatterns에 추가
- 보안 헤더: X-Frame-Options, X-Content-Type-Options, Referrer-Policy 등
- Strict-Transport-Security (HSTS)
- Permissions-Policy
```

### 2.2 OG(OpenGraph) 이미지

**현재:** 전체 사이트에 OG 이미지 없음
**영향:** SNS(카카오톡, X, 슬랙) 공유 시 미리보기 카드에 이미지 없음

**필요한 작업:**
- 기본 OG 이미지 (정적 파일): `src/app/opengraph-image.png` (1200x630)
- 프로젝트 상세 동적 OG: `src/app/(public)/p/[slug]/opengraph-image.tsx` (커버 이미지 활용)

### 2.3 이미지 최적화 (`<img>` → `next/image`)

**현재:** 10개의 `<img>` 태그가 직접 사용됨
**영향:** 자동 WebP/AVIF 변환, lazy loading, 반응형 크기 조절 미적용 → LCP 성능 저하

**파일 목록:**
- `src/app/(public)/p/[slug]/page.tsx` — 커버 이미지, 갤러리 (2곳)
- `src/components/projects/project-card.tsx` — 카드 이미지
- `src/components/explore/variant-table.tsx` — 테이블 뷰
- `src/components/explore/variant-magazine.tsx` — 매거진 뷰
- `src/components/landing/variant-feature/index.tsx` — 랜딩 (3곳)
- `src/components/landing/variant-classic/index.tsx` — 클래식 랜딩
- `src/components/projects/activity-feed.tsx` — 피드 이미지

---

## 3. MEDIUM — 배포와 함께 또는 직후 적용

### 3.1 manifest.ts (PWA 메타데이터)

**현재:** 미존재
**필요:** `src/app/manifest.ts` — 앱 이름, 아이콘, 테마 색상, display 모드

### 3.2 apple-touch-icon

**현재:** favicon.ico만 있음
**필요:** `src/app/apple-icon.png` (180x180) — iOS 홈 화면 추가 시 아이콘

### 3.3 SEO 추가 최적화

이전 작업(04/03)으로 기본 메타데이터/JSON-LD 완료. 남은 항목:

| 항목 | 상태 | 설명 |
|------|------|------|
| FAQ Microdata → JSON-LD 전환 | 미완 | geo-faq-section.tsx (현재 Microdata 방식) |
| HowTo JSON-LD (/submit) | 미완 | 프로젝트 등록 과정 구조화 |
| ItemList JSON-LD (/projects) | 미완 | 프로젝트 목록 구조화 |
| Speakable JSON-LD (홈) | 미완 | GEO: AI 음성 답변 인용 대상 지정 |

### 3.4 GEO 최적화 추가

상세는 `docs/seo-geo-optimization-guide.md` 참조

---

## 4. LOW — 배포 후 점진적 적용

### 4.1 외부 분석 도구

- Google Analytics 4 또는 Vercel Analytics
- Google Search Console 등록 + 사이트맵 제출
- Naver Search Advisor 등록 (한국 대상)

### 4.2 에러 트래킹

- Sentry 또는 Vercel Error Tracking 연동

### 4.3 성능 모니터링

- Vercel Speed Insights
- Core Web Vitals 대시보드

---

## 5. 이미 완료된 항목 (04/03 작업)

| 항목 | 파일 |
|------|------|
| 루트 메타데이터 (title, description, keywords, OG, Twitter) | `src/app/layout.tsx` |
| 프로젝트 상세 generateMetadata + OG + Twitter | `src/app/(public)/p/[slug]/page.tsx` |
| 탐색 페이지 고유 메타데이터 | `src/app/(public)/projects/page.tsx` |
| 태그 페이지 동적 메타데이터 | `src/app/(public)/tags/[slug]/page.tsx` |
| 등록 페이지 고유 메타데이터 | `src/app/(public)/submit/page.tsx` |
| 정책 페이지 고유 메타데이터 | `src/app/(public)/policy/*/page.tsx` |
| 랜딩 배리언트 canonical + noindex | `src/app/(public)/[variant]/*/page.tsx` |
| WebSite + Organization JSON-LD (홈) | `src/app/(public)/page.tsx` |
| SoftwareApplication + Breadcrumb JSON-LD (프로젝트) | `src/app/(public)/p/[slug]/page.tsx` |
| FAQ Microdata (랜딩) | `src/components/landing/geo-faq-section.tsx` |
| sitemap (priority, changeFrequency, 태그 포함) | `src/app/sitemap.ts` |
| robots (admin/api/auth disallow) | `src/app/robots.ts` |
| 메타데이터용 경량 조회 함수 | `src/lib/services/read-models.ts` |
| 키워드 리서치 문서 | `docs/seo-keywords.md` |
| SEO 감사 문서 | `docs/seo-audit.md` |

---

## 6. 환경변수 & 외부 서비스 (런북 참조)

기존 런북(`docs/24-vercel-deployment-runbook.md`)에 상세 정리됨.

**핵심 체크:**
- [ ] `NEXT_PUBLIC_APP_URL` = `https://vibehub.co.kr`
- [ ] `DATABASE_URL` = Supabase pooler 연결 문자열
- [ ] Supabase Auth URL 설정 (Site URL, Redirect URLs)
- [ ] Cloudflare Turnstile에 `vibehub.co.kr` 호스트네임 추가
- [ ] Resend 도메인 인증 확인
- [ ] `MAIL_DELIVERY_MODE` = `live`

---

## 7. 배포 순서 (권장)

1. **빌드 에러 수정** (theme-toggle)
2. **next.config.ts** 프로덕션 설정
3. **OG 이미지** 추가
4. **manifest.ts** 추가
5. **빌드 테스트** (`npm run build`)
6. **환경변수 설정** (Vercel)
7. **첫 배포**
8. **도메인 연결** (vibehub.co.kr)
9. **외부 서비스 URL 업데이트** (Supabase, Turnstile)
10. **스모크 테스트**
11. **Search Console / Naver 등록**
12. **GEO 추가 최적화** (점진적)
