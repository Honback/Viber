# 외부 의존성 구현 계획

## 1. 문서 목적

이 문서는 현재 로컬 대체 구현으로 남아 있는 외부 의존성을 실제 상용 연동으로 바꾸기 위한 태스크 문서다.

이 문서의 목적은 아래 4가지다.

- 어떤 외부 서비스가 왜 필요한지 명확히 설명한다.
- GitHub OAuth를 제외한 실제 연동 범위를 고정한다.
- 사용자에게 받아야 하는 정보와 설정 작업을 분리한다.
- 구현 순서와 완료 기준을 바로 실행 가능한 수준으로 정리한다.

## 2. 이번 범위

이번 문서에서 다루는 대상:

- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Resend
- Cloudflare Turnstile
- Upstash Rate Limit
- 배포 스케줄러
- DNS TXT 기반 도메인 검증

이번 범위에서 제외:

- GitHub OAuth

정책:

- GitHub OAuth는 이후 별도 문서로 다룬다.
- 이번 문서는 "로그인, 메일, 업로드, 봇 방지, 운영 배치"를 상용 기준으로 닫는 데 집중한다.

## 3. 서비스별 역할 요약

| 항목 | 역할 | 왜 필요한가 | 지금 상태 |
| --- | --- | --- | --- |
| Supabase Auth | 실제 사용자 로그인/세션 | dev 로그인 버튼을 없애고 실제 회원 흐름으로 바꾸기 위해 필요 | 구현 완료 |
| Supabase Postgres | 운영 DB | 현재 로컬 Postgres를 실제 운영 DB로 바꾸기 위해 필요 | 로컬 DB 사용 중 |
| Supabase Storage | 이미지 업로드 저장소 | 대표 이미지, 갤러리, 활동 미디어 업로드에 필요 | 구현 완료 |
| Resend | 트랜잭션 메일 발송 | claim 링크, 운영 상태 변경, 새 댓글 알림 발송에 필요 | live 전환 완료 |
| Turnstile | 봇/스팸 방지 | submit, comment, report를 자동화 공격에서 보호 | 구현 완료 |
| Upstash Rate Limit | production-grade 속도 제한 | 현재 DB 기반 rate limit보다 가볍고 예측 가능한 보호 | 로컬 대체 구현 |
| Scheduler | 정기 작업 실행 | 랭킹 갱신, 링크 헬스체크, 미claim 정리, 메일 큐 처리에 필요 | 실행 인터페이스 완료, cron 대기 |
| Domain Verification | 도메인 소유 신뢰 배지 | 메이커 주장과 실제 서비스 소유를 구분하기 위해 필요 | 구현 완료 |

## 4. 항목별 상세 설명

### 4-1. Supabase Auth

#### 역할

- 이메일 매직링크 로그인
- 실제 세션 관리
- member/admin 세션 판별
- claim 완료 시 실제 사용자 계정 연결
- member feedback 활동 작성 권한 부여

#### 왜 필요한가

현재 앱은 개발용 로그인 버튼과 로컬 세션을 사용한다.
이 상태로는 실제 사용자 가입, 저장, member feedback, owner 연결을 운영 환경에서 안전하게 처리할 수 없다.

Auth가 필요한 이유는 아래와 같다.

- 저장과 member feedback 활동에 실제 사용자 식별자가 필요하다.
- claim 토큰이 특정 사용자 계정과 연결되어야 한다.
- 관리자 권한과 일반 사용자 권한을 실제 세션 기준으로 판별해야 한다.
- 비회원 제출 후 "이 프로젝트를 누가 관리하는가"를 계정 단위로 묶어야 한다.

#### 필요한 정보

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- 개발/운영 redirect URL
- 관리자 계정을 어떤 방식으로 만들지에 대한 정책

#### 사용자 쪽 준비 작업

- Supabase 프로젝트 생성
- Email provider 활성화
- redirect URL 등록
- admin 계정 생성 방식 결정

#### 구현 완료 기준

- dev 로그인 버튼 제거 가능
- 이메일 매직링크로 실제 로그인 가능
- `/me/*`, 저장, member feedback, claim이 Supabase 세션 기준으로 동작

### 4-2. Supabase Postgres

#### 역할

- 운영 데이터 저장소
- 마이그레이션과 실제 서비스 데이터 기준점

#### 왜 필요한가

지금은 로컬 Docker Postgres에만 붙어 있다.
상용 운영으로 가려면 외부에서 안정적으로 접근 가능한 운영 DB가 필요하다.

Postgres가 필요한 이유는 아래와 같다.

- 프로젝트, 활동, 댓글, 신고, 운영 로그가 모두 관계형 구조다.
- 상태 전이와 소유권 연결은 트랜잭션이 필요하다.
- 랭킹과 운영 조회도 SQL로 재현 가능해야 한다.

#### 필요한 정보

