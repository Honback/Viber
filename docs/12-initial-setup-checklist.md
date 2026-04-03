# 초기 세팅 체크리스트

## 1. 문서 목적

이 문서는 권장 기술스택 문서를 실제 프로젝트 초기 세팅 작업으로 옮기기 위한 체크리스트다.

- 저장소 초기화
- 환경변수와 외부 서비스 연결
- DB와 Auth 부트스트랩
- 테스트와 배포 기본선 정리

목표는 "개발 시작 전에 막히지 않게 만드는 것"이다.

## 2. 완료 기준

이 체크리스트가 끝나면 최소 아래가 가능해야 한다.

- 로컬에서 앱 실행
- DB 마이그레이션 적용
- 로그인 동작
- 공개 라우트 렌더링
- 최소 1개 API 호출
- 테스트와 배포 기본선 확인

## 3. 저장소와 기본 앱 생성

### 필수

- `Next.js App Router + TypeScript` 프로젝트 생성
- `src/` 디렉토리 사용 여부 결정
- ESLint, Prettier 또는 팀 포맷터 기준 확정
- Node 버전 고정
- `.nvmrc` 또는 `.node-version` 추가

### 권장

- `pnpm` 사용
- `app/`, `src/`, `tests/`, `emails/` 기본 구조 생성
- 절대 import alias 설정

## 4. 필수 패키지 설치

### 앱

- `next`
- `react`
- `react-dom`
- `typescript`

### DB

- `drizzle-orm`
- `drizzle-kit`
- `postgres` 또는 `@supabase/supabase-js`

### 검증과 유틸

- `zod`
- `date-fns` 또는 팀 선호 날짜 유틸
- `clsx`

### UI

- `tailwindcss`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-tabs`

### 테스트

- `vitest`
- `@testing-library/react`
- `playwright`

## 5. 외부 서비스 생성

### Supabase

- 프로젝트 생성
- Postgres 연결 문자열 확보
- Auth provider 설정
- Storage bucket 생성

### Auth

- 이메일 매직링크 활성화
- GitHub OAuth 앱 생성 후 provider 연결
- redirect URL 개발/운영 환경 분리

### Cloudflare Turnstile

- 사이트 생성
- site key / secret key 발급

### Upstash

- Redis 생성
- rate limit용 토큰 준비

### Resend

- 발신 도메인 또는 테스트 발신자 준비
- 필요 시 Supabase `Authentication -> Email -> SMTP Settings` 와 연결할 SMTP 값 준비

### 배포 환경

- Vercel 프로젝트 생성
- 환경변수 연결
- preview / production 환경 구분
- Vercel Cron 또는 동등한 스케줄러 준비

## 6. 환경변수 정리

초기 `.env` 기준 권장 키는 아래다.

```txt
DATABASE_URL=
NEXT_PUBLIC_APP_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

RESEND_API_KEY=
MAIL_FROM=
MAIL_FROM_NAME=VibeHub
```

추가 권장:

- `.env.example` 작성
- 개발/운영 env 분리
- 민감한 키는 절대 클라이언트 번들에 노출하지 않기

## 7. DB 부트스트랩

### 필수

- Drizzle config 작성
- 초기 migration 생성
- `profiles`, `projects`, `project_posts` 등 핵심 테이블 생성
- 확장 기능 `pgcrypto`, `pg_trgm` 적용

### 권장

- seed 스크립트 구조 준비
- 로컬 dev DB와 원격 DB 적용 순서 문서화
- migration 실행 명령 README에 기록

## 8. Auth와 권한 기본선

### 필수

- 로그인/로그아웃 기본 흐름 구현
- 세션 확인 유틸 작성
- member/admin role 분기 유틸 작성
- guest comment identity 생성 규칙 정의

### 권장

- owner 권한 체크 유틸 작성
- member feedback 작성 권한 체크 유틸 작성
- claim token 검증 유틸 작성
- 7일 미claim 제출 정리 job 명세
- 인증 필요 라우트 보호 방식 정리

## 9. Storage 기본선

### 필수

- `project-media` 버킷 생성
- 대표 이미지 업로드 규칙 정의
- 허용 MIME 타입 결정
- 최대 파일 크기 기준 결정

### 권장

- 경로 규칙 확정
  - `projects/{projectId}/cover/...`
  - `projects/{projectId}/gallery/...`
  - `projects/{projectId}/posts/{postId}/...`
- 이미지 최적화 전략 문서화

## 10. 앱 기본 뼈대

### 공개 라우트

- 홈
- 탐색
- 프로젝트 상세
- 등록
- 태그
- 정책 문서

### 회원 라우트

- 내 저장
- 내 프로젝트

### 관리자 라우트

- moderation
- projects
- feature

### 공통

- global layout
- metadata
- not-found
- error boundary

## 11. API 기본선

초기 라우트 우선순위:

- `GET /api/projects`
- `GET /api/projects/:slug`
- `POST /api/submissions/project`
- `POST /api/projects/:id/save`
- `POST /api/projects/:id/comments`
- `POST /api/reports`
- `GET /api/admin/moderation/queue`
- `POST /api/admin/moderation/action`

각 API에 공통으로 필요한 것:

- Zod validation
- 권한 체크
- rate limit
- guest 경로의 CAPTCHA 검사
- 에러 포맷 통일
- 감사 로그 또는 운영 로그 처리

## 12. 안티스팸과 운영 보호

초기에 빠지면 안 되는 항목:

- submit에 Turnstile
- comment에 Turnstile
- guest comment에 더 강한 rate limit
- report에 rate limit
- auth endpoint abuse 대응
- 관리자 API 접근 제한

운영 기준도 같이 적어둔다.

- dead link 처리 기준
- duplicate 처리 기준
- spam 신고 기준

## 13. 테스트 기본선

### 단위 테스트

- URL 정규화
- slug 생성
- 랭킹 계산 함수
- 권한 체크 유틸
- 입력 검증 스키마

### E2E 테스트

- 홈 렌더링
- 탐색/검색
- 프로젝트 상세
- 프로젝트 제출
- 저장
- 댓글
- visitor 댓글
- member feedback 활동 작성
- owner 연결 후 공개

## 14. 분석과 SEO

초기 세팅에서 같이 끝내는 것이 좋다.

- `sitemap`
- `robots`
- Open Graph metadata
- canonical
- 기본 분석 이벤트 이름 합의

초기 이벤트 후보:

- `project_card_impression`
- `project_try_click`
- `project_detail_view`
- `project_save`
- `comment_created`
- `project_submitted`

## 15. 시드 데이터 준비

개발 속도를 위해 초기에 준비한다.

- 시드 프로젝트 10~20개
- featured 후보 3~5개
- feedback 요청 샘플 2~3개
- update 샘플 3~5개
- 관리자 계정 1개

## 16. Definition of Ready

아래가 모두 충족되면 기능 구현에 본격 착수한다.

- 로컬 앱 실행 가능
- DB migration 성공
- 로그인 동작 확인
- storage 업로드 테스트 완료
- 기본 레이아웃 렌더링
- 핵심 API 1개 이상 연결
- 테스트 러너 동작 확인
- preview 배포 성공
