# 운영 DB 전환 체크리스트

## 1. 문서 목적

이 문서는 현재 로컬 Postgres 기반 개발 환경에서 운영용 Postgres, 특히 Supabase Postgres로 전환할 때 필요한 순서와 확인 포인트를 정리한 컷오버 체크리스트다.

목표:

- `DATABASE_URL` 기준으로 로컬과 운영 DB를 안전하게 분리한다.
- 마이그레이션과 시드 적용 순서를 고정한다.
- 컷오버 전후 검증 항목을 명확히 한다.

## 2. 현재 상태

현재 앱 런타임은 `DATABASE_URL` 을 기준으로 동작하고, migration 실행은 `MIGRATION_DATABASE_URL` 이 있으면 그 값을 우선 사용한다.

- Drizzle config: [drizzle.config.ts](/Users/choh/ideab/viber/drizzle.config.ts)
- DB 연결 진입점: [src/db/index.ts](/Users/choh/ideab/viber/src/db/index.ts)

로컬 기본값:

- `postgres://postgres:postgres@127.0.0.1:54329/vibe_showcase`

즉, 운영 전환의 핵심은 코드 변경이 아니라 환경 프로필을 분리하고, 같은 migration 경로를 그대로 적용하는 것이다.

## 3. 전환 전 준비물

필수:

- 운영 `DATABASE_URL`
- 필요 시 `MIGRATION_DATABASE_URL`
- 운영 Supabase 프로젝트
- 운영 DB 접속 허용 상태
- 현재 migration 전체
- 운영 관리자 계정용 이메일

권장:

- 별도 preview DB
- 운영 백업 정책
- seed 최소셋 분리 전략

## 4. 환경 분리 원칙

### 로컬

- Docker Postgres 사용
- 테스트/개발용 seed 허용
- 권장: `DATABASE_URL=로컬 DB`
- `MIGRATION_DATABASE_URL` 은 비워두거나 로컬 DB로 동일하게 사용
- 전환 명령:
  - `npm run db:profile:local-dev`

### preview

- 선택 사항
- staging 성격의 원격 DB
- 마이그레이션 검증용

### production

- 실제 운영용 Supabase Postgres
- seed는 최소 관리자/샘플만 허용
- 테스트 데이터 금지
- 권장: 앱 런타임은 pooler 연결 문자열, migration 은 direct 연결 문자열
- 전환 명령:
  - `npm run db:profile:prod-migrate`
  - `npm run db:profile:prod-app`

## 5. 컷오버 절차

### 1단계. 운영 DB 연결 정보 준비

- Supabase 대시보드에서 운영 DB 연결 문자열 확인
- `DATABASE_URL` 을 운영용 값으로 준비
- 로컬에서 migration 을 직접 실행할 경우 `MIGRATION_DATABASE_URL` 을 direct 연결 문자열로 준비
- 애플리케이션 배포 환경변수와 로컬 `.env` 를 혼동하지 않도록 분리
- 일상적인 기능 개발 중에는 로컬 `DATABASE_URL` 을 유지하고, 운영 반영 시점에만 `MIGRATION_DATABASE_URL` 을 운영 DB로 바꾸는 흐름을 권장

### 2단계. 현재 대상 확인

아래 명령으로 현재 앱이 어느 DB를 가리키는지 먼저 확인한다.

```bash
npm run db:target
npm run db:profile -- status
npm run db:check-remote-runtime
```

이 명령은 비밀번호를 출력하지 않고 다음만 보여준다.

- host
- port
- database
- local / remote

### 3단계. 운영 DB에 migration 적용

```bash
npm run db:migrate
```

주의:

- 운영에서는 반드시 최신 코드와 같은 migration 집합으로 실행한다.
- 로컬 seed를 먼저 넣지 않는다.
- `npm run db:seed` 는 기본적으로 원격 DB에서 차단된다.
- 권장:
  - 앱 런타임은 `DATABASE_URL` 에 pooler 연결 문자열 사용
  - 로컬 migration 실행은 `MIGRATION_DATABASE_URL` 에 direct 연결 문자열 사용
  - 실제 작업 순서는 `npm run db:profile:prod-migrate` -> `npm run db:migrate`
  - 운영 DB 기준 앱 기동 확인은 `npm run db:check-remote-runtime` 으로 별도 검증한다

### 4단계. 최소 seed 또는 관리자 준비

운영에서 허용하는 최소 항목만 적용한다.

예:

- 관리자 승격 대상 프로필
- 서비스 운영 정책용 고정 데이터

테스트용 샘플 프로젝트, 더미 댓글, 임시 메일 검증 데이터는 운영에 넣지 않는다.

### 5단계. 앱 연결 전 smoke test

운영 DB를 바라보는 상태에서 아래를 확인한다.

- 홈 렌더
- 탐색 렌더
- 프로젝트 상세 조회
- 로그인
- 댓글/저장
- 관리자 접근

### 6단계. 컷오버 후 운영 검증

- 신규 회원 인증
- 비밀번호 재설정
- 프로젝트 제출
- claim 메일 발송
- 댓글 알림 메일 발송
- 관리자 검수 반영

## 6. 운영에서 seed를 다루는 기준

운영 DB에서는 seed를 두 종류로 나눈다.

### 허용

- 관리자 계정 관련 준비
- 정책/상수성 초기 데이터

### 금지

- 시연용 프로젝트
- 임시 댓글
- 테스트 claim 토큰
- 메일 검증용 더미 데이터

## 7. 백업과 롤백 기준

권장:

- 마이그레이션 전 백업 또는 스냅샷 확보
- 위험한 스키마 변경은 저트래픽 시간대에 실행
- 롤백 스크립트가 없으면 destructive migration 을 피함

초기 원칙:

- 컬럼 제거보다 추가를 우선
- enum 삭제보다 상태 전이 정리를 우선
- 대량 삭제는 job으로 나누어 처리

## 8. 배포 환경변수 체크리스트

운영 배포에는 최소 아래 값이 필요하다.

- `DATABASE_URL`
- `MIGRATION_DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `MAIL_FROM`
- `MAIL_FROM_NAME`

선택:

- `JOBS_RUNNER_TOKEN`
- `SUPABASE_STORAGE_BUCKET`
- `SUPABASE_STORAGE_MAX_FILE_BYTES`
- `ADMIN_BOOTSTRAP_EMAILS`

## 9. 완료 기준

이 체크리스트 기준으로 운영 DB 전환 완료는 아래를 만족해야 한다.

- 앱이 로컬 DB가 아니라 운영 DB를 가리킴
- migration 이 모두 적용됨
- 운영에서 불필요한 seed 데이터가 없음
- 인증, 메일, 저장, 댓글, 관리자 기능이 정상
- 스케줄러 job 이 운영 DB 기준으로 실행 가능

## 10. 현재 결론

현재 코드 구조는 운영 DB 전환 준비가 되어 있다.
남은 것은 운영 `DATABASE_URL`, 필요 시 `MIGRATION_DATABASE_URL` 확보와 컷오버 실행 순서의 엄수다.
