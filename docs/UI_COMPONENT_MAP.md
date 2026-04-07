# Vibeollio UI 컴포넌트 맵

> 캡처 기준: 2026-03-30 / dev 서버 localhost:3002
> 스크린샷 경로: `screenshots/`

---

## 공통 구조 (모든 페이지)

### Header (`src/components/layout/site-header.tsx`)

| 구성 요소 | 설명 |
|-----------|------|
| 로고 | Sparkles 아이콘 + "Vibeollio" 텍스트, `/` 링크 |
| 검색 바 | `⌘K` 단축키 표시, `/projects` 이동 |
| 네비게이션 | 홈, 제품, 트렌딩, 뉴, 피드백, 탐색, 등록하기 (7개) |
| 테마 토글 | 다크/라이트 전환 버튼 |
| 인증 | 로그인 버튼 또는 사용자 이름 표시 |

### Footer (`src/components/layout/site-footer.tsx`)

| 구성 요소 | 설명 |
|-----------|------|
| 브랜드 | "Vibeollio" + 커뮤니티 설명 텍스트 |
| 링크 | 운영 정책, 개인정보 안내, 프로젝트 등록 |

### UI Version 스위처 (`src/components/landing/landing-variant-switcher.tsx`)

상단 고정 바에 3개 버전 링크: `1. 기본` `/` | `2. 기능중심` `/feature` | `3. 다크 미니멀` `/minimal`

---

## 1. 기본 (Classic) — `/`

![Classic Home](../screenshots/page1-classic-home.png)

**파일:** `src/components/landing/variant-classic/index.tsx`
**테마:** 라이트 / 뉴트럴

### 섹션 구성

| # | 섹션 | 컴포넌트 | 설명 |
|---|------|----------|------|
| 1 | Hero | `HeroBackground`, `RotatingText` | h1 "Vibeollio" + 회전 텍스트 애니메이션, 태그라인 "무료 등록 · 즉시 노출 · 실시간 피드백", CTA 버튼 2개, 태그 칩 (최대 8개) |
| 2 | Trending | `FeedHeader`, `ClassicCard` | "🔥 트렌딩" 섹션, 3열 그리드 (xl), `data.featured` 매핑 |
| 3 | New | `FeedHeader`, `ClassicCard` | "🆕 신규 공개" 섹션, `data.launches` 매핑 |
| 4 | Feedback | `FeedHeader`, `ClassicCard` | "💬 열띤 피드백" 섹션, `data.feedback` 매핑 |
| 5 | FAQ | `GeoFaqSection` | 동적 FAQ 생성 |
| 6 | CTA | `CTASection` (shared) | 프로젝트 등록 유도 |

### ClassicCard 구조

```
<article> (rounded-[28px], border, shadow-soft)
  ├── 커버 이미지 (aspect-[16/10])
  ├── 카테고리 + 플랫폼 라벨
  ├── 제목 (h3)
  ├── 태그라인 (line-clamp-2)
  ├── 상태 뱃지 + 프로젝트 뱃지
  ├── 메트릭 (메이커, 시간, 댓글, 저장)
  └── TryButton + DetailLink
```

### 서브 페이지

없음 (홈 페이지만)

---

## 2. 기능중심 (Feature) — `/feature`

![Feature Home](../screenshots/page2-feature-home.png)

