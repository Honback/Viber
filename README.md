# 바이브 쇼케이스

바이브코딩 프로젝트를 카드 중심으로 공개하고, 직접 체험, 저장, 댓글, 업데이트, 검수 흐름까지 연결하는 Next.js 기반 쇼케이스 커뮤니티입니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Drizzle ORM
- Postgres 16 (Docker)

## 로컬 실행

Node LTS 환경이 필요합니다.

```bash
source ~/.nvm/nvm.sh
nvm use --lts
npm install
```

데이터베이스를 올리고 마이그레이션/시드를 적용합니다.

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

개발 서버 실행:

```bash
npm run dev
```

브라우저에서 [http://127.0.0.1:3000](http://127.0.0.1:3000) 를 열면 됩니다.

프로덕션 빌드 검증:

```bash
npx next build
```

## Supabase Auth 메모

Supabase 환경변수를 채우면 `/auth/sign-in` 에서 이메일 매직링크 로그인이 동작합니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- 선택: `ADMIN_BOOTSTRAP_EMAILS`

`ADMIN_BOOTSTRAP_EMAILS` 는 실제 Supabase 로그인 사용자를 첫 관리자 계정으로 자동 승격할 때만 필요합니다. 이 값을 비워둬도 일반 회원 로그인은 계속 사용할 수 있고, 로그인 후 아래 명령으로 관리자로 승격할 수 있습니다.

```bash
npm run auth:promote-admin -- your@email.com
```

로그아웃은 헤더에서 바로 처리되고, 회원 전용 페이지는 로그인 후 원래 보려던 경로로 다시 돌아오게 구성했습니다.

## 현재 구현 범위

- 공개 화면
  - 홈 `/`
  - 탐색 `/projects`
  - 상세 `/p/[slug]`
  - 등록 `/submit`
  - 태그 `/tags/[slug]`
  - 정책 `/policy/content`, `/policy/privacy`
  - claim `/claim/[token]`
- 회원 화면
  - 저장 목록 `/me/saved`
  - 내 프로젝트 `/me/projects`
- 운영 화면
  - 검수 큐 `/admin/moderation`
  - 전체 프로젝트 `/admin/projects`
  - 피처드 편성 `/admin/feature`
- 쓰기 흐름
  - 저장 토글
  - 댓글/답글 작성
  - 댓글 수정/삭제
  - 프로젝트/활동/댓글 신고
  - 신규 런치 제출
  - 프로젝트 기본 정보 수정
  - 기존 프로젝트 업데이트/피드백 요청
  - claim 토큰으로 소유권 연결
  - 관리자 검수 및 신고 처리
  - 관리자 프로젝트 상태 변경/피처드 편성
- 운영 자동화
  - 랭킹 스냅샷 재계산 `npm run jobs:recompute-ranking`
  - 미claim pending 정리 `npm run jobs:cleanup-unclaimed`
  - 링크 헬스체크 `npm run jobs:check-links`
- 공개 API
  - `GET /api/projects`
  - `GET /api/projects/[slug]`
  - `GET /api/projects/[slug]/activity`
  - `GET /api/tags`
  - `GET /api/search?q=`
  - `PATCH /api/projects/:id`
  - `POST /api/admin/projects/:id/feature`
  - `POST /api/admin/projects/:id/archive`

## 검증에 사용한 명령

```bash
npm run lint
npx next build
npm run test:unit
npm run jobs:check-links
```

로컬 HTTP 검증 기준으로 아래 흐름도 확인했습니다.

- 홈, 탐색, 상세 페이지 `200 OK`
- Supabase 로그인 후 `내 프로젝트`, `저장 목록` 접근
- 저장 API 반영
- 댓글 등록 반영
- owner 런치 즉시 공개 및 update 작성 반영
- 비회원 런치 후 claim 완료 시 즉시 공개
- 관리자 로그인 후 검수 큐와 전체 프로젝트 화면 접근
- 링크 헬스체크 반영 후 운영 큐의 링크 상태 경고 노출
- 관리자 신고 상태 변경 반영

## 문서

제품/구현 문서는 [`docs/README.md`](/Users/choh/ideab/vibeollio/docs/README.md) 아래에 정리되어 있습니다.
