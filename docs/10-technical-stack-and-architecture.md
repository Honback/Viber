# 권장 기술스택과 시스템 구조

## 1. 문서 목적

이 문서는 기존 제품 문서를 실제 구현 가능한 기술 구조로 연결하기 위한 기준서다.

- 제품 방향 문서를 기술스택 선택으로 번역한다.
- 현재 정적 MVP에서 운영 가능한 구조로 확장하는 기준을 제시한다.
- 초기 목표 사용자 규모인 약 1천~1만 사용자 구간에서 과하지 않은 구조를 정한다.

현재 저장 방식은 브라우저 `localStorage` 기반 데모지만, 본 문서는 실제 운영 전환 시의 기준을 다룬다.

## 2. 전제와 규모 가정

이 문서는 아래 조건을 가정한다.

- 총 사용자 또는 월간 활성 사용자 기준 약 1천~1만명
- 실시간 채팅 수준의 고빈도 쓰기 트래픽은 없음
- 공개 탐색 트래픽이 로그인 사용자 트래픽보다 큼
- 이미지와 대표 미디어는 존재하지만 대용량 동영상 서비스는 아님
- 운영자 수는 소수이며 관리자 도구는 내부용이다

이 범위에서는 마이크로서비스보다 모듈러 모놀리식 구조가 적합하다.

## 3. 아키텍처 원칙

### 3-1. 단일 앱 우선

- 공개 화면, 회원 화면, 관리자 화면을 하나의 웹앱 안에서 운영한다.
- API도 같은 코드베이스 안에서 관리한다.
- 백오피스를 별도 서비스로 분리하지 않는다.

### 3-2. 쓰기 경로는 서버 통과

- 댓글, 저장, 신고, 등록, 검수 같은 쓰기 작업은 브라우저가 직접 DB를 건드리지 않는다.
- 모든 쓰기 작업은 서버 API 또는 서버 액션을 통해 검증 후 처리한다.

### 3-3. DB 중심 설계

- 핵심 비즈니스 상태는 Postgres를 기준으로 둔다.
- 외부 분석 도구는 보조 지표로만 사용한다.
- 랭킹에 필요한 클릭, 저장, 댓글 신호는 서비스 DB 안에서 관리한다.

### 3-4. 공개 페이지는 캐시 우선

- 홈, 탐색, 태그, 상세 같은 공개 페이지는 서버 렌더링과 캐시를 적극 활용한다.
- 실시간성이 꼭 필요하지 않은 데이터는 재검증 기반으로 제공한다.

## 4. 권장 기술스택

### 4-1. 웹앱

- `Next.js App Router`
- `TypeScript`
- 서버 컴포넌트 기본, 클라이언트 컴포넌트는 상호작용이 필요한 곳에만 사용

권장 이유:

- 공개 SEO 페이지와 내부 관리 화면을 함께 다루기 좋다.
- 라우팅, 메타데이터, sitemap, robots, Open Graph 구성을 한 앱 안에서 처리하기 쉽다.

### 4-2. UI

- `Tailwind CSS`
- `CSS variables`
- `Radix Primitives` for dialog, dropdown, tabs, sheet

권장 이유:

- 빠른 화면 개발이 가능하다.
- 디자인 시스템 문서에 맞는 커스텀 카드 중심 UI를 직접 만들기 좋다.
- 접근성 기초가 필요한 복합 컴포넌트만 primitives로 가져가고, 시각 디자인은 커스텀 유지가 가능하다.

### 4-3. API 계층

- `Next.js Route Handlers`
- `Zod` 입력 검증

권장 이유:

- 문서에 이미 `/api/...` 구조가 정의되어 있다.
- 공개 조회 API, 작성 API, 관리자 API를 같은 앱 안에서 관리하기 좋다.

### 4-4. 데이터베이스

- `Supabase Postgres`
- `Drizzle ORM + drizzle-kit`

권장 이유:

- 현재 서비스는 프로젝트, 활동, 댓글, 저장, 신고, 검수 로그 같은 전형적인 관계형 구조다.
- 검색과 랭킹, 운영 로그, 상태 전이에 Postgres가 잘 맞는다.
- Drizzle은 SQL과 가깝고 인덱스, 확장, 정책을 다루기 좋다.

### 4-5. 인증과 소유권

