# SQL 스키마 초안

## 1. 문서 목적

이 문서는 제품 문서와 데이터 모델 문서를 실제 Postgres 구현 수준으로 내리기 위한 SQL 스키마 기준서다.

- 핵심 테이블 구조를 정한다.
- 컬럼 타입, 제약조건, 인덱스 방향을 정한다.
- 향후 Drizzle 스키마와 마이그레이션의 기준으로 사용한다.

이 문서는 최종 DDL 파일이 아니라, 실제 DDL을 만들기 전 합의용 초안이다.

## 2. 스키마 설계 원칙

### 2-1. 정규화 원칙

- 공개의 최상위 단위는 `projects`다.
- 활동 이력은 `project_posts`로 분리한다.
- 저장, 클릭, 태그, 신고, 검수 기록은 별도 테이블로 정규화한다.
- 검색과 카드 렌더링 편의를 위해 일부 파생 필드는 허용한다.

### 2-2. 타입 원칙

- 기본 PK는 `uuid`
- 시간 컬럼은 `timestamptz`
- 상태값은 초기에 `text + check` 방식 사용
- 유연한 미디어 배열과 메타데이터는 `jsonb`

`enum type` 대신 `text + check`를 우선 권장하는 이유는 초기 운영 중 상태값이 자주 조정될 수 있기 때문이다.

### 2-3. 권한 원칙

- 인증은 Supabase Auth를 기준으로 한다.
- 앱의 쓰기 권한 검사는 서버 API에서 먼저 수행한다.
- DB는 RLS로 2차 보호를 둔다.

## 3. 확장 기능

초기 DB 부트스트랩 시 아래 확장을 권장한다.

```sql
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
```

필요 시 추후 `unaccent` 도입을 검토할 수 있지만 초기 필수는 아니다.

## 4. 핵심 테이블

### 4-1. profiles

인증 사용자와 공개 프로필 정보를 관리한다.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null,
  avatar_url text,
  github_username text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

설명:

- `auth.users`를 기반으로 공개 프로필 정보를 분리한다.
- role은 초기에 `member`, `admin` 두 단계로 둔다.

### 4-2. projects

서비스의 핵심 공개 단위다.

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  tagline text not null,
  short_description text not null,
  overview_md text not null,
  problem_md text not null,
  target_users_md text not null,
  why_made_md text,
  stage text not null check (stage in ('alpha', 'beta', 'live')),
  category text not null,
  platform text not null check (platform in ('web', 'mobile', 'desktop')),
  pricing_model text not null check (pricing_model in ('free', 'freemium', 'paid', 'custom')),
  pricing_note text,
  live_url text not null,
  live_url_normalized text not null,
  github_url text,
  github_url_normalized text,
  demo_url text,
  docs_url text,
  maker_alias text not null,
  cover_image_url text not null,
  gallery_json jsonb not null default '[]'::jsonb,
  is_open_source boolean not null default false,
  no_signup_required boolean not null default false,
  is_solo_maker boolean not null default false,
  ai_tools_json jsonb not null default '[]'::jsonb,
  verification_state text not null default 'unverified'
    check (verification_state in ('unverified', 'github_verified', 'domain_verified')),
  status text not null default 'pending'
    check (status in ('pending', 'published', 'limited', 'hidden', 'rejected', 'archived')),
  featured boolean not null default false,
  featured_order integer,
  published_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

설명:

- `*_normalized` 컬럼은 중복 감지와 운영 검색용이다.
- `gallery_json`, `ai_tools_json`은 초기에 `jsonb`로 충분하다.
- `featured`와 `featured_order`는 홈 편성 기능을 위해 둔다.

### 4-3. project_owners

프로젝트 소유권과 claim 상태를 관리한다.

```sql
create table project_owners (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  verification_method text not null check (verification_method in ('email', 'github')),
  email_hash text,
  claim_token_hash text,
  claim_token_expires_at timestamptz,
  is_primary boolean not null default false,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);
```

설명:

- 비회원 제출을 허용하므로 `user_id`는 nullable이다.
- claim 토큰은 원문 저장 대신 hash 저장을 권장한다.
- MVP는 별도 `submissions` 테이블 없이 `/submit` 성공 시 `projects`, 첫 `project_posts(type=launch)`, `project_owners`를 함께 생성한다.
- 필수값 검증 실패나 정규화 URL 중복이면 어떤 레코드도 생성하지 않는다.
- 7일 내 claim되지 않은 `pending` 프로젝트는 정리 배치에서 삭제한다.

