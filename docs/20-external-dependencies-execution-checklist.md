# 외부 의존성 실행 우선순위 체크리스트

## 1. 문서 목적

이 문서는 [19-external-dependencies-implementation-plan.md](./19-external-dependencies-implementation-plan.md) 를 실제 실행 순서로 다시 정리한 체크리스트다.

목적은 아래 3가지다.

- 지금 바로 착수 가능한 작업과 외부 준비물이 필요한 작업을 분리한다.
- 현재 코드 기준으로 완료/부분 완료/미구현 상태를 명확히 정리한다.
- 다음 구현 루프에서 무엇부터 처리할지 우선순위를 고정한다.

---

## 2. 현재 상태 요약

### 완료

- `Supabase Auth`
  - 최초 이메일 인증 후 비밀번호 설정
  - 이후 이메일 + 비밀번호 로그인
  - 세션 유지와 보호 페이지 접근

### 부분 완료

- `Supabase Postgres`
  - 구조상 외부 Postgres 연결 가능
  - 운영 Supabase DB 전환 완료 여부는 별도 확인 필요

### 구현 완료, 외부 연결만 남음

- `Cloudflare Turnstile`
  - 비회원 댓글/답글/제출/신고 경로 보호 완료
  - 실제 site key / secret key 연동 및 브라우저 확인 완료
- `Scheduler`
  - 공통 job runner 완료
  - 내부 HTTP 실행 endpoint 완료
  - CLI / HTTP 공통 실행 인터페이스 완료
  - 배포 cron 연결만 남음
- `Resend 앱 메일`
  - claim, 댓글, 운영 상태 변경 메일 생성 완료
  - 로컬 simulate 모드와 관리자 메일 기록 `/admin/mail` 확인 완료
  - `vibehub.co.kr` 발신 도메인 검증 및 live 발송 성공 확인 완료
- `Supabase Storage`
  - `project-media` 공개 버킷 기준 업로드 구현 완료
  - `/submit`, `/me/projects`, 활동 작성 폼에서 파일 업로드 연결 완료
  - 로그인 멤버만 업로드 가능하고 비회원 파일 업로드는 차단

### 구현 완료

- `Domain Verification`
  - TXT 기반 도메인 검증 토큰 발급 구현 완료
  - `/me/projects` 에서 record name, token, 검증 버튼 제공
  - 검증 성공 시 `domain_verified` 반영
  - `live_url` 도메인 변경 시 기존 확인 무효화 처리

### 미구현

- `Upstash Rate Limit`

현재 결정:

- Upstash는 당장 구현하지 않고 보류한다.
- 현 시점의 DB 기반 rate limit 과 Turnstile 조합으로 운영 검증을 계속한다.

---

## 3. 우선순위 규칙

이번 체크리스트는 아래 규칙으로 순서를 정한다.

- 지금 로컬에서 바로 구현 가능한 것은 먼저 처리한다.
- 외부 서비스 키나 도메인이 필요한 항목은 준비물 확보 전까지 뒤로 미룬다.
- 사용자 확인이 필요한 지점은 "막힘"으로 표시한다.

---

## 4. 바로 착수 가능한 1순위

### A. Turnstile 적용 범위 마무리

현재 상태:

- 댓글/답글/제출/신고 모두 보호됨
- 실제 site key / secret key 연동과 브라우저 확인까지 완료

해야 할 일:

- 운영 도메인 추가 시 허용 도메인 재점검
- 필요하면 자동화 테스트용 우회 전략을 별도 정리

완료 기준:

- 비회원 제출, 댓글, 답글, 신고가 모두 Turnstile 토큰 검증을 거침
- 검증 실패 시 저장되지 않음

현재 막힘 여부:

- 없음
- 이미 `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` 가 환경에 존재함

### B. Scheduler 연동 준비

현재 상태:

- 작업 스크립트와 공통 runner 존재
  - `npm run jobs:all`
  - `npm run jobs:check-links`
  - `npm run jobs:cleanup-unclaimed`
  - `npm run jobs:recompute-ranking`
- 내부 HTTP 실행 endpoint 존재
  - `GET /api/internal/jobs`
  - `POST /api/internal/jobs/[job]`
  - `POST /api/internal/jobs/run-all`
- 자동 실행 cron 등록은 아직 없음

해야 할 일:

- 작업 엔드포인트 또는 공통 job runner 정리
- 배포 플랫폼이 정해지지 않아도 사용할 수 있는 실행 인터페이스 만들기
- cron이 나중에 붙더라도 바로 연결 가능한 구조로 정리
- 실패 시 로그 포맷과 exit code 기준 정리

완료 기준:

- 수동 스크립트가 아니라 HTTP 또는 단일 실행 진입점으로도 동일 작업 가능
- 배포 후 cron만 연결하면 자동화 가능한 상태

현재 막힘 여부:

- 부분 막힘
- 실제 자동 실행 등록은 배포 플랫폼 결정 후 가능
- 실행 인터페이스 자체는 완료

### C. 운영 DB 전환 체크리스트 정리

현재 상태:

- 앱은 일반 Postgres 기반
- Supabase Auth는 이미 사용 중
- 운영 DB가 실제 Supabase Postgres인지 여부는 별도 확인 필요

