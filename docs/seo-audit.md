# Viber SEO/GEO 전체 감사 보고서

> 감사일: 2026-04-03
> 감사 범위: 전체 페이지 (공개 라우트)

---

## 종합 점수: 32/100

| 항목 | 점수 | 상태 |
|------|------|------|
| 메타데이터 (title/description) | 15/25 | 루트만 있음, 페이지별 없음 |
| OpenGraph / Twitter Card | 0/15 | 완전 누락 |
| 구조화 데이터 (JSON-LD) | 5/15 | FAQ Microdata만 있음 |
| 사이트맵 & Robots | 7/10 | 기본 구현, changeFrequency/priority 누락 |
| Canonical & URL 구조 | 3/10 | Next.js 자동 생성만 의존 |
| 시맨틱 HTML & 접근성 | 5/10 | alt 태그 있으나 heading 계층 미흡 |
| 기술 SEO (next.config) | 0/10 | 완전 비어있음 |
| GEO 최적화 | 2/5 | FAQ만 일부 대응 |

---

## 페이지별 상세 감사

### 1. 홈페이지 `/` — 점수: 35/100

**현재 상태:**
- title: "Viber" (루트 default)
- description: "바이브코딩으로 만든 프로젝트를 발견하고, 피드백하고, 함께 성장하는 커뮤니티"
- OpenGraph: title + description만 (이미지 없음)
- 구조화 데이터: FAQ Microdata (geo-faq-section.tsx) ✅
- generateMetadata: ❌ 없음 (루트 메타 그대로 사용)

**문제점:**
1. ❌ title이 "Viber"만으로는 검색 의도 매칭 불가 → "Viber - 바이브 코딩 프로젝트 쇼케이스 커뮤니티"
2. ❌ OG 이미지 없음 → SNS 공유 시 썸네일 없음
3. ❌ Twitter Card 없음
4. ❌ Organization JSON-LD 없음
5. ❌ WebSite JSON-LD (SearchAction 포함) 없음
6. ⚠️ FAQ Microdata는 있으나 JSON-LD 형식이 권장됨

### 2. 탐색 페이지 `/projects` — 점수: 15/100

**현재 상태:**
- title: "Viber" (루트 default, 페이지 고유 title 없음)
- description: 루트 description 그대로
- generateMetadata: ❌ 없음
- 구조화 데이터: ❌ 없음

**문제점:**
1. ❌ 고유 title 없음 → "프로젝트 탐색 | Viber" 필요
2. ❌ 고유 description 없음
3. ❌ ItemList JSON-LD 없음 (프로젝트 목록 구조화)
4. ❌ 필터 상태에 따른 canonical URL 미설정 → 중복 콘텐츠 위험
5. ❌ 페이지네이션 시 prev/next 관계 없음

### 3. 프로젝트 상세 `/p/[slug]` — 점수: 10/100 (가장 심각)

**현재 상태:**
- title: "Viber" (루트 default)
- description: 루트 description 그대로
- generateMetadata: ❌ 완전 누락
- 구조화 데이터: ❌ 없음
- OG 이미지: ❌ 없음 (coverImageUrl 활용 가능한데 미사용)

**문제점:**
1. ❌ **generateMetadata 완전 누락** — 가장 중요한 SEO 페이지인데 모든 프로젝트가 동일한 메타 정보
2. ❌ title이 프로젝트명이 아님 → `{project.title} | Viber` 필요
3. ❌ description이 프로젝트 tagline이 아님
4. ❌ OG 이미지로 coverImageUrl 사용 안 함
5. ❌ SoftwareApplication / Product JSON-LD 없음
6. ❌ BreadcrumbList JSON-LD 없음
7. ❌ canonical URL 미설정
8. ❌ 프로젝트별 keywords 없음

### 4. 태그 페이지 `/tags/[slug]` — 점수: 10/100

**현재 상태:**
- title: "Viber" (루트 default)
- description: 루트 description 그대로
- generateMetadata: ❌ 없음
- 구조화 데이터: ❌ 없음

**문제점:**
1. ❌ 고유 title 없음 → `#{tagName} 프로젝트 | Viber` 필요
2. ❌ 고유 description 없음
3. ❌ CollectionPage JSON-LD 없음

### 5. 등록 페이지 `/submit` — 점수: 20/100

**현재 상태:**
- title: "Viber" (루트 default)
- generateMetadata: ❌ 없음

