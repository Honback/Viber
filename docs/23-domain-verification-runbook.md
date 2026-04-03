# 도메인 확인 런북

## 1. 문서 목적

이 문서는 프로젝트 `domain_verified` 배지를 실제로 발급하는 TXT 기반 도메인 확인 절차를 정리한다.

## 2. 동작 방식

1. owner 또는 admin 이 `/me/projects` 에서 `토큰 발급` 버튼을 누른다.
2. 서버가 `live_url` 에서 등록 가능 도메인을 추출한다.
3. 서버가 `_viber-verify.<registrable-domain>` TXT 레코드 이름과 단일 토큰을 발급한다.
4. owner 가 DNS 에 TXT 레코드를 추가한다.
5. `지금 검증하기` 버튼을 누르면 서버가 DNS TXT 값을 조회한다.
6. 토큰이 일치하면 프로젝트 `verification_state` 가 `domain_verified` 로 바뀐다.

## 3. 대상 경로

- owner 화면: `/me/projects`
- API 토큰 발급: `POST /api/projects/[id]/domain-verification/issue`
- API 검증 실행: `POST /api/projects/[id]/domain-verification/verify`

## 4. TXT 규칙

- 레코드 이름: `_viber-verify.<registrable-domain>`
- 레코드 값: 서버가 발급한 단일 토큰

예:

- `live_url`: `https://app.vibehub.co.kr`
- registrable domain: `vibehub.co.kr`
- TXT name: `_viber-verify.vibehub.co.kr`

## 5. 제한 사항

다음 대상은 검증하지 않는다.

- `localhost`
- `127.0.0.1`
- `vercel.app`
- `github.io`
- `notion.site`
- `supabase.co`

이유:

- 제출자가 DNS 를 직접 제어하지 못하는 공유 호스트이기 때문이다.

## 6. live URL 변경 규칙

- `domain_verified` 상태의 프로젝트가 다른 등록 가능 도메인으로 `live_url` 을 바꾸면 기존 도메인 확인은 자동 무효화된다.
- 같은 등록 가능 도메인 안에서 서브도메인만 바뀌는 경우에는 기존 확인 상태를 유지한다.

## 7. 로컬 검증 보조 명령

현재 로컬 DB에서 owner 프로젝트를 하나 준비하고 토큰을 발급하려면 아래 명령을 실행한다.

```bash
npm run domain:check-flow
```

이 명령은 다음을 출력한다.

- owner 이메일
- 프로젝트 slug
- `/me/projects` 확인 경로
- TXT 레코드 이름
- TXT 값

## 8. 현재 결론

도메인 확인 기능은 구현 완료 상태다.
남은 것은 owner 가 실제 DNS 에 TXT 레코드를 넣고 `/me/projects` 에서 검증을 실행하는 것이다.
