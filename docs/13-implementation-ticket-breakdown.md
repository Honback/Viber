# 구현 티켓 분해 초안

## 1. 문서 목적

이 문서는 현재 제품 문서와 기술스택 문서를 실제 개발 작업 단위로 쪼개기 위한 티켓 초안이다.

- 기능 구현 순서를 정한다.
- 병렬 작업 가능한 단위를 만든다.
- 각 티켓의 산출물과 완료 기준을 정한다.

초기 목표는 "바로 개발에 착수할 수 있는 수준의 티켓 묶음"이다.

## 2. 운영 원칙

- 공개 읽기 경험을 먼저 완성한다.
- 그 다음 등록, 상호작용, 운영 기능을 붙인다.
- 복잡한 운영 자동화는 마지막 단계로 미룬다.
- 티켓은 가능한 한 화면, API, 데이터 모델을 같이 닫는 단위로 구성한다.

## 3. 에픽 0. 기반 세팅

### T-001 프로젝트 부트스트랩

산출물:

- Next.js App Router 프로젝트 생성
- TypeScript, Tailwind, ESLint 기본 세팅
- 공통 폴더 구조 생성

완료 기준:

- 홈 더미 페이지 렌더링
- 개발 서버 정상 실행

### T-002 환경변수와 외부 서비스 연결

산출물:

- Supabase, Turnstile, Upstash, Resend 환경변수 연결
- `.env.example` 정리

완료 기준:

- 개발 환경에서 모든 필수 env 로드 확인

### T-003 Drizzle와 DB migration 초기화

산출물:

- Drizzle config
- 초기 migration
- dev DB 연결 확인

완료 기준:

- migration apply 성공
- DB introspection 또는 확인 쿼리 통과

## 4. 에픽 1. 데이터 모델과 공개 조회

### T-101 핵심 테이블 구현

산출물:

- `profiles`
- `projects`
- `project_owners`
- `project_posts`
- `comments`
- `project_saves`
- `project_click_events`
- `tags`
- `project_tags`
- `reports`
- `moderation_actions`

완료 기준:

- 문서 기준 핵심 테이블 생성 완료
- 주요 인덱스 포함

### T-102 시드 데이터 구조 구현

산출물:

- seed 스크립트
- featured 프로젝트 시드
- 태그 시드

완료 기준:

- 로컬에서 최소 10개 프로젝트 시드 가능

### T-103 프로젝트 목록 조회 API

산출물:

- `GET /api/projects`
- 정렬
- 기본 필터
- 페이지네이션

완료 기준:

- published 프로젝트만 반환
- sort와 filter 파라미터 동작

### T-104 프로젝트 상세 조회 API

산출물:

- `GET /api/projects/:slug`
- 상세 DTO
- 관련 활동 포함 로직

완료 기준:

- slug 기준 조회
- hidden/rejected 프로젝트 노출 차단

### T-105 태그와 검색 API 초안

산출물:

- `GET /api/tags`
- `GET /api/search`
- 기본 FTS 연동

완료 기준:

- 제목/태그라인/짧은 설명 기준 검색 결과 반환

## 5. 에픽 2. 공개 페이지

### T-201 홈 화면 구현

산출물:

- featured 섹션
- recent launches
- feedback needed
- recent updates

완료 기준:

- 서버 렌더링
- CTA 노출
- empty state 포함

### T-202 탐색 페이지 구현

산출물:

- 검색창
- 필터
- 정렬
- 결과 목록

완료 기준:

- URL query와 상태 동기화
- 모바일 필터 UX 동작

### T-203 프로젝트 상세 페이지 구현

산출물:

- hero 영역
- media
- overview
- activity feed
- comments placeholder

완료 기준:

- 첫 화면에서 Try CTA 노출
- 검증 상태와 주요 메타 표시

### T-204 정책/태그/404/오류 페이지 구현

산출물:

- 정책 문서 페이지
- 태그 페이지
- not-found
- error UI

완료 기준:

- 기본 SEO 메타와 공통 상태 처리 적용

## 6. 에픽 3. 인증과 소유권

### T-301 Supabase Auth 연동

산출물:

- 로그인/로그아웃
- 세션 유틸
- 보호 라우트 가드

완료 기준:

- member 세션 확인 가능

### T-302 GitHub OAuth와 이메일 매직링크

산출물:

- GitHub 로그인
- 이메일 매직링크
- redirect 처리

완료 기준:

- 두 방식 모두 로그인 가능

### T-303 project owner 모델과 claim flow

산출물:

- claim token 생성
- claim 검증
- 소유권 연결 처리

완료 기준:

- 비회원 제출 후 claim으로 소유권 연결 가능
- claim 완료 시 `pending` 프로젝트를 `published`로 전환 가능

## 7. 에픽 4. 등록 플로우

### T-401 submit wizard UI

산출물:

- 단계형 폼
- 입력 검증
- 미리보기

완료 기준:

- launch 제출 UI 완성

### T-402 프로젝트 제출 API

산출물:

- `POST /api/submissions/project`
- URL 정규화
- 최소 품질 검사

완료 기준:

- 성공 시 `pending` 프로젝트, 초기 launch post, provisional owner row 생성
- owner 확인 완료 시 즉시 `published` 전환
- 동기 검증 실패나 정규화 URL 중복이면 어떤 레코드도 생성하지 않음

### T-403 update / feedback 제출 API

산출물:

- `POST /api/projects/:id/posts`
- post author 저장
- update/feedback 권한 분기

완료 기준:

- `update`는 owner/admin만 생성 가능
- `feedback`은 authenticated member 이상이 생성 가능
- 작성자가 `author_user_id`에 기록됨

