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

현재 앱이 어느 DB를 바라보는지 확인:

```bash
npm run db:target
```

DB 프로필을 전환:

```bash
npm run db:profile -- status
npm run db:profile:local-dev
npm run db:profile:prod-migrate
npm run db:profile:prod-app
```

- `local-dev`: 앱과 마이그레이션 모두 로컬 Docker DB를 사용한다.
- `prod-migrate`: 앱은 계속 로컬 DB를 사용하고, 마이그레이션만 운영 DB를 사용한다.
- `prod-app`: 앱과 마이그레이션 모두 운영 DB를 사용한다.
- 첫 실행 시 현재 운영 연결값을 `.env.db-profiles.json` 에 저장한다. 이 파일은 git에 올라가지 않는다.

운영 전환 시 권장:

- `DATABASE_URL`: 앱 런타임용 연결 문자열
- `MIGRATION_DATABASE_URL`: 로컬에서 migration 실행 시 사용할 직접 연결 문자열

예를 들어 Supabase 운영 DB를 사용할 때는:

- Vercel `DATABASE_URL` 은 pooler 연결 문자열을 사용
- 로컬 `npm run db:migrate` 는 `MIGRATION_DATABASE_URL` 로 direct 연결 문자열을 사용하는 편이 안전하다
- 평소 로컬 기능 개발 중에는 `DATABASE_URL` 을 Docker 로컬 DB로 유지하고, 운영 반영 시에만 `MIGRATION_DATABASE_URL` 을 운영 DB로 바꿔 동일한 마이그레이션 파일을 적용하는 흐름을 권장한다
- `npm run db:seed` 는 기본적으로 원격 DB에서 차단된다. 정말 필요한 경우에만 `ALLOW_REMOTE_SEED=true` 를 명시해 의도적으로 실행한다
- 운영 DB 기준 런타임 smoke test:

```bash
npm run db:check-remote-runtime
```

- 이 명령은 운영 DB에 임시 프로젝트를 넣고, 별도 포트에서 원격 런타임 서버를 띄운 뒤 공개 경로와 프로젝트 상세/API를 확인하고, 마지막에 임시 데이터를 정리한다.

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

Supabase 환경변수를 채우면 `/auth/sign-in` 에서 아래 흐름이 동작합니다.

- 처음 시작하기
  - 이메일 입력
  - 이메일 확인 링크 수신
  - 링크 클릭 후 비밀번호 설정
- 이후 로그인
  - 이메일 + 비밀번호 로그인
- 비밀번호 재설정
  - 이메일 확인 링크 수신
  - 링크 클릭 후 새 비밀번호 설정

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- 선택: `ADMIN_BOOTSTRAP_EMAILS`

`ADMIN_BOOTSTRAP_EMAILS` 는 실제 Supabase 로그인 사용자를 첫 관리자 계정으로 자동 승격할 때만 필요합니다. 이 값을 비워둬도 일반 회원 로그인은 계속 사용할 수 있고, 로그인 후 아래 명령으로 관리자로 승격할 수 있습니다.

```bash
npm run auth:promote-admin -- your@email.com
```

로그아웃은 헤더에서 바로 처리되고, 회원 전용 페이지는 로그인 후 원래 보려던 경로로 다시 돌아오게 구성했습니다.

주의:

- Supabase는 테스트용 `example.com` 주소를 거부할 수 있습니다.
- 실제 수신 가능한 이메일 주소로 최초 인증을 진행해야 합니다.

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
  - 작업 실행 `/admin/jobs`
  - 메일 기록 `/admin/mail`
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
  - 전체 유지보수 작업 순차 실행 `npm run jobs:all`
  - 랭킹 스냅샷 재계산 `npm run jobs:recompute-ranking`
  - 미claim pending 정리 `npm run jobs:cleanup-unclaimed`
  - 링크 헬스체크 `npm run jobs:check-links`
  - claim, 댓글, 운영 메일 흐름 검증 `npm run mail:check-flow`
  - Storage 업로드 흐름 검증 `npm run storage:check-flow`
  - 내부 실행 엔드포인트 `GET /api/internal/jobs`
  - 개별 작업 실행 `POST /api/internal/jobs/[job]`
  - 전체 작업 실행 `POST /api/internal/jobs/run-all`
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
npm run jobs:all
npm run jobs:check-links
npm run mail:check-flow
npm run storage:check-flow
```

로컬 HTTP 검증 기준으로 아래 흐름도 확인했습니다.

- 홈, 탐색, 상세 페이지 `200 OK`
- 최초 이메일 인증 후 비밀번호 설정
- 이후 이메일 + 비밀번호 로그인
- 로그인 후 `내 프로젝트`, `저장 목록` 접근
- 저장 API 반영
- 댓글 등록 반영
- owner 런치 즉시 공개 및 update 작성 반영
- 비회원 런치 후 claim 완료 시 즉시 공개
- 관리자 로그인 후 검수 큐와 전체 프로젝트 화면 접근
- 관리자 로그인 후 메일 기록 화면 접근
- 로그인 멤버 업로드 시 Supabase Storage 공개 URL 반영
- 비회원 파일 업로드 요청 차단
- 링크 헬스체크 반영 후 운영 큐의 링크 상태 경고 노출
- 관리자 신고 상태 변경 반영
- `GET /api/internal/jobs` JSON 응답
- `POST /api/internal/jobs/check-links?limit=2` JSON 응답
- `POST /api/internal/jobs/run-all` JSON 응답

## Resend 앱 메일 메모

- 앱 메일은 `claim 링크`, `새 댓글 알림`, `운영 상태 변경` 을 대상으로 한다.
- 로컬에서는 `MAIL_DELIVERY_MODE=simulate` 를 기본으로 사용한다.
- 이 모드에서는 외부 발송 대신 DB의 `email_deliveries` 와 `/admin/mail` 화면에 기록을 남긴다.
- `MAIL_DELIVERY_MODE=live` 와 유효한 `RESEND_API_KEY`, `MAIL_FROM` 이 준비되면 같은 코드 경로로 실제 발송된다.
- 현재 로컬 환경은 `MAIL_FROM=noreply@vibehub.co.kr`, `MAIL_DELIVERY_MODE=live` 로 전환되어 있다.

## Supabase Custom SMTP 메모

- 앱 메일 live 전환과 별개로, Supabase Auth 인증 메일은 Supabase 대시보드에서 SMTP Settings 를 직접 저장해야 한다.
- 현재 권장 설정값은 아래와 같다.
  - Host: `smtp.resend.com`
  - Port: `465`
  - Username: `resend`
  - Password: `.env` 의 `RESEND_API_KEY`
  - Sender email: `noreply@vibehub.co.kr`
  - Sender name: `VibeHub`
- 대시보드 경로:
  - `Authentication -> Email -> SMTP Settings`
- 값 출력용 보조 명령:

```bash
npm run auth:smtp:print
```

- 세부 절차는 [`docs/21-supabase-custom-smtp-runbook.md`](/Users/choh/ideab/viber/docs/21-supabase-custom-smtp-runbook.md) 에 정리했다.

## 운영 DB 전환 메모

- 현재 앱은 `DATABASE_URL` 하나로 로컬/원격 DB를 전환한다.
- 운영 컷오버 절차는 [`docs/22-operational-db-cutover-checklist.md`](/Users/choh/ideab/viber/docs/22-operational-db-cutover-checklist.md) 에 정리했다.

## 도메인 확인 메모

- owner 는 `/me/projects` 에서 TXT 레코드 이름과 토큰을 발급받을 수 있다.
- TXT 레코드를 DNS 에 넣은 뒤 같은 화면에서 `지금 검증하기` 를 실행하면 `domain_verified` 배지로 반영된다.
- 로컬 보조 명령:

```bash
npm run domain:check-flow
```

- 세부 절차는 [`docs/23-domain-verification-runbook.md`](/Users/choh/ideab/viber/docs/23-domain-verification-runbook.md) 에 정리했다.

## Supabase Storage 메모

- 기본 버킷은 `project-media` 이다.
- 첫 업로드 시 공개 버킷을 자동 보장하고, 이미지 MIME 타입은 `jpeg/png/webp/gif`, 파일당 최대 크기는 `10MB` 로 맞춘다.
- 업로드는 공개 API가 아니라 로그인 멤버의 서버 요청에서만 수행된다.
- 비회원 제출은 이미지 URL 입력은 가능하지만, 파일 업로드를 섞으면 서버에서 차단한다.

## 스케줄러 운영 메모

현재는 배포 플랫폼이 고정되지 않아 cron 등록까진 하지 않았고, 대신 아래 2가지 실행 경로를 통일했습니다.

- CLI 진입점
  - `npm run jobs:all`
  - `npm run jobs:run -- check-links --limit 20`
- 내부 HTTP 진입점
  - `GET /api/internal/jobs`
  - `POST /api/internal/jobs/check-links?limit=20`
  - `POST /api/internal/jobs/run-all`

`JOBS_RUNNER_TOKEN` 을 설정하면 내부 job endpoint는 `Authorization: Bearer <token>` 이 필요합니다. 값을 비워두면 로컬 loopback(`127.0.0.1`, `localhost`) 요청만 허용하고, 운영 환경에서는 관리자 세션으로만 실행됩니다.

## 문서

제품/구현 문서는 [`docs/README.md`](/Users/choh/ideab/viber/docs/README.md) 아래에 정리되어 있습니다.