- `Supabase Auth`
- 이메일 매직링크
- GitHub OAuth

권장 이유:

- 문서가 요구하는 비회원 제출 후 소유권 연결, 가벼운 회원 계정, 관리자 권한과 잘 맞는다.
- 인증 자체는 관리형으로 두고, 프로젝트 소유권은 `project_owners` 테이블에서 별도로 관리할 수 있다.

### 4-6. 파일 저장

- `Supabase Storage`

저장 대상:

- 프로젝트 대표 이미지
- 갤러리 이미지
- 활동 업데이트용 미디어

현재 구현 원칙:

- 버킷은 `project-media` 공개 버킷을 기본으로 사용한다.
- 업로드는 브라우저 직업로드가 아니라 서버를 통과한 member 요청에서만 처리한다.
- 비회원은 이미지 URL 입력은 가능하지만 파일 업로드는 허용하지 않는다.

### 4-7. 검색과 랭킹

- `Postgres Full Text Search`
- `pg_trgm`
- 배치 또는 캐시 기반 랭킹 계산

원칙:

- 초기에 별도 검색엔진은 두지 않는다.
- 검색은 DB 안에서 시작하고, 사용자 규모와 검색 부하가 실제로 커질 때만 외부 검색엔진을 검토한다.

### 4-8. 안티스팸과 운영 보호

- `Cloudflare Turnstile`
- `Upstash Rate Limit`

보호 대상:

- 등록
- 댓글
- 신고
- 로그인
- 관리자 API

### 4-9. 메일

- `Resend`

발송 대상:

- claim 링크
- 운영 상태 변경 안내
- 새 댓글 알림
- 운영 알림

운영 메모:

- 로컬에서는 `MAIL_DELIVERY_MODE=simulate` 로 실제 발송 대신 메일 로그를 저장한다.
- 운영에서는 `MAIL_DELIVERY_MODE=live` 와 `RESEND_API_KEY`, `MAIL_FROM` 을 함께 사용한다.

### 4-10. 배치 작업

- `Vercel Cron`

초기 작업:

- 링크 헬스체크
- 랭킹 갱신
- 아카이브 후보 탐지
- 알림 메일 발송

### 4-11. 테스트

- `Vitest`
- `Playwright`

목적:

- 도메인 로직 단위 테스트
- 제출, 저장, 댓글, owner 연결, 운영 제한 흐름 E2E 테스트

## 5. 앱 라우트 구조

```txt
/
/projects
/p/[slug]
/submit
/claim/[token]
/tags/[slug]
/policy/content
/policy/privacy
/me/saved
/me/projects
/admin/moderation
/admin/projects
/admin/feature
/admin/jobs
/admin/mail
```

권장 Route Group 구조:

```txt
app/
  (public)/
  (member)/
  (admin)/
  api/
```

이 구조를 쓰면 공개 페이지와 관리자 페이지의 레이아웃과 권한 처리를 나누기 쉽다.

## 6. 권장 코드 구조

```txt
app/
  (public)/
  (member)/
  (admin)/
  api/
  sitemap.ts
  robots.ts
  opengraph-image.tsx

src/
  auth/
  db/
    schema/
    migrations/
  services/
  validations/
  search/
  storage/
  rate-limit/
  jobs/
  lib/
  components/
  features/

emails/
tests/
  unit/
  e2e/
```

권장 모듈 분리:

- `projects`
- `activities`
- `comments`
- `saves`
- `reports`
- `moderation`
- `ownership`
- `search`
- `ranking`

## 7. 데이터 구조와 책임 분리

핵심 테이블은 아래를 기준으로 한다.

- `users`
- `project_owners`
- `projects`
- `project_posts`
- `comments`
- `project_saves`
- `project_click_events`
- `tags`
- `project_tags`
- `reports`
- `moderation_actions`

권장 추가 테이블:

- `profiles`
- `link_health_checks`
- `project_rank_snapshots`

설계 원칙:

- `projects`는 공개의 최상위 단위다.
- `project_posts`는 Launch, Update, Feedback 활동 이력이다.
- `project_owners`는 비회원 제출과 소유권 연결을 위한 핵심 테이블이다.
- `moderation_actions`는 모든 운영 조치의 감사 로그다.

## 8. 권한 구조

### 공개 사용자