### T-404 제출 안티스팸

산출물:

- Turnstile 검증
- rate limit
- duplicate 후보 탐지

완료 기준:

- 기본 abuse 방어 적용

### T-405 미claim 제출 정리

산출물:

- 7일 claim expiry cleanup job
- 삭제 대상 로그 또는 메트릭

완료 기준:

- 7일 내 claim되지 않은 `pending` 프로젝트와 초기 launch, `project_owners` 정리

## 8. 에픽 5. 상호작용

### T-501 저장 기능

산출물:

- `POST /api/projects/:id/save`
- `DELETE /api/projects/:id/save`
- 내 저장 목록 조회

완료 기준:

- 로그인 사용자 저장/해제 가능

### T-502 댓글과 1단계 대댓글

산출물:

- `POST /api/projects/:id/comments`
- `POST /api/comments/:id/replies`
- comment thread UI
- guest comment alias 입력
- Turnstile 검증

완료 기준:

- 1단계 대댓글 제한 동작
- visitor 댓글과 member 댓글 모두 생성 가능

### T-503 신고 기능

산출물:

- `POST /api/reports`
- 신고 모달
- 사유 선택

완료 기준:

- 프로젝트/활동/댓글 신고 가능

### T-504 outbound click 기록

산출물:

- `POST /api/projects/:id/outbound-click`
- source 구분

완료 기준:

- Try/GitHub 클릭 기록 저장

## 9. 에픽 6. 관리자와 운영

### T-601 관리자 권한 가드

산출물:

- admin role 체크
- 관리자 라우트 보호

완료 기준:

- 비관리자 접근 차단

### T-602 운영 이슈 큐 조회

산출물:

- `GET /api/admin/moderation/queue`
- 신고/중복/죽은 링크 운영 이슈 목록

완료 기준:

- 유형과 상태 필터 가능

### T-603 관리자 운영 조치 API

산출물:

- `POST /api/admin/moderation/action`
- limit/hide/archive/feature/restore 처리

완료 기준:

- 상태 변경과 `moderation_actions` 기록 동시 처리

### T-604 관리자 프로젝트 목록 화면

산출물:

- 전체 프로젝트 목록
- 링크 상태
- 검증 상태

완료 기준:

- 운영자가 프로젝트 현황을 한 화면에서 확인 가능

### T-605 featured 편성 화면

산출물:

- featured on/off
- 순서 변경

완료 기준:

- 홈 featured 섹션 제어 가능

## 10. 에픽 7. 검색과 랭킹

### T-701 검색 인덱스와 쿼리 최적화

산출물:

- `tsvector`
- `pg_trgm`
- explain 기준 인덱스 점검

완료 기준:

- 기본 검색 응답 속도 확보

### T-702 트렌딩 계산 로직

산출물:

- 클릭/저장/댓글/최근성 기반 점수 함수
- 배치 계산 또는 캐시 구조

완료 기준:

- 홈과 탐색에서 트렌딩 정렬 사용 가능

### T-703 관련 프로젝트 추천

산출물:

- 태그/카테고리 기반 추천 쿼리

완료 기준:

- 상세 페이지 하단 추천 노출

## 11. 에픽 8. 운영 자동화

### T-801 링크 헬스체크 배치

산출물:

- cron job
- `link_health_checks` 기록

완료 기준:

- 주기적으로 live URL 상태 저장

### T-802 dead link 경고와 archive 후보

산출물:

- 운영 기준 로직
- 관리자 화면 표시

완료 기준:

- 장기 실패 프로젝트 후보 식별 가능

### T-803 댓글/운영 상태 메일 알림

산출물:

- Resend 연동
- 이벤트별 메일 템플릿

완료 기준:

- 새 댓글과 운영 상태 변경 메일 발송 가능

## 12. 에픽 9. 품질과 출시 준비

### T-901 metadata와 SEO 정리

산출물:

- sitemap
- robots
- canonical
- Open Graph

완료 기준:

- 공개 페이지 메타데이터 적용

### T-902 테스트 커버리지 기본선

산출물:

- 핵심 유틸 단위 테스트
- 제출/저장/댓글/owner 연결 E2E

완료 기준:

- CI에서 테스트 실행 가능

### T-903 시드 콘텐츠와 런치 준비

산출물:

- 시드 프로젝트
- 피처드 후보
- 샘플 update/feedback 데이터

완료 기준:

- 빈 서비스처럼 보이지 않는 초기 상태 확보

## 13. 병렬 작업 추천

초기에 병렬 진행 가능한 묶음은 아래다.

- T-001 ~ T-003 기반 세팅
- T-101 ~ T-105 데이터/API
- T-201 ~ T-204 공개 페이지

중간 단계 병렬 진행:

- T-301 ~ T-303 인증/소유권
- T-401 ~ T-404 등록 플로우
- T-501 ~ T-504 상호작용

후반 병렬 진행:

- T-602 ~ T-605 관리자
- T-701 ~ T-703 검색/랭킹
- T-801 ~ T-803 운영 자동화

## 14. MVP 컷 기준

아래가 되면 1차 MVP 공개 후보로 볼 수 있다.

- 공개 홈/탐색/상세 동작
- 프로젝트 제출 가능
- owner 연결 후 공개 가능
- 저장/댓글/신고 가능
- 기본 검색 가능
- featured 편성 가능
- 최소 안티스팸 적용

## 15. 다음 작업 추천

이 문서를 바탕으로 바로 이어질 산출물은 아래다.

1. 실제 작업 관리 도구용 티켓 이관
2. 각 티켓별 API 응답 예시 추가
3. 화면별 와이어프레임 연결
4. QA 시나리오 문서 생성
