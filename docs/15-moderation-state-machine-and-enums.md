# 운영 상태머신과 Enum 기준

## 1. 문서 목적

이 문서는 프로젝트, 활동, 댓글, 신고, 운영 액션의 상태 정의를 하나의 기준으로 고정한다.

목표는 아래 두 가지다.

- 문서마다 흩어진 상태 이름과 의미를 일치시킨다.
- 구현 시 상태 전이와 공개 노출 규칙을 재현 가능하게 만든다.

이 문서의 enum과 전이 규칙은 기존 문서의 짧은 메모보다 우선한다.

## 2. 프로젝트 상태 enum

프로젝트 공개 상태는 아래 6개만 사용한다.

- `pending`
- `published`
- `limited`
- `hidden`
- `rejected`
- `archived`

### 2-1. 상태 의미

| 상태 | 공개 노출 | 검색 노출 | 상세 접근 | owner 수정 | 설명 |
| --- | --- | --- | --- | --- | --- |
| `pending` | 불가 | 불가 | owner/admin만 가능 | 가능 | 소유권 확인 전 또는 자동 보호 hold 상태 |
| `published` | 가능 | 가능 | 가능 | 가능 | 일반 공개 상태 |
| `limited` | 메인/트렌딩 제외 | 가능 | 가능 | 가능 | 경고 또는 제한이 붙은 공개 상태 |
| `hidden` | 불가 | 불가 | 일반 사용자 불가 | 가능 | 운영상 숨김 처리 |
| `rejected` | 불가 | 불가 | 일반 사용자 불가 | 가능 | 게시 거절 상태 |
| `archived` | 메인/트렌딩 제외 | 가능 | 가능 | 제한적 가능 | 오래되었거나 비활성인 보관 상태 |

### 2-2. 핵심 원칙

- `limited`는 "공개는 유지하되 배포 면을 제한하는 상태"다.
- `hidden`은 일반 공개를 중단하는 상태다.
- `rejected`는 자동 차단 또는 운영 거절 상태다.
- `archived`는 정책 위반이 아니라 수명 종료 또는 유지보수 중단에 가까운 상태다.

## 3. 활동 상태 enum

`project_posts`는 아래 4개 상태를 사용한다.

- `pending`
- `published`
- `hidden`
- `rejected`

원칙:

- `Update`와 `feedback`도 독립 검수 대상으로 본다.
- 초기 운영 기준으로 owner 작성 활동은 즉시 공개를 기본으로 한다.
- member 작성 `feedback`은 owner 활동보다 더 보수적으로 검수한다.

### 3-1. 활동 기본 정책

- 프로젝트 첫 `Launch`는 owner 확인 완료 시 `published`를 기본으로 한다.
- 기존 `published` 프로젝트의 owner가 작성한 `Update`와 owner용 `Ask for Feedback`은 기본적으로 즉시 `published` 처리한다.
- authenticated member가 작성한 `feedback`은 기본적으로 `pending`으로 생성하고, 운영 기준을 통과하면 `published` 처리한다.
- 단, 아래 조건 중 하나에 걸리면 활동도 `pending`으로 보낸다.
  - 금칙어 또는 스팸 규칙 탐지
  - 과도한 외부 링크
  - 최근 30일 내 운영 제재 이력
  - 동일 프로젝트의 짧은 시간 내 과도한 연속 발행

## 4. 댓글 상태 enum

댓글 상태는 아래 3개만 사용한다.

- `active`
- `hidden`
- `deleted`

의미:

- `active`: 일반 표시
- `hidden`: 운영자만 원문 조회 가능, 일반 사용자에게는 비노출
- `deleted`: 작성자 삭제 또는 운영 삭제 후 soft delete placeholder 표시

원칙:

- 댓글은 기본적으로 즉시 `active`로 생성한다.
- 사후 검수로 `hidden` 또는 `deleted` 처리한다.
- visitor 댓글도 `Turnstile`과 rate limit을 통과하면 기본적으로 `active` 생성 가능하다.

## 5. 신고 상태 enum

신고 상태는 아래 4개를 canonical enum으로 사용한다.

- `open`
- `reviewing`
- `resolved`
- `rejected`

설명:

- `open`: 아직 분류되지 않음
- `reviewing`: 운영자가 검토 중
- `resolved`: 실제 조치 또는 안내 완료
- `rejected`: 신고가 부적절하거나 근거 부족으로 기각됨

