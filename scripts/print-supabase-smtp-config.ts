import { loadLocalEnv } from "../tests/e2e/load-env";

loadLocalEnv();

async function main() {
  const { mailFrom, mailFromName, resendApiKey } = await import("../src/lib/env");

  if (!mailFrom) {
    throw new Error("MAIL_FROM 이 비어 있습니다. .env 에 발신 이메일 주소를 먼저 설정해 주세요.");
  }

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY 가 비어 있습니다. .env 에 Resend API key 를 먼저 설정해 주세요.");
  }

  console.log(`
[Supabase Custom SMTP 설정값]

1. Supabase 경로
- Authentication -> Email -> SMTP Settings

2. 입력값
- Host: smtp.resend.com
- Port: 465
- Username: resend
- Password: .env 의 RESEND_API_KEY 값 사용
- Sender email: ${mailFrom}
- Sender name: ${mailFromName}

3. 저장 후 검증
- /auth/sign-in 에서 "처음 시작하기" 실행
- 수신 메일 발신자가 ${mailFrom} 인지 확인
- 링크 클릭 후 비밀번호 설정 화면 진입 확인
- "비밀번호 재설정" 메일도 같은 발신자로 오는지 확인

4. 주의
- Supabase 기본 메일 rate limit 를 피하려면 반드시 SMTP Settings 저장까지 완료해야 합니다.
- 이전에 받은 구버전 링크는 재사용하지 말고 새 인증 메일을 발급해 확인하세요.
`.trim());
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
