# 랭킹 V1과 이벤트 의미 규격

## 1. 문서 목적

이 문서는 "실사용 유도와 실제 반응 중심"이라는 기존 원칙을 구현 가능한 V1 규격으로 고정한다.

다루는 범위:

- 어떤 이벤트를 수집할지
- 랭킹 계산에서 무엇을 포함하고 제외할지
- dedupe 규칙
- 홈과 탐색의 주요 섹션을 어떻게 구성할지

## 2. 랭킹 적용 범위

랭킹은 아래 두 면에만 직접 적용한다.

- 홈의 비수동 섹션
- 탐색 페이지의 `trending` 정렬

아래는 랭킹과 분리한다.

- `featured` 수동 편성
- 최신순 정렬
- 관리자 큐 정렬

## 3. 랭킹 대상 프로젝트 조건

아래를 모두 만족해야 V1 랭킹 대상이 된다.

- `projects.status = published`
- `live_url`이 존재한다
- 최근 링크 헬스체크에서 즉시 차단 플래그가 없다

아래 상태는 랭킹에서 제외한다.

- `pending`
- `limited`
- `hidden`
- `rejected`
- `archived`

원칙:

- `limited`는 검색이나 상세 접근은 허용할 수 있어도 트렌딩 경쟁에는 넣지 않는다.
- `featured` 프로젝트도 수동 섹션과 일반 랭킹을 혼합하지 않는다.

## 4. 수집 이벤트 정의

### 4-1. 랭킹에 직접 쓰는 이벤트

- `project_try_click`
- `project_save`
- `comment_created`

### 4-2. 분석 전용 이벤트

- `project_card_impression`
- `project_detail_view`
- `project_submitted`
- `project_published`
- `report_created`

분석 전용 이벤트는 제품 판단에는 쓰되, V1 트렌딩 점수에는 직접 넣지 않는다.

## 5. `project_try_click` 의미

`project_try_click`은 사용자가 외부 체험 링크로 나가려는 명시적 행동만 기록한다.

포함:

- 카드의 `Try`
- 상세 상단의 `Try`
- 상세의 외부 데모 링크
- 상세의 문서 링크
- 상세의 GitHub 링크

제외:

- 내부 상세 페이지 이동
- 단순 hover
- 같은 페이지 내 탭 전환

## 6. `source` canonical enum

`project_click_events.source`는 아래 값을 기준으로 한다.

- `home_try`
- `projects_try`
- `tag_try`
- `detail_try`
- `detail_demo`
- `detail_docs`
- `detail_github`
- `activity_try`

필요 시 확장은 가능하지만, V1 구현에서는 위 집합만 사용한다.

## 7. 익명 식별과 dedupe 규칙

### 7-1. identity key

랭킹용 고유 행동 집계는 아래 우선순위로 identity를 잡는다.

1. 로그인 사용자는 `user_id`
2. 비로그인 사용자는 서버가 발급한 익명 `visitor_id` 쿠키

원칙:

- 브라우저 fingerprinting은 사용하지 않는다.
- `visitor_id`는 랜덤 값으로 발급하고, DB 저장 시에는 해시된 `session_hash`만 남긴다.
- `visitor_id` 쿠키 TTL은 30일로 둔다.

### 7-2. 클릭 dedupe

- 동일 identity가 같은 프로젝트를 24시간 내 여러 번 눌러도 랭킹 집계는 1회로 본다.
- 원시 이벤트는 저장할 수 있지만, 집계 시 dedupe한다.
- source가 달라도 동일 프로젝트와 동일 identity, 동일 24시간 창이면 1회로 계산한다.

## 8. 저장과 댓글 집계 규칙

### 8-1. 저장

- `project_saves`는 사용자당 프로젝트별 1개만 허용한다.
- 랭킹에는 최근 30일 내 생성된 save만 반영한다.
- 저장 취소된 항목은 집계에서 제외한다.

