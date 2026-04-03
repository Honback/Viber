# 제출 생명주기와 큐 모델

## 1. 문서 목적

이 문서는 `/submit`으로 들어온 신규 프로젝트가 언제 저장되고, 언제 공개되며, 언제 정리되는지를 구현 가능한 수준으로 고정한다.

이 문서의 목적은 아래 4가지다.

- `projects`와 미완료 제출을 어떻게 다룰지 결정한다.
- owner 확인과 공개 시점을 하나의 흐름으로 묶는다.
- 명백한 입력 오류와 중복을 언제 차단할지 고정한다.
- 운영 큐와 사후 운영 범위를 사전 승인 흐름과 분리한다.

## 2. MVP 기준 결정

MVP는 아래 결정을 기준으로 구현한다.

- 별도 `submissions` 테이블을 두지 않는다.
- `/submit` 성공 시 `projects`, 첫 `project_posts(type=launch)`, `project_owners`를 즉시 생성한다.
- `/submit`은 신규 `Launch`만 받는다.
- 기존 프로젝트의 `Update`는 owner가 `/me/projects`에서 시작한다.
- owner의 `Ask for Feedback`는 `/me/projects`, member의 `Feedback`은 프로젝트 상세에서 시작한다.
- 관리자는 사전 승인자가 아니라 사후 운영 담당자다.

## 3. 저장 전 차단 규칙

아래 항목은 동기 검증에서 실패하면 DB에 아무 레코드도 만들지 않는다.

- 필수 항목 누락
- URL 형식 오류
- 허용 길이 초과 또는 구조적으로 잘못된 입력
- 정규화된 `live_url` 중복
- 정규화된 `github_url` 중복
- 기본 안티스팸 규칙에서 즉시 차단 가능한 입력

원칙:

- 사용자에게는 즉시 에러를 반환한다.
- 저장 전 차단은 owner 확인이나 운영 큐와 별개다.
- "저장해 두고 나중에 거절"보다 "명백한 오류는 처음부터 막기"를 우선한다.

## 4. `pending` 상태 의미

MVP 기준에서 `projects.status = pending`은 아래 두 경우만 뜻한다.

- 이메일 claim 전이라 owner가 아직 확정되지 않음
- 예외적인 자동 보호 hold가 필요함

중요:

- `pending`은 관리자 사전 승인 대기 상태가 아니다.
- `pending` 프로젝트는 공개 목록, 검색, 랭킹에 포함하지 않는다.
- `pending` 프로젝트는 owner 또는 admin만 접근할 수 있다.

## 5. 이메일 매직링크 제출 플로우

1. 사용자가 `/submit`에서 `Launch` 폼을 작성한다.
2. 서버가 입력 검증, URL 정규화, 중복 검사, 즉시 차단 가능한 안티스팸 검사를 수행한다.
3. 검증을 통과하면 서버가 `projects`, 첫 `project_posts(type=launch)`, `project_owners`를 `pending` 기준으로 생성한다.
4. `project_owners.user_id`는 비워 두고 `claim_token_hash`, `claim_token_expires_at`를 저장한다.
5. 서버가 매직링크를 발송한다.
6. 사용자가 메일 링크를 눌러 인증하면 `project_owners.user_id`를 연결한다.
7. 별도 차단 사유가 없으면 프로젝트와 첫 `Launch`를 즉시 `published`로 전환한다.

핵심 해석:

- 이메일 인증은 관리자 승인 절차가 아니라 owner 연결 절차다.
- 공개 조건은 "owner 확인 완료"다.
- 성공적으로 claim된 프로젝트는 기본적으로 바로 공개된다.

## 6. GitHub 인증 제출 플로우

1. 사용자가 `/submit` 마지막 단계에서 GitHub 인증을 선택한다.
2. 서버가 인증 세션을 확보한 뒤 동일한 동기 검증과 중복 검사를 수행한다.
3. 검증을 통과하면 `projects`, 첫 `project_posts`, `project_owners`를 생성한다.
4. `project_owners.user_id`는 즉시 연결된다.
5. 별도 차단 사유가 없으면 즉시 `published` 된다.

원칙:

- GitHub 경로도 관리자 사전 승인 없이 owner 확인 완료 시 공개한다.
- `github_verified` 배지 판단은 owner 연결과 별도로 처리한다.

## 7. 미claim 제출 정리

이메일 경로에서 claim이 완료되지 않은 제출은 영구 보관하지 않는다.

정리 규칙:

- claim 토큰 유효기간은 7일이다.
- 7일 내 claim되지 않은 `pending` 프로젝트는 정리 배치 대상이다.
- 정리 시 해당 `projects`, 첫 `project_posts(type=launch)`, `project_owners`를 함께 삭제한다.
- 이 삭제는 "버려진 미완료 제출 정리"로 간주하며 공개 이력으로 남기지 않는다.

MVP 판단:

- 복구 가능한 draft 시스템보다 단순한 삭제 정책을 우선한다.
- 나중에 미완료 제출 복구 요구가 커지면 그때 `submissions` 테이블 분리를 검토한다.

## 8. 운영 큐와 사후 운영

운영 큐는 아래 이슈를 다루는 사후 운영 채널이다.

- 신고
- 스팸 의심
- dead link
- duplicate 후보
- 제한, 숨김, 보관, featured 편성

운영 큐는 아래 목적에 쓰지 않는다.

- 신규 프로젝트 사전 승인
- owner 확인 대기 항목 수동 publish

## 9. 구현 기준 요약

한 줄 흐름은 아래와 같다.

`제출 -> 동기 검증 통과 -> project/launch/owner 생성 -> owner 확인 -> 즉시 공개`

예외 처리 원칙은 아래와 같다.

- 명백한 오류와 정규화 URL 중복은 저장 전 차단
- claim 미완료는 7일 후 삭제
- 공개 후 문제는 사후 운영으로 처리