이 enum은 기존 문서의 `reviewed` 표현을 구현 단계에서 `reviewing`으로 정규화한다.

## 6. 운영 액션 enum

`moderation_actions.action`은 아래 집합을 기준으로 한다.

- `publish`
- `limit`
- `hide`
- `reject`
- `archive`
- `restore`
- `feature`
- `unfeature`
- `resolve_report`
- `reject_report`
- `mark_duplicate`
- `request_changes`

원칙:

- 상태와 액션은 다르다.
- 예를 들어 `archive`는 액션이고, `archived`는 상태다.
- 모든 액션은 `admin_user_id`, `target_type`, `target_id`, `reason`, `metadata_json`과 함께 감사 로그로 남긴다.

## 7. 프로젝트 상태 전이 규칙

허용 전이는 아래를 기준으로 한다.

### 7-1. 신규 제출

- `pending -> published`
- `pending -> limited`
- `pending -> rejected`
- `pending -> hidden`

### 7-2. 공개 이후

- `published -> limited`
- `published -> hidden`
- `published -> archived`

- `limited -> published`
- `limited -> hidden`
- `limited -> archived`

- `hidden -> published`
- `hidden -> limited`
- `hidden -> archived`

- `rejected -> pending`
  - owner가 수정 후 자동 보호 재평가 또는 운영 재개 요청한 경우만 허용

- `archived -> published`
- `archived -> limited`
- `archived -> hidden`

### 7-3. 금지 전이

- `rejected -> published` 직접 전이는 금지한다.
- `archived -> rejected` 직접 전이는 금지한다.
- `pending -> archived` 직접 전이는 금지한다.

## 8. 공개 노출 규칙

### 8-1. 홈

- `published`만 노출한다.
- `limited`는 홈 기본 섹션에서 제외한다.
- `archived`, `hidden`, `rejected`, `pending`은 제외한다.
- 수동 피처드도 `published` 상태만 가능하다.

### 8-2. 탐색

- 기본 탐색 결과에는 `published`만 노출한다.
- `limited`는 검색 직접 결과에는 노출 가능하지만 기본 트렌딩과 추천에는 넣지 않는다.
- `archived`는 검색에서 별도 배지와 함께 노출 가능하다.

### 8-3. 상세

- `published`, `limited`, `archived`는 일반 접근 가능하다.
- `limited`는 상단 경고 배지를 노출한다.
- `archived`는 최신 운영 상태가 아님을 알리는 안내를 노출한다.
- `pending`, `hidden`, `rejected`는 owner/admin 외 접근을 막는다.

## 9. 신고와 운영 처리 기준

### 9-1. 중복

- 제출 전 중복 탐지 시 기본 액션은 `reject`다.
- 이미 공개 중인 중복은 자동 삭제하지 않는다.
- 운영자가 원본과 복제본을 판단한 후 아래 중 하나를 택한다.
  - 복제본 `hidden`
  - 복제본 `archived`
  - 메모만 남기고 유지

### 9-2. 죽은 링크

- 링크 헬스체크 3회 연속 실패 시 `broken link` 운영 플래그를 건다.
- 즉시 자동 `archived` 하지 않는다.
- 운영 검토 후 아래 중 하나를 택한다.
  - `limited`
  - `archived`
  - 유지

### 9-3. 저품질 또는 오해 소지

- 설명이 과도하게 빈약하거나 허위 소지가 있으면 `limited` 또는 `reject`를 사용한다.
- 명백한 정책 위반, 사칭, 스팸은 `hidden` 또는 `reject`를 사용한다.

## 10. owner 알림 규칙

아래 액션은 owner에게 메일 알림을 보낸다.

- `publish`
- `limit`
- `reject`
- `archive`
- `request_changes`

`hide`는 악성 또는 민감 사안일 수 있으므로 기본은 알리되, 법적 또는 안전 이슈가 있으면 운영자 판단으로 예외 처리할 수 있다.

## 11. 구현 권장사항

- `status_reason` 또는 equivalent metadata를 남겨 owner가 조치 사유를 이해할 수 있게 한다.
- `limited`는 단순 badge가 아니라 노출 정책 분기와 함께 구현한다.
- 상태 변경은 반드시 서버 액션 또는 관리자 API에서만 허용한다.
- enum 이름은 프론트와 백엔드, DB에서 동일 문자열을 사용한다.