### 8-2. 댓글

- `comments.status = active`인 댓글만 반영한다.
- 최근 30일 내 생성된 댓글만 반영한다.
- 동일 사용자의 과도한 댓글 도배를 약화하기 위해 아래 기준을 적용한다.
  - `comment_signal = min(active_comment_count_30d, unique_commenter_count_30d * 2)`
- `unique_commenter_count_30d`는 member 댓글은 `user_id`, visitor 댓글은 `guest_session_hash` 기준으로 센다.

## 9. V1 점수 공식

V1 점수는 아래 공식을 사용한다.

```txt
base_score
  = (unique_try_clicks_7d * 1.0)
  + (new_saves_30d * 4.0)
  + (comment_signal_30d * 5.0)

freshness_multiplier
  = 1.15  if last_activity_at <= 3 days
  = 1.00  if last_activity_at <= 7 days
  = 0.85  if last_activity_at <= 14 days
  = 0.70  if last_activity_at <= 30 days
  = 0.55  otherwise

quality_multiplier
  = 0.60  if unique_try_clicks_7d >= 20 and (new_saves_30d + comment_signal_30d) = 0
  = 1.00  otherwise

final_score = base_score * freshness_multiplier * quality_multiplier
```

설명:

- 클릭보다 저장과 댓글에 더 큰 가중치를 둔다.
- 최근 활동이 있을수록 약간 유리하게 둔다.
- 반응 없는 클릭만 많은 프로젝트는 점수를 깎는다.

## 10. 섹션별 노출 규칙

### 10-1. Featured

- 수동 편성
- 랭킹 공식 미적용
- `published`만 가능

### 10-2. 새로 나온 프로젝트

- `published_at desc`
- 최근 30일 내 `published` 프로젝트만
- 동일 프로젝트 1회만 노출

### 10-3. 피드백 기다리는 프로젝트

- 최근 14일 내 `published` 상태의 `Ask for Feedback` 활동이 있는 프로젝트
- 프로젝트당 최신 feedback 활동 1건만 기준으로 사용
- `limited`, `archived` 제외

### 10-4. 이번 주 업데이트

- 최근 14일 내 `published` 상태의 `Update` 활동이 있는 프로젝트
- 프로젝트당 최신 update 활동 1건만 기준으로 사용

### 10-5. 탐색 `Trending`

- `final_score desc`
- 동점이면 `last_activity_at desc`
- 그다음 `published_at desc`

## 11. 계산 주기와 저장 방식

- 랭킹 계산은 `Vercel Cron`으로 1시간마다 수행한다.
- 결과는 `project_rank_snapshots`에 저장한다.
- 홈과 탐색의 `trending`은 최신 스냅샷을 읽는다.

권장 필드:

- `project_id`
- `computed_at`
- `final_score`
- `unique_try_clicks_7d`
- `new_saves_30d`
- `comment_signal_30d`
- `freshness_multiplier`
- `quality_multiplier`
- `rank_position`

## 12. API 규칙

`POST /api/projects/:id/outbound-click`는 아래 규칙을 따른다.

- body는 `source`만 필수로 받는다.
- 서버는 현재 사용자 또는 익명 `visitor_id`를 기준으로 이벤트를 저장한다.
- 성공 응답은 `202 Accepted` 또는 equivalent lightweight response로 충분하다.
- 클라이언트는 클릭 성공 여부를 기다리느라 외부 이동을 지연시키지 않는다.

## 13. 운영 주의점

- 랭킹과 분석을 같은 용도로 섞지 않는다.
- 클릭 원시 수치만 보고 수동 피처드를 결정하지 않는다.
- dead link 경고가 있는 프로젝트는 운영 검토 후 랭킹 제외 여부를 갱신한다.
- V1은 단순하고 재현 가능한 공식을 유지하고, 고도화는 실제 운영 데이터가 쌓인 뒤 진행한다.
