# Vibeollio SEO/GEO 최적화 가이드 (2026)

> 작성일: 2026-04-06
> 대상: vibehub.co.kr
> 참고: docs/seo-keywords.md (키워드 리서치), docs/seo-audit.md (이전 감사)

---

## 목차

1. [현재 SEO 구현 현황](#1-현재-seo-구현-현황)
2. [SEO 추가 최적화 항목](#2-seo-추가-최적화-항목)
3. [GEO (Generative Engine Optimization)](#3-geo-generative-engine-optimization)
4. [Core Web Vitals 최적화](#4-core-web-vitals-최적화)
5. [기술 SEO](#5-기술-seo)
6. [구조화 데이터 (JSON-LD) 추가](#6-구조화-데이터-json-ld-추가)
7. [한국 시장 특화 SEO](#7-한국-시장-특화-seo)
8. [배포 후 SEO 작업](#8-배포-후-seo-작업)
9. [구현 우선순위](#9-구현-우선순위)

---

## 1. 현재 SEO 구현 현황

### 완료된 항목 (04/03 작업)

| 항목 | 상태 | 점수 |
|------|------|------|
| 페이지별 title/description | 전체 공개 페이지 완료 | 25/25 |
| OpenGraph 메타 | title/description 완료, **이미지 미완** | 8/15 |
| Twitter Card | 전체 페이지 완료, **이미지 미완** | 8/15 |
| JSON-LD 구조화 데이터 | WebSite, Organization, SoftwareApplication, Breadcrumb | 10/15 |
| Sitemap | priority, changeFrequency, 태그 페이지 포함 | 10/10 |
| Robots.txt | admin/api/auth disallow | 10/10 |
| Canonical URL | 전체 페이지 설정, 배리언트 중복 방지 | 10/10 |
| 키워드 최적화 | 루트 + 페이지별 keywords | 8/10 |
| FAQ 구조화 | Microdata 방식 (JSON-LD 전환 필요) | 3/5 |

### 현재 점수: **92/115 → 약 72/100**

### 미완료 항목

| 항목 | 영향도 | 설명 |
|------|--------|------|
| OG 이미지 | HIGH | SNS 공유 미리보기 없음 |
| FAQ JSON-LD 전환 | MEDIUM | Microdata → JSON-LD (Google 권장) |
| ItemList JSON-LD | MEDIUM | /projects 목록 구조화 |
| HowTo JSON-LD | LOW | /submit 등록 과정 |
| Speakable JSON-LD | LOW | GEO 음성 답변 대상 |
| next.config.ts 헤더 | HIGH | 보안 + 성능 |

---

## 2. SEO 추가 최적화 항목

### 2.1 OG 이미지 (HIGH 우선)

**왜 중요한가:**
- 카카오톡, X(Twitter), 슬랙 등에서 링크 공유 시 미리보기 카드의 핵심
- OG 이미지가 있는 공유 링크는 CTR이 2~3배 높음

**구현 방법:**
```
A. 정적 기본 OG 이미지
   - src/app/opengraph-image.png (1200x630px)
   - Vibeollio 로고 + "바이브 코딩 프로젝트 쇼케이스" 텍스트

B. 프로젝트 상세 동적 OG (선택)
   - src/app/(public)/p/[slug]/opengraph-image.tsx
   - 프로젝트 coverImageUrl 위에 타이틀 오버레이
   - next/og의 ImageResponse 사용
```

### 2.2 next.config.ts 보안/성능 헤더

```typescript
// 필요한 헤더 목록
headers: [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "0" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
]
```

### 2.3 이미지 최적화 (`<img>` → `next/image`)

**현재 문제:**
- 10개의 `<img>` 태그가 직접 사용됨
- WebP/AVIF 자동 변환 없음
- responsive sizes 없음
- CLS 방지용 width/height 자동 설정 없음

**영향:** LCP 성능 직접 저하, Core Web Vitals 감점

**필요 작업:**
1. `next.config.ts`에 Supabase 이미지 도메인 remotePatterns 추가
2. `<img>` → `<Image>` 전환 (next/image)
3. 커버 이미지에 `priority` 속성 추가 (LCP 대상)

### 2.4 manifest.ts

```typescript
// src/app/manifest.ts
export default function manifest() {
  return {
    name: "Vibeollio - 바이브 코딩 프로젝트 쇼케이스",
    short_name: "Vibeollio",
    description: "바이브 코딩 프로젝트를 발견하고 피드백하는 커뮤니티",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "ko",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

---

## 3. GEO (Generative Engine Optimization)

### 3.1 GEO란?

GEO는 AI 검색엔진(Google AI Overview, Perplexity, ChatGPT Search, Gemini)에서
**답변의 소스/인용으로 선택되기 위한 최적화**입니다.

기존 SEO가 "검색 결과 순위"를 목표로 한다면,
GEO는 "AI가 답변할 때 우리 사이트를 인용하게 만드는 것"이 목표입니다.

### 3.2 왜 중요한가? (2026 현황)

- AI 검색 트래픽이 전년 대비 **527% 증가** (2025 상반기 기준)
- Gartner 예측: 기존 검색 볼륨 **25% 감소**
- Google AI Overview가 검색 결과 상단에 노출되며 클릭이 AI 답변으로 이동
- Perplexity, ChatGPT Search가 B2B/기술 분야에서 빠르게 성장

### 3.3 Vibeollio에 적용해야 할 GEO 전략

#### A. 질문형 콘텐츠 구조 (Question-Based Headers)

**원리:** AI 시스템은 헤더를 쿼리와 패턴 매칭. "What is GEO?" 형식이 "GEO Overview"보다 인용률 높음

**적용:**
- 홈페이지 FAQ 섹션 (이미 있음 ✅)
- 각 프로젝트 상세 페이지의 섹션 헤더를 질문형으로 구성
  - 현재: "무엇인지" → 권장: "이 프로젝트는 무엇인가요?"
  - 현재: "어떤 문제를 푸는지" → 권장: "어떤 문제를 해결하나요?"

#### B. 첫 200단어 최적화 (Direct Answer Pattern)

**원리:** AI는 페이지의 첫 200단어를 가장 높은 가중치로 평가

**적용:**
- 홈페이지: 첫 섹션에 "Vibeollio는 바이브 코딩으로 만든 프로젝트를 공유하는 쇼케이스 플랫폼입니다" 명확한 정의
- 프로젝트 상세: tagline + overview를 페이지 상단에 명확히 노출 (이미 있음 ✅)

#### C. 구체적이고 인용 가능한 데이터

**원리:** "GEO 구현으로 AI 인용률이 4%에서 14%로 증가" 같은 구체 수치가 인용됨

**적용:**
- FAQ에 동적 수치 포함 (이미 있음 ✅ - "현재 N개 프로젝트 등록")
- 프로젝트 상세에 구체적 메트릭 (저장 수, 피드백 수) 노출 (이미 있음 ✅)

#### D. Entity Authority (엔티티 권위)

**원리:** AI가 "이 주제에 대해 이 사이트가 권위있는 소스인가?"를 판단

**적용:**
- Organization JSON-LD 강화 (이미 있음 ✅)
- 홈페이지에 "바이브 코딩이란?" 명확한 정의 섹션 (FAQ에 있음 ✅)
- About 페이지 추가 고려 (Organization 스키마 + 운영자 정보)

#### E. FAQ JSON-LD (현재 Microdata → 전환 필요)

**원리:** CMU GEO 연구에서 FAQPage JSON-LD가 AI 인용률 상위 5위 상관관계

**현재:** `geo-faq-section.tsx`에 Microdata `itemScope/itemType` 방식
**필요:** JSON-LD `<script type="application/ld+json">` 방식으로 전환

**이유:**
- Google이 JSON-LD를 공식 권장 (Microdata보다 파싱 용이)
- AI 검색엔진들이 JSON-LD를 더 쉽게 인식
- 페이지 3~6개의 Q&A 쌍이 최적

#### F. Speakable JSON-LD (음성 AI 답변)

**원리:** Google이 AI 음성 답변 시 인용할 텍스트 영역 지정

**적용:**
```json
{
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".faq-answer", ".project-tagline"]
  }
}
```

#### G. 콘텐츠 최신성 (Recency Signal)

**원리:** AI 엔진은 최신 콘텐츠에 가중치. "Last updated" 타임스탬프 중요

**적용:**
- 프로젝트 상세에 "마지막 활동" 날짜 (이미 있음 ✅)
- sitemap lastModified가 실제 활동 날짜 반영 (이미 있음 ✅)

---

## 4. Core Web Vitals 최적화

### 2026 기준 목표치

| 지표 | Good | 현재 위험 요소 |
|------|------|---------------|
| **LCP** (Largest Contentful Paint) | < 2.5초 | `<img>` 직접 사용, 이미지 최적화 없음 |
| **CLS** (Cumulative Layout Shift) | < 0.1 | `<img>`에 width/height 미보장, 폰트 로딩 |
| **INP** (Interaction to Next Paint) | < 200ms | 큰 이슈 없어 보임 |

### 최적화 방법

#### LCP 개선
1. **커버 이미지에 `priority` 속성** — LCP 대상 이미지를 preload
2. **`next/image` 사용** — 자동 WebP/AVIF, responsive sizes
3. **폰트 preload** — `next/font` 사용 여부 확인, display: swap 적용
4. **Critical CSS** — Tailwind CSS purge가 자동 처리

#### CLS 개선
1. **이미지에 명시적 width/height** — `next/image`가 자동 처리
2. **폰트 display: swap** — FOIT 방지
3. **동적 콘텐츠 영역에 skeleton/placeholder** — 레이아웃 시프트 방지

#### INP 개선
1. **이벤트 핸들러 최적화** — 무거운 연산 debounce
2. **React.lazy + Suspense** — 코드 분할 (일부 이미 사용 중 ✅)

---

## 5. 기술 SEO

### 5.1 next.config.ts 필수 설정

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",  // Supabase Storage
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
```

### 5.2 URL 구조 최적화

**현재 URL 구조:**
```
/ (홈)
/projects (탐색)
/p/{slug} (프로젝트 상세)
/tags/{slug} (태그)
/submit (등록)
```

**평가:** 짧고 의미 있는 URL 구조 ✅ — 추가 작업 불필요

### 5.3 내부 링크 구조

**양호:**
- 프로젝트 카드 → 상세 페이지 링크 ✅
- 태그 → 태그 페이지 링크 ✅
- 관련 프로젝트 섹션 ✅
- FAQ → /projects 링크 ✅
- Breadcrumb JSON-LD ✅

**개선 가능:**
- 프로젝트 상세에서 같은 카테고리 프로젝트로의 링크 추가
- footer에 주요 태그 페이지 링크 추가 (사이트맵 역할)

---

## 6. 구조화 데이터 (JSON-LD) 추가 항목

### 현재 구현

| 스키마 | 페이지 | 상태 |
|--------|--------|------|
| WebSite + SearchAction | `/` | ✅ 완료 |
| Organization | `/` | ✅ 완료 |
| SoftwareApplication | `/p/[slug]` | ✅ 완료 |
| BreadcrumbList | `/p/[slug]` | ✅ 완료 |
| FAQPage | `/` (랜딩) | ⚠️ Microdata (JSON-LD 전환 필요) |

### 추가 필요

| 스키마 | 페이지 | 우선도 | 설명 |
|--------|--------|--------|------|
| FAQPage (JSON-LD) | `/` | HIGH | 현재 Microdata → JSON-LD 전환 |
| ItemList | `/projects` | MEDIUM | 프로젝트 목록을 구조화하여 리치 스니펫 |
| CollectionPage | `/tags/[slug]` | LOW | 태그별 컬렉션 구조화 |
| HowTo | `/submit` | LOW | 프로젝트 등록 과정 단계별 구조화 |
| Speakable | `/` | LOW | GEO 음성 답변 인용 대상 지정 |

---

## 7. 한국 시장 특화 SEO

### 7.1 네이버 SEO

**필수 작업:**
- Naver Search Advisor 등록 (`searchadvisor.naver.com`)
- 사이트맵 제출
- RSS 피드 추가 고려 (네이버 블로그 검색 인식 강화)

**네이버 특이사항:**
- 네이버는 자체 크롤러(`Yeti`)를 사용
- robots.txt에서 Yeti를 별도로 허용하지 않아도 됨 (이미 `*` 허용)
- Open Graph 태그가 네이버 검색 미리보기에 직접 반영 → OG 이미지 중요

### 7.2 카카오 SEO

**필수 작업:**
- 카카오 공유 시 OG 이미지 필수 (1200x630px)
- `og:image` 태그가 없으면 카카오톡 링크 미리보기가 비어 보임

### 7.3 한국어 키워드 전략

**핵심 키워드** (docs/seo-keywords.md 참조):
- "바이브 코딩" / "바이브코딩" / "vibe coding" — 띄어쓰기 변형 모두 포함
- "AI 코딩 프로젝트" — 범용 검색어
- "바이브 코딩 커뮤니티" — 타겟 검색어

**title 태그 전략:**
- 홈: "Vibeollio - 바이브 코딩 프로젝트 쇼케이스 커뮤니티" ✅
- 핵심 키워드를 title 앞부분에 배치하는 것이 SEO에 유리

---

## 8. 배포 후 SEO 작업

### 8.1 즉시 (배포 당일)

1. **Google Search Console 등록**
   - 도메인 소유권 인증 (DNS TXT 레코드)
   - sitemap.xml 제출
   - URL 검사 도구로 주요 페이지 인덱싱 요청

2. **Naver Search Advisor 등록**
   - 사이트 소유 확인
   - 사이트맵 제출
   - 웹마스터 도구 설정

### 8.2 1주 이내

3. **Google Rich Results Test**
   - 각 페이지 유형의 JSON-LD 검증
   - SoftwareApplication, FAQPage, BreadcrumbList 정상 인식 확인

4. **PageSpeed Insights 테스트**
   - Core Web Vitals 측정
   - LCP, CLS, INP 기준치 확인
   - 모바일 / 데스크톱 각각 테스트

5. **소셜 미리보기 테스트**
   - Facebook Sharing Debugger (OG 태그 검증)
   - Twitter Card Validator
   - 카카오톡 링크 공유 테스트

### 8.3 2~4주 (GEO 효과 대기)

6. **AI 검색 모니터링**
   - Perplexity에서 "바이브 코딩 프로젝트" 검색하여 인용 여부 확인
   - Google AI Overview에서 관련 쿼리 답변 확인
   - 인용되지 않으면 콘텐츠 구조/FAQ 강화

7. **Search Console 데이터 분석**
   - 인덱싱 현황 확인
   - 검색 쿼리별 노출/클릭 분석
   - 구조화 데이터 오류 확인

### 8.4 지속적

8. **콘텐츠 업데이트**
   - FAQ 항목 추가 (사용자 질문 기반)
   - 프로젝트 수/태그 수 등 동적 수치 자동 반영 (이미 있음 ✅)
   - 블로그/가이드 콘텐츠 추가 고려 (GEO entity authority 강화)

---

## 9. 구현 우선순위

### Phase 1: 배포 전 필수 (CRITICAL)

| # | 항목 | 예상 작업 |
|---|------|-----------|
| 1 | 빌드 에러 수정 (theme-toggle) | 파일 삭제 또는 수정 |
| 2 | next.config.ts (이미지 + 헤더) | 설정 추가 |
| 3 | 기본 OG 이미지 | 정적 파일 생성 |

### Phase 2: 배포와 함께 (HIGH)

| # | 항목 | 예상 작업 |
|---|------|-----------|
| 4 | FAQ Microdata → JSON-LD 전환 | geo-faq-section.tsx 수정 |
| 5 | manifest.ts | 신규 파일 |
| 6 | `<img>` → `next/image` 전환 | 7개 파일 수정 |

### Phase 3: 배포 직후 (MEDIUM)

| # | 항목 | 예상 작업 |
|---|------|-----------|
| 7 | Google Search Console 등록 | 외부 작업 |
| 8 | Naver Search Advisor 등록 | 외부 작업 |
| 9 | ItemList JSON-LD (/projects) | page.tsx 수정 |
| 10 | 프로젝트 동적 OG 이미지 | opengraph-image.tsx |

### Phase 4: 점진적 개선 (LOW)

| # | 항목 |
|---|------|
| 11 | HowTo JSON-LD (/submit) |
| 12 | Speakable JSON-LD |
| 13 | CollectionPage JSON-LD (/tags) |
| 14 | GA4 / Vercel Analytics 연동 |
| 15 | 블로그/가이드 콘텐츠 (entity authority) |

---

## 참고 자료

- [GEO Optimization Checklist for Next.js (2026)](https://www.rankswift.pro/blog/geo-optimization-nextjs-saas-2026)
- [Structured Data: SEO and GEO Optimization for AI (2026)](https://www.digidop.com/blog/structured-data-secret-weapon-seo)
- [Next.js SEO Best Practices: Complete 2026 Guide](https://globalinkz.com/blog/next-js-seo-best-practices-complete-2026-guide.html)
- [How to Optimize for Google AI Overviews (2026)](https://gracker.ai/blog/optimize-for-google-ai-overviews-2026-guide)
- [Core Web Vitals 2026: INP, LCP & CLS Optimization](https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide)
- [Schema Markup: 8 Tactics to Boost AI Citations](https://wpriders.com/schema-markup-for-ai-search-types-that-get-you-cited/)
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld)
- [Vercel SEO Playbook](https://vercel.com/blog/nextjs-seo-playbook)
- [GEO: Mastering Generative Engine Optimization (Search Engine Land)](https://searchengineland.com/mastering-generative-engine-optimization-in-2026-full-guide-469142)
