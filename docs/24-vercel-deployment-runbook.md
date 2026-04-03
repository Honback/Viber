# Vercel 배포 런북

## 1. 문서 목적

이 문서는 현재 구현된 Next.js 앱을 Vercel에 실제 배포하기 위해 사용자가 대시보드에서 눌러야 하는 항목을 순서대로 정리한 실행 문서다.

배포 대상:

- 앱 런타임: Vercel
- Auth / Postgres / Storage: Supabase
- 메일: Resend
- CAPTCHA: Cloudflare Turnstile

## 2. 배포 전 현재 완료 상태

이미 완료된 것:

- Supabase Auth 연동
- Supabase Custom SMTP 저장
- Resend live 발송 경로
- Supabase Storage 업로드
- Turnstile 연동
- 운영 DB migration 반영
- 운영 DB 기준 runtime smoke test

즉, 남은 것은 실제 Vercel 프로젝트 설정과 도메인 연결이다.

## 3. 사용자가 해야 할 일

### 1단계. Vercel 프로젝트 생성

경로:

- `Vercel Dashboard -> Add New -> Project`

확인:

- Git 저장소 선택
- Framework Preset: `Next.js`
- Root Directory: 저장소 루트
- Node.js Version: `22`

### 2단계. 환경변수 입력

경로:

- `Project -> Settings -> Environment Variables`

필수:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `MAIL_FROM`
- `MAIL_FROM_NAME`
- `SUPABASE_STORAGE_BUCKET`
- `SUPABASE_STORAGE_MAX_FILE_BYTES`

권장:

- `MIGRATION_DATABASE_URL`
- `JOBS_RUNNER_TOKEN`

값 원칙:

- `DATABASE_URL`: 운영 DB runtime 용 pooler 연결 문자열
- `MIGRATION_DATABASE_URL`: 운영 DB migration 용 연결 문자열
- `NEXT_PUBLIC_APP_URL`: `https://vibehub.co.kr`
- `MAIL_FROM`: `noreply@vibehub.co.kr`
- `MAIL_FROM_NAME`: `VibeHub`
- `SUPABASE_STORAGE_BUCKET`: `project-media`
- `SUPABASE_STORAGE_MAX_FILE_BYTES`: `10485760`

### 3단계. 첫 배포 실행

방법:

- `Deploy` 버튼
- 또는 이후에는 Git push 로 자동 배포

첫 배포에서 확인할 것:

- build 성공
- production URL 발급

### 4단계. 도메인 연결

경로:

- `Project -> Settings -> Domains`

추가:

- `vibehub.co.kr`
- 필요하면 `www.vibehub.co.kr`

그다음:

- Vercel이 보여주는 DNS 레코드를 도메인 DNS 관리 화면에 반영
- `Valid Configuration` 상태 확인

### 5단계. Supabase 운영 URL 수정

경로:

- `Supabase Dashboard -> Authentication -> URL Configuration`

설정:

- `Site URL`: `https://vibehub.co.kr`
- `Redirect URLs`:
  - `https://vibehub.co.kr/auth/callback`
  - 필요하면 `https://www.vibehub.co.kr/auth/callback`

### 6단계. Turnstile 운영 도메인 추가

경로:

- `Cloudflare Turnstile -> Widget -> Hostnames`

추가:

- `vibehub.co.kr`
- 필요하면 `www.vibehub.co.kr`

## 4. 사용자가 끝내고 나서 Codex가 이어서 할 일

사용자가 위 단계를 마치면 Codex가 이어서 할 것:

- production URL 기준 공개 페이지 smoke test
- 로그인 / 비밀번호 재설정 / 제출 / 댓글 / 신고 / 업로드 / 관리자 흐름 점검
- 필요 시 환경 문제 수정
- 필요 시 배포 후 경로/리다이렉트 문제 수정

## 5. 사용자가 지금 가장 먼저 해야 할 최소 순서

1. Vercel 환경변수 입력
2. 첫 배포 실행
3. `vibehub.co.kr` 도메인 연결
4. Supabase `Site URL`, `Redirect URLs` 수정
5. Turnstile hostname 추가

## 6. 완료 기준

이 런북 기준 완료는 아래를 만족해야 한다.

- Vercel build 성공
- production URL 접근 가능
- `vibehub.co.kr` 연결 성공
- Supabase Auth callback 이 운영 도메인에서 정상 동작
- Turnstile 이 운영 도메인에서 정상 렌더
- Codex smoke test 통과