### 4-4. project_posts

프로젝트 하위 활동 이력이다.

```sql
create table project_posts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  author_user_id uuid not null references profiles(id) on delete restrict,
  type text not null check (type in ('launch', 'update', 'feedback')),
  title text not null,
  summary text not null,
  body_md text not null,
  requested_feedback_md text,
  media_json jsonb not null default '[]'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'hidden', 'rejected')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);
```

설명:

- `author_user_id`는 실제 활동 작성자를 기록한다.
- `launch`와 `update`는 owner/admin이 작성하고, `feedback`은 owner/admin/member가 작성할 수 있다.
- owner 작성 `feedback`은 Ask for Feedback, member 작성 `feedback`은 구조화된 제품 피드백으로 해석한다.

### 4-5. comments

프로젝트 또는 특정 활동에 달리는 댓글이다.

```sql
create table comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  post_id uuid references project_posts(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  guest_name text,
  guest_session_hash text,
  body_md text not null,
  status text not null default 'active' check (status in ('active', 'hidden', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_author_identity_check check (
    (user_id is not null and guest_name is null and guest_session_hash is null)
    or (user_id is null and guest_name is not null and guest_session_hash is not null)
  )
);
```

설명:

- 1단계 대댓글 제한은 앱 로직과 DB 제약 검토로 함께 관리한다.
- soft delete를 위해 `status`를 둔다.
- member 댓글은 `user_id`와 연결한다.
- visitor 댓글은 `guest_name`, `guest_session_hash`를 저장하고 CAPTCHA와 더 강한 rate limit을 적용한다.

### 4-6. project_saves

저장 기능과 랭킹 신호를 위한 관계 테이블이다.

```sql
create table project_saves (
  user_id uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);
```

### 4-7. project_click_events

outbound click 추적용 이벤트 테이블이다.

```sql
create table project_click_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  source text not null,
  session_hash text not null,
  user_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
```

설명:

- 동일 세션 중복 제거는 쿼리 또는 집계 배치에서 처리한다.
- raw event와 집계를 분리하는 것이 좋다.

### 4-8. tags

```sql
create table tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);
```

### 4-9. project_tags

```sql
create table project_tags (
  project_id uuid not null references projects(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, tag_id)
);
```

### 4-10. reports

```sql
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references profiles(id) on delete set null,
  target_type text not null check (target_type in ('project', 'post', 'comment')),
  target_id uuid not null,
  reason text not null,
  note text,
  status text not null default 'open'
    check (status in ('open', 'reviewing', 'resolved', 'rejected')),
  created_at timestamptz not null default now()
);
```

### 4-11. moderation_actions

```sql
create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references profiles(id) on delete restrict,
  target_type text not null check (target_type in ('project', 'post', 'comment', 'report')),
  target_id uuid not null,
  action text not null,
  reason text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

설명:

- 운영 조치는 전부 감사 로그로 남겨야 한다.
- 초기에 `action`은 자유 텍스트로 두고, 운영 패턴이 굳으면 check를 추가해도 된다.

## 5. 운영 보조 테이블

### 5-1. link_health_checks

```sql
create table link_health_checks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  url text not null,
  status_code integer,
  ok boolean not null,
  checked_at timestamptz not null default now(),
  error_message text
);
```

용도:

- dead link 감지
- 아카이브 후보 판단
- 관리자 화면 링크 상태 표시

### 5-2. project_rank_snapshots

```sql
create table project_rank_snapshots (
  project_id uuid not null references projects(id) on delete cascade,
  computed_at timestamptz not null default now(),
  final_score numeric not null,
  unique_try_clicks_7d integer not null default 0,
  new_saves_30d integer not null default 0,
  comment_signal_30d integer not null default 0,
  freshness_multiplier numeric not null default 1.0,
  quality_multiplier numeric not null default 1.0,
  rank_position integer,
  primary key (project_id, computed_at)
);
```

용도:

- 홈/탐색 트렌딩 계산 캐시
- 운영 관찰용 스냅샷

## 6. 필수 인덱스

```sql
create unique index projects_slug_uq on projects (slug);
create unique index projects_live_url_normalized_uq on projects (live_url_normalized);
create index projects_status_published_at_idx on projects (status, published_at desc);
create index projects_status_last_activity_idx on projects (status, last_activity_at desc);
create index projects_featured_order_idx on projects (featured, featured_order);
create index project_posts_project_published_idx on project_posts (project_id, published_at desc);
create index comments_project_created_idx on comments (project_id, created_at desc);
create index comments_post_created_idx on comments (post_id, created_at desc);
create index comments_guest_session_created_idx on comments (guest_session_hash, created_at desc) where guest_session_hash is not null;
create index reports_status_created_idx on reports (status, created_at desc);
create index moderation_actions_created_idx on moderation_actions (created_at desc);
create index project_click_events_project_created_idx on project_click_events (project_id, created_at desc);
```

조건부 인덱스도 권장한다.

```sql
create unique index projects_github_url_normalized_uq
  on projects (github_url_normalized)
  where github_url_normalized is not null;