- 운영 `DATABASE_URL`
- preview/staging/prod 분리 여부
- 백업 및 복구 정책

#### 사용자 쪽 준비 작업

- Supabase DB 프로젝트 생성
- 운영 DB 접속 문자열 준비
- 환경별 DB 분리 여부 결정

#### 구현 완료 기준

- 로컬/preview/prod에 다른 DB를 연결 가능
- 마이그레이션과 seed 적용 경로 문서화 완료

### 4-3. Supabase Storage

#### 역할

- 대표 이미지 업로드
- 갤러리 이미지 업로드
- 활동용 미디어 업로드

#### 왜 필요한가

지금은 이미지 URL만 입력받는다.
이 방식은 실제 사용자 경험이 약하고, 깨진 외부 이미지나 임의 CDN 의존성을 통제하기 어렵다.

Storage가 필요한 이유는 아래와 같다.

- 제출 품질을 일정하게 유지할 수 있다.
- 이미지 URL 스팸을 줄일 수 있다.
- 썸네일, 커버, 갤러리 경로를 서비스 기준으로 통일할 수 있다.

#### 필요한 정보

- 버킷 이름
- 공개/비공개 정책
- 허용 MIME 타입
- 최대 파일 크기

#### 사용자 쪽 준비 작업

- 필요 시 버킷 이름만 변경
- 공개 정책을 유지할지 검토
- 운영에서 파일 크기 제한을 조정할지 결정

#### 구현 완료 기준

- `/submit`와 `/me/projects`에서 파일 업로드 가능
- 업로드 후 프로젝트/활동에 URL이 자동 반영
- 로그인 멤버만 서버 업로드를 수행하고, 비회원 파일 업로드는 차단

### 4-4. Resend

#### 역할

- claim 링크 메일 발송
- 운영 상태 변경 알림
- 새 댓글 알림

#### 왜 필요한가

문서상 claim은 이메일 경로가 핵심이다.
현재 코드는 claim, 댓글, 운영 상태 변경 메일을 모두 같은 경로로 생성하고, 로컬에서는 `simulate` 모드로 DB와 관리자 메일 화면에 적재한다.

Resend가 필요한 이유는 아래와 같다.

- 비회원 제출자가 claim 링크를 실제로 받아야 한다.
- 운영 제한, 보관, 반려 같은 상태 변경을 owner에게 알려야 한다.
- 댓글이 달렸을 때 owner가 다시 돌아오게 만들 수 있다.

#### 필요한 정보

- `RESEND_API_KEY`
- `MAIL_FROM`
- 발신 도메인
- 메일 제목/브랜딩 톤

#### 사용자 쪽 준비 작업

- Resend 계정 생성
- 발신 도메인 인증
- 보낼 주소 형식 결정

#### 구현 완료 기준

- claim 링크 메일 실발송
- 댓글 알림 메일 실발송
- 운영 상태 변경 메일 실발송
- 로컬에서는 `/admin/mail` 에서 최근 메일 기록과 action URL을 바로 확인 가능
- 현재 프로젝트는 `vibehub.co.kr` 발신 도메인 검증과 live 발송 검증까지 완료

### 4-5. Cloudflare Turnstile

#### 역할

- 봇 여부 확인
- submit, comment, report 같은 쓰기 경로 보호

#### 왜 필요한가

현재는 금칙어와 rate limit만 있다.
이것만으로는 자동화된 submit, 댓글 도배, 신고 남발을 막기에 부족하다.

Turnstile이 필요한 이유는 아래와 같다.

- 무계정 submit을 열어두는 구조라 abuse 표면이 넓다.
- visitor 댓글과 신고도 자동화 공격의 대상이 되기 쉽다.
- 작은 운영팀이 수동 대응만으로 막기 어려운 트래픽을 초기에 줄일 수 있다.

#### 필요한 정보

- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- 허용 도메인 목록

#### 사용자 쪽 준비 작업

- Cloudflare Turnstile 사이트 생성
- 개발/운영 도메인 등록

#### 구현 완료 기준

- submit, comment, report 요청 시 토큰 검증
- 검증 실패 요청 차단

### 4-6. Upstash Rate Limit

#### 역할

- 빠른 rate limit 저장소
- 다중 인스턴스 환경에서 일관된 제한

#### 왜 필요한가

현재는 DB에 rate limit 이벤트를 기록하는 방식이다.
MVP 검증에는 충분하지만, 운영 환경에서는 과하고 느릴 수 있다.

Upstash가 필요한 이유는 아래와 같다.

- 봇성 쓰기 요청을 더 싸고 빠르게 막을 수 있다.
- 앱 인스턴스가 여러 개여도 같은 제한 규칙을 공유할 수 있다.
- DB를 rate limit 로그로 불필요하게 오염시키지 않는다.

#### 필요한 정보

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- 엔드포인트별 제한 정책

