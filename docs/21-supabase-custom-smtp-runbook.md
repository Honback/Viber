# Supabase Custom SMTP 전환 런북

## 1. 문서 목적

이 문서는 Supabase Auth 인증 메일을 기본 Supabase 메일 서버에서 Resend SMTP 로 전환하는 실행 런북이다.

대상 메일:

- 최초 이메일 인증 메일
- 비밀번호 재설정 메일
- 이메일 기반 로그인 보조 메일

## 2. 현재 준비 상태

이미 완료된 항목:

- `vibehub.co.kr` 발신 도메인 구매 완료
- Resend 도메인 검증 완료
- Resend `Enable Sending` 레코드 검증 완료
- 앱 메일 경로는 `MAIL_DELIVERY_MODE=live`, `MAIL_FROM=noreply@vibehub.co.kr` 기준으로 실발송 확인 완료

지금 남은 항목:

- Supabase 대시보드의 `Authentication -> Email -> SMTP Settings` 에 Resend SMTP 값 저장
- 저장 후 실제 인증 메일 발신자 확인

## 3. 입력값

Supabase 대시보드 입력값은 아래로 고정한다.

- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: `.env` 의 `RESEND_API_KEY`
- Sender email: `noreply@vibehub.co.kr`
- Sender name: `VibeHub`

## 4. 설정 경로

1. Supabase 프로젝트 진입
2. `Authentication`
3. `Email`
4. `SMTP Settings`
5. 위 값을 저장

## 5. 저장 후 검증 절차

### A. 최초 인증 메일

1. `/auth/sign-in` 진입
2. `처음 시작하기` 에 이메일 입력
3. 수신 메일의 발신자가 `noreply@vibehub.co.kr` 인지 확인
4. 메일 링크 클릭
5. `/auth/password/setup` 화면 진입 확인
6. 비밀번호 설정 후 로그인 완료 확인

### B. 비밀번호 재설정 메일

1. `/auth/sign-in` 진입
2. `비밀번호 재설정` 실행
3. 수신 메일의 발신자가 `noreply@vibehub.co.kr` 인지 확인
4. 메일 링크 클릭
5. 비밀번호 재설정 화면 진입 확인
6. 새 비밀번호로 로그인 확인

## 6. 기대 효과

- Supabase 기본 메일 서버의 강한 rate limit 의존도를 줄일 수 있다.
- 인증 메일 발신자가 서비스 도메인으로 통일된다.
- 앱 메일과 인증 메일의 발신 도메인이 맞춰져 신뢰도가 올라간다.

## 7. 실패 시 확인 포인트

### 메일이 여전히 기본 Supabase 발신자로 오는 경우

- SMTP Settings 저장이 실제로 완료되지 않았을 가능성이 크다.
- Sender email 과 SMTP host/port 값이 비어 있지 않은지 다시 확인한다.

### 새 메일에서도 오래된 경로가 열리는 경우

- 이전에 받아둔 메일 링크를 열었을 가능성이 크다.
- 새 인증 메일을 다시 요청해 새 링크로 확인한다.

### 메일이 오지 않는 경우

- Resend 대시보드의 로그를 확인한다.
- `MAIL_FROM` 도메인 검증 상태를 다시 확인한다.
- 수신 메일함의 스팸함을 함께 확인한다.

## 8. 로컬 보조 명령

아래 명령은 현재 `.env` 기준으로 Supabase 대시보드에 넣을 값을 다시 출력한다.

```bash
npm run auth:smtp:print
```

## 9. 현재 결론

코드 기준 준비는 끝났다.
지금 단계의 남은 일은 Supabase 대시보드 입력과 실제 수신 메일 검증이다.
