# 인증, 소유권, 검증 플로우 명세

## 1. 문서 목적

이 문서는 아래 항목을 구현 가능한 수준으로 고정한다.

- 가벼운 회원 인증 방식
- 비회원 제출과 소유권 연결 방식
- `claim` 토큰 동작 규칙
- 프로젝트 공개 검증 배지 기준
- 권한 판정의 서버/DB 책임 경계

이 문서는 기존 제품 문서의 방향을 뒤집지 않고, 상용 구현에서 흔들리기 쉬운 인증과 소유권 해석만 닫는다.

## 2. 고정 결정

### 2-1. 인증 시스템

- 모든 인증은 `Supabase Auth`로 처리한다.
- 초기 로그인 수단은 아래 두 가지만 연다.
  - 이메일 매직링크
  - GitHub OAuth
- 저장, member-authored `feedback`, 내 프로젝트 접근은 반드시 인증 세션이 필요하다.
- 댓글은 visitor도 허용하되 CAPTCHA와 guest identity가 필요하다.
- 브라우저가 직접 DB에 쓰지 않고, 모든 쓰기 요청은 서버를 통과한다.

### 2-2. 비회원 제출 허용 범위

- 비회원은 `/submit`에서 프로젝트 런치를 시작할 수 있다.
- 단, 최종 제출 완료 전에는 아래 둘 중 하나를 반드시 끝내야 한다.
  - 이메일 소유권 확인
  - GitHub 인증
- 즉, "무거운 가입은 강제하지 않되, 소유권 없는 공개 제출은 허용하지 않는다"를 기준으로 한다.

### 2-3. Update / Feedback 작성 권한

- 기존 프로젝트의 `Update`는 익명 제출을 허용하지 않는다.
- `Update`는 해당 프로젝트의 owner 또는 admin만 작성할 수 있다.
- `feedback` 타입 활동은 익명 제출을 허용하지 않는다.
- `feedback`은 authenticated member, owner, admin이 작성할 수 있다.
- owner/admin이 작성한 `feedback`은 "Ask for Feedback", 일반 member가 작성한 `feedback`은 구조화된 사용 피드백으로 해석한다.
- 따라서 기존 프로젝트를 대상으로 한 쓰기 경로는 `update`와 `feedback`을 구분해 권한 판정을 수행해야 한다.

### 2-4. 멀티 오너 정책

- 데이터 모델은 여러 owner를 수용할 수 있게 유지한다.
- 하지만 MVP의 공개 UI와 기본 플로우는 `primary owner 1명`을 기준으로 한다.
- 추가 owner 초대 UI는 초기 범위에서 제외한다.
- 예외적으로 운영자가 수동으로 secondary owner를 추가할 수는 있다.

## 3. 사용자 상태 정의

### 3-1. Visitor

- 로그인하지 않은 사용자
- 공개 탐색 가능
- 신규 런치 제출 시작 가능
- CAPTCHA 통과 시 댓글과 신고 가능
- 저장, feedback 활동 작성, 기존 프로젝트 수정 불가

### 3-2. Member

- 인증된 일반 사용자
- 댓글, 저장, 신고, `feedback` 활동 작성 가능
- 자신의 claim 링크를 통해 프로젝트 owner로 승격될 수 있다

### 3-3. Project Owner

- `project_owners.user_id`로 프로젝트와 연결된 인증 사용자
- 본인 프로젝트 수정 가능
- `Update`와 owner용 `Ask for Feedback` 작성 가능
- 공개 상태 확인 가능

### 3-4. Admin

- `profiles.role = admin`
- 전체 프로젝트와 활동, 댓글, 신고, 운영 액션 관리 가능

## 4. 신규 프로젝트 제출 플로우

### 4-1. 이메일 매직링크 제출

1. 사용자가 `/submit`에서 런치 폼을 작성한다.
2. 서버는 입력 검증, URL 정규화, 정규화 URL 중복 검사와 기본 자동 검사를 수행한다.
3. 서버는 `projects`와 첫 `project_posts(type=launch)`를 `pending`으로 생성한다.
4. 서버는 `project_owners`에 아래 값을 가진 provisional row를 생성한다.
   - `user_id = null`
   - `verification_method = email`
   - `email_hash`
   - `claim_token_hash`
   - `claim_token_expires_at`
   - `is_primary = true`
5. 서버는 `Resend`로 `claim` 링크를 발송한다.
6. 사용자가 링크를 누르면 `Supabase Auth` 이메일 로그인 또는 회원 생성이 완료된다.
7. `/claim/[token]`에서 토큰을 검증하고 `project_owners.user_id`를 연결한다.
8. 토큰이 정상 소비되고 별도 차단 사유가 없으면 프로젝트는 즉시 `published` 된다.

정책:

- 명백한 검증 실패나 정규화 URL 중복이면 어떤 레코드도 만들지 않는다.
- 이메일 확인이 끝나기 전까지 프로젝트는 공개 대상이 아니다.
- 이메일 확인이 끝나지 않은 `pending` 제출은 운영 메인 큐에 넣지 않는다.
- 미확인 제출은 7일 후 자동 삭제한다.

### 4-2. GitHub 인증 제출