#### 사용자 쪽 준비 작업

- Upstash Redis 생성
- 제한 정책 숫자 확정

#### 구현 완료 기준

- submit/comment/report/admin API 보호가 Upstash 기반으로 전환

### 4-7. Scheduler

#### 역할

- 정기 작업 실행

대상 작업:

- 랭킹 스냅샷 갱신
- 링크 헬스체크
- 7일 미claim 정리
- 메일 큐 처리

#### 왜 필요한가

지금은 job 스크립트를 수동으로 실행한다.
운영 환경에서는 이 작업들이 자동으로 돌아야 한다.

Scheduler가 필요한 이유는 아래와 같다.

- 트렌딩 점수가 최신 이벤트를 반영해야 한다.
- 죽은 링크를 자동 감지해야 한다.
- 버려진 pending 제출을 자동 정리해야 한다.
- 알림 메일도 비동기 처리해야 한다.

#### 필요한 정보

- 배포 플랫폼 선택
- cron 실행 주기
- production base URL

#### 사용자 쪽 준비 작업

- Vercel 사용할지 여부 결정
- 다른 플랫폼이면 대체 스케줄러 결정

#### 구현 완료 기준

- 수동 실행 없이 정기 작업 자동 수행

### 4-8. Domain Verification

#### 역할

- `domain_verified` 배지 부여

#### 왜 필요한가

이 서비스는 "내가 만들었다"는 주장만으로는 신뢰가 부족하다.
특히 앱 홍보 허브에서는 실제 서비스 운영자가 맞는지를 구분할 장치가 필요하다.

도메인 검증이 필요한 이유는 아래와 같다.

- GitHub가 없거나 private repo인 프로젝트도 신뢰 배지를 가질 수 있다.
- 사칭과 무단 등록을 줄일 수 있다.
- 메이커 alias와 실제 서비스 소유를 분리해서 검증할 수 있다.

#### 필요한 정보

- TXT 레코드 규칙 최종 확정
- 검증 대상 도메인 정책
- 공유 호스트 예외 정책

#### 사용자 쪽 준비 작업

- 실제 운영 도메인 확보
- DNS TXT 추가 가능한지 확인

#### 구현 완료 기준

- 검증 토큰 발급
- TXT 조회 성공 시 `domain_verified` 반영

## 5. 구현 우선순위

### 1순위

- Supabase Auth
- Resend
- Turnstile

이유:

- 실제 회원가입과 claim 발송, abuse 방지 없이는 공개 운영이 어렵다.

### 2순위

- Supabase Storage
- Scheduler

이유:

- 운영 편의와 콘텐츠 품질이 크게 좋아진다.
- 꼭 막히는 기능은 아니지만 상용 전환 직전에는 필요하다.

### 3순위

- Upstash Rate Limit
- Domain Verification

이유:

- 현재 구조로도 임시 운영은 가능하다.
- 하지만 트래픽과 사칭 대응이 붙기 시작하면 필요해진다.

## 6. 사용자에게 받아야 하는 정보

아래 값이 있어야 실제 연동 작업을 시작할 수 있다.

### 필수

- Supabase URL
- Supabase anon key
- Supabase service role key
- Resend API key
- MAIL_FROM
- Turnstile site key
- Turnstile secret key
- 운영 도메인 또는 예정 도메인

### 선택이지만 빠를수록 좋은 것

- Upstash URL
- Upstash token
- Storage 버킷 정책
- 배포 플랫폼 결정

## 7. 사용자에게 필요한 설정 작업

- Supabase 프로젝트 생성
- Auth email provider 활성화
- Storage bucket 생성
- Resend 발신 도메인 인증
- Turnstile 사이트 생성
- 배포 플랫폼 선택
- 운영 도메인 확보

## 8. Codex 작업 범위

사용자가 위 정보를 주면 바로 이어서 할 작업은 아래다.

1. `.env`와 runtime 설정 정리
2. dev auth 제거 및 Supabase 세션 연동
3. claim 메일 실발송 연결
4. Turnstile 검증 추가
5. Storage 업로드 UI/서버 처리 추가
6. scheduler job 등록 구조 정리
7. domain verification 플로우 추가

## 9. 이번 문서 기준 결정

- GitHub OAuth는 이번 태스크에서 제외한다.
- 먼저 "실제 로그인 + 실제 메일 + 실제 봇 방지"를 닫는다.
- 그 다음 "업로드 + 배치 자동화"로 넘어간다.
- 마지막에 "검증 배지 고도화"를 붙인다.
- `vibehub.co.kr` 발신 도메인과 Resend live 발송은 준비 완료 상태이며, Supabase Auth 인증 메일용 Custom SMTP 전환은 [21-supabase-custom-smtp-runbook.md](./21-supabase-custom-smtp-runbook.md) 기준으로 진행한다.
