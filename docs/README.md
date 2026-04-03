# 바이브코딩 쇼케이스 커뮤니티 문서 인덱스

## 문서 목적

이 문서 세트는 2026-03-26 기준으로 합의된 제품 방향을 구현 가능한 수준까지 정리한 1차 개발 사양서다.

- 일반 커뮤니티가 아니라 프로젝트 중심 쇼케이스 서비스로 정의한다.
- 읽기와 탐색은 무계정 허용, 등록은 소유권 검증 포함, 저장과 계정 기반 활동은 가벼운 계정 기반으로 설계하고 댓글/신고는 CAPTCHA 기반 visitor 참여를 허용한다.
- 논의용 메모가 아니라 실제 구현 착수용 기준 문서로 사용한다.

브랜드명은 아직 확정되지 않았으므로, 문서에서는 설명형 표현인 "바이브코딩 쇼케이스 커뮤니티"를 사용한다.

## 핵심 요약

- 핵심 단위는 게시글이 아니라 `Project`다.
- 프로젝트 아래에 `Launch`, `Update`, `Feedback` 활동이 쌓인다.
- 홈은 자유게시판이 아니라 카드형 쇼케이스 화면이다.
- 주요 CTA는 `Details`보다 `Try`가 우선이다.
- 초반에는 DM, 팔로우, 자유게시판, 레벨 시스템, 복잡한 추천 알고리즘을 넣지 않는다.
- 랭킹은 좋아요 총량이 아니라 실사용 유도와 실제 반응 중심으로 계산한다.

## 권장 읽기 순서

1. [01-product-principles.md](./01-product-principles.md)
2. [02-information-architecture.md](./02-information-architecture.md)
3. [03-page-specifications.md](./03-page-specifications.md)
4. [04-content-and-interaction-model.md](./04-content-and-interaction-model.md)
5. [05-submission-templates.md](./05-submission-templates.md)
6. [06-ranking-moderation-operations.md](./06-ranking-moderation-operations.md)
7. [07-data-model-and-api.md](./07-data-model-and-api.md)
8. [08-design-system-direction.md](./08-design-system-direction.md)
9. [09-roadmap-and-launch-checklist.md](./09-roadmap-and-launch-checklist.md)
10. [10-technical-stack-and-architecture.md](./10-technical-stack-and-architecture.md)
11. [11-sql-schema.md](./11-sql-schema.md)
12. [12-initial-setup-checklist.md](./12-initial-setup-checklist.md)
13. [13-implementation-ticket-breakdown.md](./13-implementation-ticket-breakdown.md)
14. [14-auth-ownership-and-verification.md](./14-auth-ownership-and-verification.md)
15. [15-moderation-state-machine-and-enums.md](./15-moderation-state-machine-and-enums.md)
16. [16-ranking-v1-and-event-semantics.md](./16-ranking-v1-and-event-semantics.md)
17. [17-content-rendering-and-sanitization.md](./17-content-rendering-and-sanitization.md)
18. [18-submission-lifecycle-and-queue-model.md](./18-submission-lifecycle-and-queue-model.md)
19. [19-external-dependencies-implementation-plan.md](./19-external-dependencies-implementation-plan.md)
20. [20-external-dependencies-execution-checklist.md](./20-external-dependencies-execution-checklist.md)
21. [21-supabase-custom-smtp-runbook.md](./21-supabase-custom-smtp-runbook.md)
22. [22-operational-db-cutover-checklist.md](./22-operational-db-cutover-checklist.md)
23. [23-domain-verification-runbook.md](./23-domain-verification-runbook.md)
24. [24-vercel-deployment-runbook.md](./24-vercel-deployment-runbook.md)

## 문서 맵

### 제품 방향

- [01-product-principles.md](./01-product-principles.md)
  - 서비스 정체성
  - 핵심 원칙
  - MVP 범위
  - 제외 범위

### 구조와 권한

- [02-information-architecture.md](./02-information-architecture.md)
  - 공개/회원/관리자 사이트맵
  - 역할과 권한
  - 주요 사용자 플로우

### 화면 명세

- [03-page-specifications.md](./03-page-specifications.md)
  - 홈
  - 탐색
  - 상세
  - 등록
  - 마이페이지
  - 관리자 화면

### 콘텐츠와 상호작용

- [04-content-and-interaction-model.md](./04-content-and-interaction-model.md)
  - 프로젝트/활동 구조
  - 댓글/저장/신고 정책
  - 알림 정책
  - 상태 전이

- [05-submission-templates.md](./05-submission-templates.md)
  - Launch/Update/Feedback 템플릿
  - 검증 및 입력 규칙

- [17-content-rendering-and-sanitization.md](./17-content-rendering-and-sanitization.md)
  - markdown-lite 기준
  - 링크/미디어 허용 범위
  - sanitize 규칙
  - 댓글 렌더링 제한

### 운영과 개발