```

## 7. 검색 인덱스

초기에는 `projects`에 검색용 컬럼을 두는 방식을 권장한다.

```sql
alter table projects
add column search_document tsvector generated always as (
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(tagline, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(short_description, '')), 'C')
) stored;

create index projects_search_document_idx on projects using gin (search_document);
create index projects_title_trgm_idx on projects using gin (title gin_trgm_ops);
create index projects_slug_trgm_idx on projects using gin (slug gin_trgm_ops);
create index projects_maker_alias_trgm_idx on projects using gin (maker_alias gin_trgm_ops);
```

태그 검색을 강화하고 싶다면 추후 materialized view 또는 denormalized search table을 둘 수 있다.

## 8. URL 정규화 원칙

정규화 전용 유틸을 두고 아래 값을 저장한다.

- protocol 차이 제거
- `www.` 처리 일관화
- trailing slash 제거
- 추적용 querystring 제거
- GitHub URL의 `repo` 기준 통일

정규화는 앱 레이어에서 먼저 처리하고, DB에는 정규화 완료된 값을 저장한다.

## 9. RLS 초안 방향

### 공개 읽기

- 목록 기반 공개 읽기는 `published`만 기본 허용
- `limited`, `archived` 상세 노출은 익명 DB 직접 접근이 아니라 서버 레이어에서 별도 판정
- `project_posts.status = 'published'`만 공개 읽기
- tags는 공개 읽기 허용

### 인증 사용자 쓰기

- `project_saves` 본인 계정 기준 insert/delete 허용
- `project_posts`의 member-authored `feedback` insert는 authenticated session 기준으로 서버 레이어에서 허용
- `comments` 본인 계정 기준 insert 허용
- `reports` 본인 계정 기준 insert 허용

### guest 쓰기

- visitor 댓글과 visitor 신고는 anon DB 직접 쓰기가 아니라 서버 레이어에서만 허용
- 이 경로는 `Turnstile`, rate limit, guest fingerprint 검사를 통과해야 한다

### 소유자

- 본인 소유 프로젝트 수정
- 본인 소유 프로젝트의 `launch/update/feedback` 생성

### 관리자

- moderation 관련 전체 접근

단, 관리자 액션과 상태 변경은 RLS만으로 끝내지 말고 서버에서 서비스 레이어로 통제하는 것을 권장한다.

## 10. 구현 메모

### 10-1. updated_at

초기에는 앱 레이어에서 갱신해도 되지만, 프로젝트가 커지면 trigger 도입을 검토한다.

### 10-2. comment depth

1단계 대댓글 제한은 아래 조합으로 관리한다.

- API 검증
- parent comment 조회
- 필요 시 DB trigger

### 10-3. project status와 post status

프로젝트와 활동 상태는 분리한다.

canonical enum과 상태 전이 규칙은 `15-moderation-state-machine-and-enums.md`를 기준으로 맞춘다.
제출 저장 시점과 미claim 정리 규칙은 `18-submission-lifecycle-and-queue-model.md`를 기준으로 맞춘다.

- 프로젝트가 published여도 일부 활동은 hidden일 수 있다.
- 운영 정책상 활동만 숨기는 경우가 존재한다.

## 11. 다음 단계

이 문서 다음에 바로 이어질 작업은 아래다.

1. Drizzle schema 작성
2. migration 파일 생성
3. seed 데이터 포맷 정의
4. RLS 정책 세부 문서화
5. claim cleanup job와 배치 정책 구현