**문제점:**
1. ❌ 고유 title 없음 → "프로젝트 등록 | Viber" 필요
2. ❌ 고유 description 없음
3. ⚠️ noindex 고려 필요 (폼 페이지)

### 6. 정책 페이지 `/policy/*` — 점수: 20/100

**문제점:**
1. ❌ 고유 title 없음
2. ❌ 고유 description 없음

### 7. 랜딩 배리언트 `/feature`, `/minimal` — 점수: 10/100

**문제점:**
1. ❌ 홈과 중복 콘텐츠 — canonical URL로 `/` 지정 필요
2. ❌ 검색엔진이 여러 홈 버전을 별개 페이지로 인식할 위험

---

## 기술 SEO 문제

### next.config.ts (완전 비어있음)
```typescript
// 현재 상태: 빈 설정
const nextConfig: NextConfig = {};
```

**필요한 설정:**
1. Security headers (X-Content-Type-Options, X-Frame-Options 등)
2. 이미지 최적화 설정 (remotePatterns for Supabase)
3. 리다이렉트 규칙

### sitemap.ts
- ⚠️ `changeFrequency` 미설정 (daily/weekly/monthly)
- ⚠️ `priority` 미설정 (0.0~1.0)
- ⚠️ 태그 페이지 미포함 (`/tags/[slug]`)
- ✅ 동적 프로젝트 URL 포함됨

### robots.ts
- ✅ 기본 구성 양호
- ⚠️ admin, member, api 경로 Disallow 미설정

---

## 누락 요소 요약

### 즉시 수정 필요 (Critical)
| # | 항목 | 영향도 |
|---|------|--------|
| 1 | `/p/[slug]` generateMetadata 추가 | 프로젝트 페이지가 검색에 안 잡힘 |
| 2 | 전체 페이지 고유 title/description | 모든 페이지가 동일 메타 |
| 3 | OpenGraph 이미지 (최소 기본 OG 이미지) | SNS 공유 시 미리보기 없음 |
| 4 | Twitter Card 메타데이터 | X(Twitter) 공유 시 카드 없음 |

### 높은 우선순위 (High)
| # | 항목 | 영향도 |
|---|------|--------|
| 5 | SoftwareApplication JSON-LD (프로젝트 상세) | 리치 스니펫 미노출 |
| 6 | WebSite JSON-LD + SearchAction (홈) | 사이트링크 검색 미노출 |
| 7 | BreadcrumbList JSON-LD | 검색 결과 경로 미표시 |
| 8 | 랜딩 배리언트 canonical URL 설정 | 중복 콘텐츠 |
| 9 | sitemap changeFrequency/priority 추가 | 크롤링 우선순위 |
| 10 | robots.ts에 admin/api Disallow 추가 | 불필요한 크롤링 방지 |

### 보통 우선순위 (Medium)
| # | 항목 | 영향도 |
|---|------|--------|
| 11 | manifest.ts (PWA 메타데이터) | 앱 설치 경험 |
| 12 | Organization JSON-LD | 브랜드 인지도 |
| 13 | FAQ JSON-LD (현재 Microdata → JSON-LD 전환) | GEO 최적화 |
| 14 | 태그 페이지 sitemap 포함 | 태그 크롤링 |
| 15 | next.config.ts 보안 헤더 | 기술 SEO |

---

## GEO (Generative Engine Optimization) 감사

### 현재 GEO 대응 상태: 20/100

**양호:**
- ✅ FAQ 섹션 존재 (Microdata 적용)
- ✅ 질문-답변 형식의 콘텐츠
- ✅ 동적 FAQ (프로젝트 수, 인기 태그 반영)

**부족:**
1. ❌ FAQ를 JSON-LD로 전환 필요 (Google 권장)
2. ❌ "바이브 코딩이란?" 등 핵심 질문에 대한 구조화된 답변이 FAQ에만 존재 — 메인 콘텐츠에도 필요
3. ❌ HowTo 스키마 없음 (프로젝트 등록 과정)
4. ❌ 각 프로젝트 상세 페이지에 구조화된 메타 정보 없음 → AI 검색엔진이 프로젝트 정보를 파싱 불가
5. ❌ About/Organization 정보 없음 → E-E-A-T 신호 부족

---

## 키워드 파일 참조

상세 키워드 리서치는 `docs/seo-keywords.md` 참조