1. 사용자가 `/submit` 마지막 단계에서 GitHub 인증을 선택한다.
2. GitHub OAuth 완료 후 서버는 인증 사용자 세션을 확보한다.
3. 서버는 `projects`, 첫 `project_posts`, `project_owners`를 생성한다.
4. `project_owners.user_id`는 즉시 연결된다.
5. 별도 차단 사유가 없으면 프로젝트는 즉시 `published` 된다.
6. 아래 조건을 만족하면 프로젝트 `verification_state`를 `github_verified`로 설정한다.

`github_verified` 조건:

- 제출된 `github_url`이 존재해야 한다.
- `github_url`의 owner 또는 repository 소유 주체가 인증된 GitHub 계정과 일치해야 한다.
- 조직 저장소인 경우에는 아래 중 하나를 만족해야 한다.
  - 인증 계정이 해당 organization 멤버로 확인됨
  - 운영자가 수동 승인

조건을 만족하지 않으면 owner 인증은 성공했더라도 프로젝트 공개 검증 배지는 `unverified`로 유지한다.

## 5. Claim 토큰 규칙

- `claim` 토큰은 1회용이다.
- 토큰 원문은 저장하지 않고 해시만 저장한다.
- 토큰 만료 시간은 발급 후 7일이다.
- 재발송 시 이전 토큰은 즉시 무효화한다.
- 토큰은 특정 `project_owner` row와 1:1로 연결된다.
- 이미 소비된 토큰으로 재진입하면 성공 처리 대신 만료/사용됨 안내를 보여준다.

`/claim/[token]` 완료 후 동작:

- 인증 세션이 없으면 먼저 로그인 또는 회원 생성을 완료시킨다.
- 세션이 생기면 `project_owners.user_id`를 바인딩한다.
- 성공 시 `/me/projects` 또는 해당 프로젝트 관리 화면으로 이동시킨다.

## 6. 프로젝트 검증 배지 기준

프로젝트 공개 배지는 아래 3단계만 사용한다.

- `unverified`
- `github_verified`
- `domain_verified`

중요 원칙:

- 이메일 매직링크 확인은 소유권 확인이지, 공개 배지가 아니다.
- 즉, 이메일만 확인된 프로젝트는 owner는 확정되지만 공개 배지는 `unverified`다.

### 6-1. `github_verified`

아래를 모두 만족할 때 부여한다.

- 인증 사용자가 GitHub OAuth를 마쳤다.
- 제출된 `github_url`이 있다.
- 저장소 소유 주체가 인증 사용자 또는 확인된 organization과 일치한다.

### 6-2. `domain_verified`

아래를 모두 만족할 때 부여한다.

- 프로젝트에 `live_url`이 있다.
- `live_url`의 등록 가능 도메인 기준으로 검증한다.
- 서버가 발급한 토큰을 DNS TXT 레코드로 확인한다.

MVP 기준:

- 도메인 검증 방식은 `DNS TXT`만 지원한다.
- TXT 레코드 이름은 `_viber-verify.<registrable-domain>` 형식으로 둔다.
- TXT 레코드 값은 서버가 발급한 단일 토큰이다.
- 검증 성공 시 `domain_verified`는 `github_verified`보다 우선한다.

검증 불가 대상:

- `vercel.app`, `github.io`, `notion.site` 같은 공유 호스트 서브도메인
- 제출자가 DNS를 제어할 수 없는 도메인

## 7. 권한 판정 규칙

### 7-1. 서버 권한 판정이 기준이다

- Route Handler 또는 Server Action에서 1차 권한 판정을 수행한다.
- DB 정책은 2차 보호막으로 둔다.
- 클라이언트 렌더링 상태를 권한 기준으로 사용하지 않는다.

### 7-2. 최소 권한 규칙

- Visitor
  - 공개 조회
  - 신규 런치 시작
  - CAPTCHA 통과 시 댓글
  - CAPTCHA 통과 시 신고
- Member
  - 댓글
  - 저장
  - 신고
  - `feedback` 활동 작성
  - 자신의 claim 처리
- Owner
  - 본인 프로젝트 수정
  - 본인 프로젝트 `update` 추가
  - 본인 프로젝트 owner용 `feedback` 추가
  - 본인 프로젝트 공개 상태 조회
- Admin
  - 운영 이슈 처리 및 상태 변경
  - 피처드 편성
  - 중복/링크 상태 검토

## 8. 권장 스키마 보강 항목

현재 데이터 모델을 실제 구현에 쓰려면 아래 필드를 추가하는 것을 권장한다.

- `project_owners.revoked_at`
- `project_owners.github_user_id(nullable)`
- `projects.owner_verified_at(nullable)`
- `project_posts.author_user_id`
- `comments.guest_name(nullable)`
- `comments.guest_session_hash(nullable)`

이 필드들은 권한과 claim 만료 처리, 검증 이력 추적에 필요하다.

## 9. 구현 메모

- 저장과 member-authored `feedback`용 가벼운 회원은 동일 Auth 시스템을 사용한다.
- visitor 댓글은 Auth가 아니라 guest identity + CAPTCHA로 처리한다.
- owner 권한은 `profiles.role`이 아니라 `project_owners` 연결로 판정한다.
- 공개 배지와 내부 소유권을 혼동하지 않는다.
- owner 초대, 팀 권한, 세분화된 역할 편집은 초기 범위에서 제외한다.
