# 구현 순서와 오픈 체크리스트

## 1. 현재 판단

현재 문서 수준이면 실제 구현 착수를 시작할 수 있다.

결정 완료 항목:

- 서비스 정체성
- MVP 범위
- 페이지 구조
- 권한 정책
- 등록 템플릿 방향
- 데이터 모델 초안
- API 표면 초안
- 운영/안티스팸 기준
- 구현 순서

## 2. 구현 단계

### 1단계. 기반 구조

- 프로젝트, 활동, 댓글, 신고 관련 DB 구성
- 공개 조회 페이지 구성
- 프로젝트 상세 페이지 구성
- 카드 컴포넌트 구축

### 2단계. 등록 플로우

- submit wizard
- 명백한 입력 오류/정규화 URL 중복 사전 차단
- 이메일 매직링크 또는 GitHub 검증
- owner edit 링크
- owner 연결 이후 즉시 공개 흐름
- 7일 미claim 제출 정리

### 3단계. 상호작용

- 댓글
- 저장
- 신고
- outbound click tracking

### 4단계. 탐색/랭킹

- 검색
- 필터
- 정렬
- 트렌딩 계산

### 5단계. 운영 강화

- duplicate detection
- link health check
- feature 편성
- archived/inactive 처리

## 3. 오픈 전 체크리스트

### 콘텐츠

- 최소 시드 프로젝트 20~30개
- 메인 추천용 프로젝트 5개
- 피드백 요청 샘플 3개
- 업데이트 샘플 5개

### 운영

- 신고 처리 가이드
- 중복 처리 규칙
- dead link 정책
- 사칭 대응 문구
- 콘텐츠 정책 페이지

### 기능

- Open Graph
- sitemap
- canonical
- 기본 분석 이벤트
- 404 상태
- 빈 상태
- 에러 상태

## 4. 핵심 지표

- 프로젝트 클릭률
- 프로젝트당 댓글 발생률
- 첫 피드백까지 걸린 시간
- 저장률
- 재방문률

## 5. 구현 우선순위 판단 기준

우선순위는 아래 기준으로 정한다.

- 프로젝트를 예쁘게 보여주는가
- 사용자가 바로 써볼 수 있는가
- 메이커가 쉽게 올릴 수 있는가
- 운영비가 감당 가능한가

## 6. 다음 문서화 작업 추천

현재 문서 다음 단계로 바로 이어서 만들면 좋은 산출물은 아래다.

1. 화면별 와이어프레임
2. SQL 수준 DB 스키마
3. API 요청/응답 예시 확장
4. 운영 상태 전이 문서
5. 초기 seed 데이터 포맷
6. 구현 티켓 분해 문서

## 7. Codex 작업 브리프

아래 텍스트는 바로 구현 착수용 브리프로 사용할 수 있다.

```txt
Build a project-centric showcase community for vibe-coded apps.

Core concept:
- The main object is a Project, not a generic forum post.
- Each project has activity posts of 3 types: Launch, Update, Feedback.
- Public browsing is allowed without login.
- Project submission does not require heavy account signup, but ownership verification is required via email magic link or GitHub auth.
- Saves and member-authored feedback require lightweight user accounts, while comments are open to visitors with CAPTCHA.

Public routes:
- /
- /projects
- /p/[slug]
- /submit
- /tags/[slug]
- /claim/[token]

Member routes:
- /me/saved
- /me/projects

Admin routes:
- /admin/moderation
- /admin/projects
- /admin/feature

Must-have pages:
- Home with featured projects, new launches, feedback-needed, recent updates
- Explore page with search, filters, sort
- Project detail page with media, CTA buttons, overview, activity feed, comments
- Submission wizard for launch
- Admin operations queue

Core entities:
- users
- project_owners
- projects
- project_posts
- comments
- project_saves
- project_click_events
- tags
- project_tags
- reports
- moderation_actions

MVP rules:
- No free board
- No DMs
- No follower system
- No gamified badges
- No complex profile system
- No in-app notification center

Ranking:
- Use unique outbound clicks, saves, comments, recency
- Do not rank by raw likes only

Moderation:
- Detect duplicate URLs
- Flag broken links
- Require content minimums
- CAPTCHA + rate limiting + report flow

Design direction:
- Product showcase, not text forum
- Card-first UI
- Media-first
- Clear Try CTA on every card and project detail
```

## 8. 시작 권장 순서

문서 기준으로 실제 작업을 바로 시작한다면 아래 순서를 권장한다.

1. 프로젝트 구조와 라우팅 생성
2. 카드 UI와 상세 UI 먼저 구현
3. 데이터 모델과 리스트/상세 조회 API 연결
4. 등록 플로우와 owner 연결 흐름 연결
5. 댓글, 저장, 신고 추가
6. 검색/필터/랭킹 추가

## 9. 최종 메모

현재 단계에서 가장 중요한 것은 기획을 더 넓히는 것이 아니라, 이미 정한 범위를 흔들리지 않게 구현 가능한 단위로 계속 쪼개는 것이다.

즉, 지금부터의 우선순위는 "추가 아이디어 수집"이 아니라 "문서 기준 구현"이다.