- published 프로젝트와 활동 조회
- 태그 탐색
- 정책 문서 조회
- CAPTCHA 통과 시 댓글 작성
- 신고는 허용 가능하되 rate limit과 CAPTCHA 적용

### 인증 사용자

- 저장
- 댓글
- feedback 활동 작성
- 신고
- 내 저장 목록 조회

### 프로젝트 소유자

- 본인 프로젝트 수정
- Update 등록
- owner용 Ask for Feedback 등록
- 프로젝트별 공개 상태 조회

### 관리자

- 신고/운영 큐 조회
- 상태 변경
- 피처드 편성
- 링크 상태 및 중복 후보 확인

권한 검사는 서버에서 1차로 처리하고, DB 정책은 2차 보호막으로 둔다.

## 9. 핵심 데이터 흐름

### 9-1. 공개 탐색

1. 홈 또는 탐색 페이지 요청
2. 서버에서 published 프로젝트 목록 조회
3. 캐시 가능한 응답 렌더링
4. Try 클릭 시 outbound click 이벤트 저장

### 9-2. 프로젝트 등록

1. 사용자가 `/submit`에서 폼 입력
2. 서버에서 입력 검증, URL 정규화, 정규화 URL 중복 차단
3. 성공 시 `pending` 프로젝트, 초기 `launch`, provisional owner 생성
4. email 또는 GitHub 기반 소유권 연결 진행
5. owner 확인 완료 시 프로젝트와 초기 활동 즉시 publish
6. 7일 내 claim되지 않으면 정리 배치 대상

### 9-3. 저장/댓글/신고

1. 저장과 feedback 활동은 인증 사용자 세션 확인
2. visitor 댓글과 visitor 신고는 guest alias 또는 fingerprint 수집
3. rate limit과 CAPTCHA 검사
4. 입력 검증
5. DB 기록
6. 필요 시 알림 또는 운영 큐 적재

### 9-4. 관리자 운영 처리

1. 신고/운영 큐 조회
2. 신고 또는 운영 이슈 확인
3. limit/hide/archive/feature 액션 실행
4. 대상 상태 변경
5. `moderation_actions` 기록

### 9-5. 운영 배치

1. 크론 실행
2. claim 만료 pending 프로젝트 정리
3. live URL 상태 확인
4. broken link 후보 기록
5. 랭킹 스냅샷 갱신
6. 오래된 프로젝트 아카이브 후보 추출

## 10. 1천~1만 사용자 구간 운영 기준

이 규모에서는 제안한 구조로 충분하다.

단, 아래는 초반부터 꼭 갖춰야 한다.

- `projects.slug` unique index
- 정규화된 URL 중복 감지
- 검색 인덱스
- 랭킹 계산 캐시 또는 배치화
- 공개 페이지 캐시 전략
- 이미지 CDN 활용
- 신고/등록 rate limit
- 운영 액션 로그 저장

이 단계에서 굳이 넣지 않아도 되는 것:

- 마이크로서비스
- GraphQL
- 외부 검색엔진
- 이벤트 스트리밍 플랫폼
- 복잡한 실시간 아키텍처

## 11. 구현 우선순위

### 1단계

- Next.js 앱 구조 생성
- Drizzle 스키마 작성
- 공개 홈/탐색/상세 화면 구현

### 2단계

- Auth
- 저장
- 댓글
- 신고

### 3단계

- submit wizard
- claim flow
- 소유권 연결
- 운영 큐

### 4단계

- 검색
- 랭킹
- 링크 헬스체크
- 피처드 편성

### 5단계

- E2E 테스트 강화
- 운영 지표 수집
- 캐시/배치 최적화

## 12. 최종 권장안

현재 문서 세트 기준으로 가장 현실적인 조합은 아래다.

- 앱과 API는 `Next.js` 한 개로 운영
- 데이터와 권한은 `Supabase Postgres + Auth + Storage`
- ORM은 `Drizzle`
- 봇 방어는 `Turnstile + Rate Limit`
- 배치는 `Vercel Cron`
- 메일은 `Resend`
- 로컬 검증은 `simulate` 메일 로그와 `/admin/mail` 로 닫고, live 전환은 도메인 준비 후 진행한다.

이 조합이면 현재 문서가 요구하는 제품 구조, 운영성, 검색, 소유권, 관리자 도구를 과도한 복잡도 없이 소화할 수 있다.