해야 할 일:

- `DATABASE_URL` 기준 운영/로컬 분리 방식 문서화
- 마이그레이션/seed 적용 순서 정리
- preview/staging/prod 분리 필요 여부 체크리스트 작성

완료 기준:

- 운영 DB 전환 시 필요한 값과 순서가 문서화됨

현재 막힘 여부:

- 없음
- [22-operational-db-cutover-checklist.md](./22-operational-db-cutover-checklist.md) 작성으로 문서화 완료

---

## 5. 외부 준비물이 있으면 바로 이어갈 2순위

### D. Resend 앱 메일 live 전환

대상 메일:

- claim 링크 메일
- 새 댓글 알림
- 운영 상태 변경 알림

현재 상태:

- `.env` 에 `RESEND_API_KEY`, `MAIL_FROM` 존재
- 메일 서비스 래퍼 구현 완료
- claim, 댓글, 운영 상태 변경 메일 연결 완료
- 로컬에서는 `MAIL_DELIVERY_MODE=simulate` 로 `/admin/mail` 에 기록 저장
- 현재 로컬은 `MAIL_DELIVERY_MODE=live`, `MAIL_FROM=noreply@vibehub.co.kr` 로 전환 완료

해야 할 일:

- 운영 환경에서 최종 발신 주소/브랜딩 문구 다듬기
- 실패 재시도 또는 운영 알림 정책 보강

완료 기준:

- 로컬과 운영에서 같은 코드 경로를 사용함
- 운영에서는 실제 수신자 메일함까지 도달함
- claim 링크를 브라우저에 노출하지 않고 메일로만 전달 가능

현재 막힘 여부:

- 없음
- live 전환 자체는 완료

중요:

- 이 단계는 "앱 메일" 연동이다.
- Supabase Auth 인증 메일의 Custom SMTP 설정과는 별개로 볼 수 있다.

### E. Supabase Storage

현재 상태:

- 대표 이미지, 갤러리, 활동 미디어 업로드 구현 완료
- 기본 버킷은 `project-media`, 공개 버킷, `10MB`, `jpeg/png/webp/gif`
- 비회원 파일 업로드는 차단되고, 로그인 멤버만 서버 업로드 가능

해야 할 일:

- 운영 환경에서 버킷 정책을 바꿀지 최종 확정
- 필요하면 파일 삭제/교체 정리 정책 추가
- 필요하면 썸네일 변환이나 private 버킷 전략 검토

완료 기준:

- 대표 이미지와 갤러리를 파일 업로드로 처리 가능
- 공개 URL이 실제 프로젝트/활동 데이터에 반영됨
- 멤버 권한이 없는 파일 업로드 요청은 차단됨

현재 막힘 여부:

- 없음
- 현재 기본값으로 동작하며 운영 정책만 추가 결정 가능

---

## 6. 준비물이 확보되기 전까지 보류할 3순위

### F. Supabase Auth용 Custom SMTP

목적:

- 회원가입/비밀번호 재설정/이메일 인증 메일을 Resend SMTP로 발송

현재 상태:

- `vibehub.co.kr` 발신 도메인 확보 완료
- Resend 도메인 검증 및 `Enable Sending` 검증 완료
- 앱 메일 live 발송 확인 완료
- 남은 일은 Supabase 대시보드의 `SMTP Settings` 저장과 실제 인증 메일 재검증이다

필요한 준비물:

- `.env` 의 `RESEND_API_KEY`
- `noreply@vibehub.co.kr`
- Supabase 대시보드 접근 권한

완료 기준:

- Supabase `Authentication -> Email -> SMTP Settings` 에 Custom SMTP 설정 적용
- 최초 인증 메일과 비밀번호 재설정 메일이 `noreply@vibehub.co.kr` 발신자로 실제 수신됨

### G. Upstash Rate Limit

현재 막힘:

- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` 없음

필요한 준비물:

- Upstash Redis 인스턴스
- 엔드포인트별 제한값

완료 기준:

- submit/comment/report/admin API가 Redis 기반으로 제한됨

## 7. 실제 착수 순서

지금 기준으로 다음 순서가 가장 효율적이다.

1. Supabase Custom SMTP
2. 운영 DB 전환 체크리스트 정리
3. Domain Verification
4. Upstash Rate Limit

---

## 8. 각 단계별 진행 조건

### 지금 바로 시작 가능

- Supabase Custom SMTP
- 운영 DB 전환 체크리스트 정리
- Upstash 전환을 제외한 현재 구조 다듬기

### 키 또는 정책만 있으면 시작 가능

- Upstash Rate Limit

### 외부 서비스 추가 준비가 필요해 아직 보류

- Upstash Rate Limit

---

## 9. 다음 구현 루프용 고정 결론

다음 작업은 아래 순서로 고정한다.

- 먼저 `Supabase Custom SMTP` 를 붙인다.
- 그다음 `운영 DB 전환 체크리스트` 를 정리한다.
- 그다음 `Domain Verification` 을 붙인다.
- 이후 `Upstash Rate Limit` 으로 넘어간다.

즉, 지금 당장 실질적으로 파고들 대상은 아래 2개다.

- `Supabase Custom SMTP`
- `운영 DB 전환 체크리스트`