- [06-ranking-moderation-operations.md](./06-ranking-moderation-operations.md)
  - 랭킹
  - 검수
  - 안티스팸
  - 운영 체크포인트

- [07-data-model-and-api.md](./07-data-model-and-api.md)
  - 엔티티
  - 인덱스
  - API 계약
  - 예시 요청/응답

- [08-design-system-direction.md](./08-design-system-direction.md)
  - UI/UX 방향
  - 카드 설계
  - 반응형 원칙
  - 컴포넌트 우선순위

- [09-roadmap-and-launch-checklist.md](./09-roadmap-and-launch-checklist.md)
  - 구현 단계
  - 오픈 전 체크리스트
  - 핵심 지표
  - Codex 작업 브리프

- [10-technical-stack-and-architecture.md](./10-technical-stack-and-architecture.md)
  - 권장 기술스택
  - 시스템 구조
  - 권한과 운영 기준
  - 1천~1만 사용자 구간 아키텍처 판단

- [11-sql-schema.md](./11-sql-schema.md)
  - Postgres 스키마 초안
  - 핵심 테이블과 인덱스
  - 검색/RLS 방향

- [12-initial-setup-checklist.md](./12-initial-setup-checklist.md)
  - 초기 개발환경 세팅
  - 외부 서비스 연결
  - Definition of Ready

- [13-implementation-ticket-breakdown.md](./13-implementation-ticket-breakdown.md)
  - 구현 에픽
  - 세부 티켓
  - MVP 컷 기준

- [14-auth-ownership-and-verification.md](./14-auth-ownership-and-verification.md)
  - 가벼운 회원 인증
  - 비회원 제출과 claim
  - 소유권 연결
  - 공개 검증 배지 기준

- [15-moderation-state-machine-and-enums.md](./15-moderation-state-machine-and-enums.md)
  - 프로젝트/활동/댓글/신고 상태
  - 검수 전이 규칙
  - 공개 노출 정책
  - 운영 액션 enum

- [16-ranking-v1-and-event-semantics.md](./16-ranking-v1-and-event-semantics.md)
  - 랭킹 대상 조건
  - 이벤트 의미 규격
  - dedupe 규칙
  - 트렌딩 V1 공식

- [18-submission-lifecycle-and-queue-model.md](./18-submission-lifecycle-and-queue-model.md)
  - `/submit` 저장 시점
  - owner 확인과 즉시 공개
  - 7일 미claim 정리
  - 운영 큐와 사후 운영 구분

- [19-external-dependencies-implementation-plan.md](./19-external-dependencies-implementation-plan.md)
  - 외부 의존성 역할 설명
  - GitHub OAuth 제외 범위 고정
  - 필요한 값과 사용자 준비 작업
  - 상용 연동 우선순위

- [20-external-dependencies-execution-checklist.md](./20-external-dependencies-execution-checklist.md)
  - 현재 구현 상태 기준 완료/부분 완료/미구현 분류
  - 지금 바로 시작 가능한 작업
  - 외부 준비물이 필요한 작업
  - 다음 구현 순서 고정

- [21-supabase-custom-smtp-runbook.md](./21-supabase-custom-smtp-runbook.md)
  - Supabase 인증 메일 SMTP 전환 절차
  - Resend SMTP 입력값
  - 저장 후 검증 흐름
  - 실패 시 점검 포인트

- [22-operational-db-cutover-checklist.md](./22-operational-db-cutover-checklist.md)
  - 운영 DB 전환 절차
  - migration / seed 기준
  - 컷오버 전후 smoke test
  - 배포 환경변수 체크리스트

- [23-domain-verification-runbook.md](./23-domain-verification-runbook.md)
  - TXT 기반 도메인 확인 절차
  - `_viber-verify` 레코드 규칙
  - live URL 변경 시 무효화 규칙
  - 로컬 검증 보조 명령

- [24-vercel-deployment-runbook.md](./24-vercel-deployment-runbook.md)
  - Vercel 프로젝트 설정 순서
  - 환경변수 입력 항목
  - 도메인 연결과 운영 URL 반영
  - 배포 직후 smoke test 준비

## 현재 상태

이 문서 세트 기준으로 다음 항목은 결정 완료 상태다.

- 서비스 정체성
- MVP 범위
- 페이지 구조
- 역할과 권한 정책
- 등록 템플릿 방향
- 데이터 모델 초안
- API 표면 초안
- 운영/안티스팸 기준
- 구현 우선순위
- 권장 기술스택
- SQL 스키마 초안
- 초기 세팅 체크리스트
- 구현 티켓 초안
- 인증/소유권 기준
- 운영 상태머신 기준
- 랭킹 V1 기준
- 콘텐츠 렌더링/보안 기준
- 제출 생명주기 기준
- 외부 의존성 구현 계획

다음 확장 작업은 와이어프레임, 상세 API 예시 고도화, RLS 정책 문서, seed 포맷, QA 시나리오 문서화다.