**파일:** `src/components/landing/variant-feature/index.tsx`
**테마:** 웜 오렌지 (#d76542 액센트), 밝은 배경 (#FFFDF8)

### 커스텀 헤더

| 구성 요소 | 설명 |
|-----------|------|
| 로고 | "🚀 Vibeollio" (액센트 컬러) |
| 네비게이션 | Home, Products, Trending, New, Feedback (5개 탭, 활성시 액센트 배경) |
| 테마 토글 | ☀️ 아이콘 |
| 인증 | 로그인 버튼 또는 사용자 이름 |

### 홈 섹션 구성

| # | 섹션 | 컴포넌트 | 설명 |
|---|------|----------|------|
| 1 | Hero | 타이핑 애니메이션 | 뱃지 "🚀 바이브코딩 커뮤니티 쇼케이스", h1 "내가 만든 {타이핑} 여기서 시작" (API/앱/SaaS/게임/도구/AI/웹사이트/플러그인 순환), 검색 인풋, CTA 2개, 통계 바 |
| 2 | Trending | `FeaturedCard`, `ProjectCard` | 카테고리 탭 6개 (All/AI/Tool/Web/Game/API), 대형 카드 1개 + 3열 그리드 6개 |
| 3 | New | `NewProjectRow` | "🆕 New Projects" + 이번주 뱃지, 테이블형 레이아웃 (최대 8개) |
| 4 | Feedback | `FeedbackCard` | "💬 피드백 요청 중", 3열 그리드 (최대 3개) |
| 5 | Stats | 3개 통계 카드 | FolderOpen/MousePointerClick/MessageSquare 아이콘, 등록 프로젝트/Try 횟수/누적 피드백 |
| 6 | CTA | CTA 블록 | "당신의 프로젝트를 세상에 선보이세요" + 버튼 + 통계 메시지 |
| 7 | Footer | 커스텀 4열 푸터 | 로고, 소셜 링크, 빠른 링크, 하단 링크 |

### 서브 페이지

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/feature/products` | `FeatureProducts` | 검색 + 카테고리 필터 (10개 탭), 애니메이션 그리드 |
| `/feature/trending` | `FeatureTrending` | 기간 선택 (오늘/이번주/이번달/전체), Top 3 메달 (🥇🥈🥉) + 나머지 리스트 |
| `/feature/new` | `FeatureNew` | 날짜순 프로젝트 리스트 |
| `/feature/feedback` | `FeatureFeedback` | 피드백 요청 프로젝트 + 질문 표시 |

### 애니메이션

`useScrollAnimation()` — IntersectionObserver 기반 스크롤 트리거 (opacity/transform)

---

## 3. 다크 미니멀 (Minimal) — `/minimal`

![Minimal Home](../screenshots/page3-minimal-home.png)

**파일:** `src/components/landing/variant-minimal/index.tsx`
**테마:** 다크 (#0A0A0A 배경), 미니멀, 화이트 텍스트

### 커스텀 헤더

| 구성 요소 | 설명 |
|-----------|------|
| 로고 | "Vibeollio" 텍스트 (화이트) |
| 네비게이션 | 프로젝트, 트렌딩, 피드백 (3개, 중앙 정렬) |
| 테마 | Moon 아이콘 (우측) |

### 홈 섹션 구성

| # | 섹션 | 배경 | 설명 |
|---|------|------|------|
| 1 | Hero | #0A0A0A | h1 "Vibeollio" (text-6xl~8xl), 서브타이틀 "인디 메이커의 프로덕트를 발견하고...", CTA 2개 (둘러보기/등록), `AnimateIn` 스태거 애니메이션 |
| 2 | Why Vibeollio | #111111 | "왜 Vibeollio인가요?", 3개 문제/해결 쌍 (CheckCircle 초록 아이콘), 2열 그리드 |
| 3 | Trending | #0A0A0A | "지금 뜨는 프로젝트", `ProjectRow` 리스트 (최대 6개), 순위/커버/제목+태그라인/점수 |
| 4 | Categories | #111111 | "카테고리", 6개 카드 (2~3열), 색상 코딩된 아이콘 (Cpu/Wrench/Globe/Gamepad2/Plug/CloudCog), 개수 표시 |
| 5 | Stats | #0A0A0A | 4개 통계 (2x2→1x4), 1,240+ Projects / 52K+ 사용자 / 8.4K+ 추천 / 3.2K+ 피드백 |
| 6 | CTA | #111111 | "당신의 프로덕트를 세상에 알리세요. Vibeollio가 연결합니다." + 시작하기 버튼 |
| 7 | Footer | #0A0A0A | 미니멀 푸터 (로고 + 링크 + 소셜) |

### 서브 페이지

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/minimal/products` | `MinimalProducts` | 검색바 (Search 아이콘) + 카테고리 칩 필터, 프로젝트 리스트 |
| `/minimal/trending` | `MinimalTrending` | 순위 기반 프로젝트 리스트 |
| `/minimal/new` | `MinimalNew` | 날짜순 프로젝트 |
| `/minimal/feedback` | `MinimalFeedback` | 피드백 중심 프로젝트 |

### 애니메이션

- `useScrollFadeIn()` — IntersectionObserver 기반 가시성 추적
- `AnimateIn` — 래퍼 컴포넌트, `delay` prop으로 캐스케이드 페이드/슬라이드

---

## 주요 공유 페이지

### 프로젝트 탐색 — `/projects`

![Projects Page](../screenshots/page-projects.png)

**파일:** `src/app/(public)/projects/page.tsx`

| 구성 요소 | 설명 |
|-----------|------|
| 페이지 헤더 | "탐색" 라벨 + "프로젝트 탐색" h2 + 설명 텍스트 |
| 뷰 모드 스위처 | 리스트 / 그리드 / 매거진 / 핀보드 / 테이블 (5가지) |
| 검색 바 | 텍스트 검색 + 정렬 드롭다운 (트렌딩/최신순/최근 업데이트/댓글 많은 순) |
| 사이드바 필터 | **정렬**: 최신 공개, 최근 업데이트, 댓글 많은 순 |
| | **피드백**: 피드백 요청, 런치, 업데이트 |
| | **카테고리**: 생산성, 크리에이터 도구, 헬스케어, 개발 도구, 교육 (복수선택) |
| | **태그**: 오픈소스, 가입 없이 체험, 1인 메이커 |
| | 전체 초기화 링크 |
| 프로젝트 리스트 | 순위 번호 + 로고 이미지 + 제목/카테고리/플랫폼/상태 뱃지 + 태그라인 + 댓글/저장 수 + 날짜 + Try 버튼 |
| 페이지네이션 | "총 N개 · 정렬기준" + "X / Y 페이지" |

### 프로젝트 상세 — `/p/[slug]`

![Detail Page](../screenshots/page-detail.png)

**파일:** `src/app/(public)/p/[slug]/page.tsx`

| 구성 요소 | 설명 |
|-----------|------|
| **프로젝트 헤더** | 로고 + 제목 (h1) + 상태 뱃지 + GitHub 확인 + 태그라인 + 플랫폼/가입/가격 태그 + 해시태그 링크 |
| **미디어 갤러리** | 대표 이미지 + 스크린샷 썸네일 (최대 3개) |
| **상세 설명** | 4개 블록: 무엇인지 / 어떤 문제를 푸는지 / 누구를 위한 것인지 / 왜 만들었는지 |
| **활동 피드** | "런치 이후의 변화", 시간순 활동 (업데이트/런치), 미디어 첨부, 신고 폼 |
| **댓글 영역** | "댓글과 피드백", 로그인 유도 배너, 댓글 리스트 (작성자/날짜/내용/신고 버튼) |
| **사이드바** | Visit Site 버튼, 저장 버튼, Makers (이름/날짜), Topics (해시태그), Info (카테고리/플랫폼/가격/가입), Featured 날짜, Links (GitHub/Demo/Docs), AI Tools, 신고 폼 |
| **추천 섹션** | "비슷한 프로젝트" 3열 카드 (커버 이미지 + 카테고리 + 제목 + 태그라인 + 메이커 + 메트릭 + Try/상세보기/로그인) |

### 프로젝트 등록 — `/submit`

![Submit Page](../screenshots/page-submit.png)

**파일:** `src/app/(public)/submit/page.tsx`

| 구성 요소 | 설명 |
|-----------|------|
| **안내 헤더** | "Launch only" 뱃지 + "새 프로젝트 런치" h1 + 안내 텍스트 |
| **사이드 가이드** | 이 화면에서 하는 일 (3개 항목) + 기존 프로젝트 안내 + 로그인 링크 |
| **섹션 1: 기본 정보** | 프로젝트 이름, 메이커 별칭, 한 줄 소개, 짧은 설명 |
| **섹션 2: 링크** | Live URL, 카테고리 (5개 옵션), 플랫폼 (3개), 상태 (3개), 가격 모델 (4개) |
| **섹션 3: 설명** | 무엇인지, 어떤 문제를 푸는지, 누구를 위한 것인지 (textarea) |
| **섹션 4: 소유권** | 소유권 이메일 (claim 링크 발송용) |
| **선택 입력** | 접을 수 있는 추가 입력 영역 |
| **제출 버튼** | "런치 제출" + 운영 정책 보기 링크 |

---

## 버전별 비교 요약

| 항목 | 1. 기본 (Classic) | 2. 기능중심 (Feature) | 3. 다크 미니멀 (Minimal) |
|------|-------------------|----------------------|-------------------------|
| **테마** | 라이트 / 뉴트럴 | 웜 오렌지 | 다크 |
| **액센트** | #111827 | #d76542 | White |
| **배경** | Default | #FFFDF8 | #0A0A0A |
| **헤더** | 기본 네비 (7개) | 탭 버튼 (5개) | 인라인 링크 (3개) |
| **카드** | rounded-28px, 상세 | 모던, 클린 | 리스트 행 |
| **애니메이션** | RotatingText | 스크롤 fade-in | 스크롤 fade-in + stagger |
| **최대 너비** | 기본 | 기본 | max-w-3xl 중앙 |
| **서브페이지** | 없음 | 4개 | 4개 |
| **푸터** | 기본 공유 | 커스텀 4열 | 미니멀 커스텀 |

---

## 공유 유틸리티 (`src/components/landing/shared.tsx`)

| 함수/컴포넌트 | 용도 |
|--------------|------|
| `formatRelativeFromString()` | ISO 날짜 → 한국어 상대 시간 |
| `getCategoryLabel()` | 카테고리 slug → 한글 라벨 |
| `getPlatformLabel()` | 플랫폼 slug → 한글 라벨 |
| `getStageLabel()` | 상태 slug → 한글 라벨 |
| `SectionBadge` | 섹션 뱃지 컴포넌트 |
| `TryButton` | 외부 링크 + 클릭 추적 |
| `DetailLink` | 상세 페이지 링크 |
| `CTASection` | 공유 CTA 블록 |

## 데이터 타입 (`src/components/landing/types.ts`)

```typescript
SerializedProjectCard {
  id, slug, title, tagline, shortDescription, liveUrl,
  makerAlias, category, platform, stage, status,
  verificationState, coverImageUrl, gallery,
  badges[], tags[], latestActivityType/Title/At,
  publishedAt, metrics { saves, comments, uniqueClicks, score },
  featured, featuredOrder, linkHealth
}

SerializedHomepageData {
  featured[], launches[], feedback[], updates[], tags[]
}
```
