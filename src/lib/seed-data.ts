import { addDays, subDays, subHours } from "date-fns";

type SeedProfile = {
  id: string;
  email: string;
  displayName: string;
  githubUsername?: string;
  role: "member" | "admin";
};

type SeedProject = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  shortDescription: string;
  overviewMd: string;
  problemMd: string;
  targetUsersMd: string;
  whyMadeMd: string;
  stage: "alpha" | "beta" | "live";
  category: string;
  platform: "web" | "mobile" | "desktop";
  pricingModel: "free" | "freemium" | "paid" | "custom";
  pricingNote?: string;
  liveUrl: string;
  githubUrl?: string;
  demoUrl?: string;
  docsUrl?: string;
  makerAlias: string;
  coverImageUrl: string;
  gallery: string[];
  isOpenSource: boolean;
  noSignupRequired: boolean;
  isSoloMaker: boolean;
  aiTools: string[];
  verificationState: "unverified" | "github_verified" | "domain_verified";
  status: "pending" | "published" | "limited" | "hidden" | "rejected" | "archived";
  featured?: boolean;
  featuredOrder?: number | null;
  publishedAt: Date;
  lastActivityAt: Date;
  tags: string[];
  ownerUserId?: string | null;
  ownerVerificationMethod: "email" | "github";
  posts: {
    id: string;
    type: "launch" | "update" | "feedback";
    title: string;
    summary: string;
    bodyMd: string;
    requestedFeedbackMd?: string | null;
    media: string[];
    status: "pending" | "published" | "hidden";
    publishedAt: Date;
    authorUserId?: string | null;
  }[];
  comments: Array<
    | {
        id: string;
        userId: string;
        guestName?: never;
        guestSessionHash?: never;
        bodyMd: string;
        postId?: string | null;
        parentId?: string | null;
        status?: "active" | "hidden" | "deleted";
        createdAt: Date;
      }
    | {
        id: string;
        userId?: null;
        guestName: string;
        guestSessionHash: string;
        bodyMd: string;
        postId?: string | null;
        parentId?: string | null;
        status?: "active" | "hidden" | "deleted";
        createdAt: Date;
      }
  >;
  linkHealth: {
    status: "unknown" | "healthy" | "degraded" | "broken";
    httpStatus?: number | null;
    failureCount?: number;
    note?: string | null;
  };
};

const adminId = "00000000-0000-4000-8000-000000000001";
const memberId = "00000000-0000-4000-8000-000000000002";

const svgToDataUri = (svg: string) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const buildPoster = (title: string, accent: string, label: string) =>
  svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
      <rect width="1200" height="760" fill="#f6f3ee" />
      <rect x="44" y="44" width="1112" height="672" rx="28" fill="#fffdf9" stroke="#e7ded2" />
      <rect x="84" y="84" width="250" height="592" rx="24" fill="${accent}" />
      <rect x="380" y="104" width="200" height="36" rx="18" fill="#efe8de" />
      <text x="480" y="128" text-anchor="middle" font-size="18" font-weight="700" fill="#334155">${label}</text>
      <text x="380" y="278" fill="#111827" font-size="84" font-weight="700" font-family="Arial">${title}</text>
      <text x="380" y="344" fill="#5b6473" font-size="30" font-family="Arial">바로 체험하고 피드백을 남기는 프로젝트 허브</text>
      <rect x="380" y="414" width="188" height="60" rx="18" fill="#111827" />
      <text x="474" y="452" text-anchor="middle" fill="#fffdf9" font-size="24" font-weight="700">Try</text>
      <rect x="592" y="414" width="214" height="60" rx="18" fill="#f4efe7" stroke="#ddd3c5" />
      <text x="699" y="452" text-anchor="middle" fill="#334155" font-size="24" font-weight="700">Update</text>
    </svg>
  `);

const galleryPoster = (title: string, label: string, accent: string) =>
  svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760">
      <rect width="1200" height="760" fill="#f6f3ee" />
      <rect x="44" y="44" width="1112" height="672" rx="28" fill="#fffdf9" stroke="#e7ded2" />
      <rect x="88" y="88" width="1024" height="92" rx="24" fill="#f3ece2" />
      <rect x="88" y="220" width="640" height="396" rx="24" fill="${accent}" />
      <rect x="764" y="220" width="160" height="182" rx="24" fill="#efe6d7" />
      <rect x="952" y="220" width="160" height="182" rx="24" fill="#e5dbc8" />
      <rect x="764" y="434" width="348" height="182" rx="24" fill="#f7f2eb" stroke="#e4d9ca" />
      <text x="126" y="146" fill="#111827" font-size="56" font-weight="700" font-family="Arial">${title}</text>
      <text x="126" y="662" fill="#5b6473" font-size="28" font-family="Arial">${label}</text>
    </svg>
  `);

const mediaSet = (title: string, accent: string, label: string) => [
  buildPoster(title, accent, label),
  galleryPoster(title, `${label} 화면 미리보기`, accent),
  galleryPoster(title, `${label} 상세 흐름`, "#e5dbc8")
];

export const seedProfiles: SeedProfile[] = [
  {
    id: adminId,
    email: "admin@local.test",
    displayName: "운영 관리자",
    githubUsername: "admin-local",
    role: "admin"
  },
  {
    id: memberId,
    email: "member@local.test",
    displayName: "데모 메이커",
    githubUsername: "maker-local",
    role: "member"
  }
];

const baseProjects: SeedProject[] = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    slug: "focus-flow",
    title: "Focus Flow",
    tagline: "작은 팀의 스탠드업을 AI 카드 흐름으로 정리하는 경량 작업 보드",
    shortDescription: "메모, 회의, 채팅에 흩어진 작업을 짧은 실행 카드로 다시 묶는 프로젝트 관리 도구입니다.",
    overviewMd: "Focus Flow는 작은 제품 팀이 복잡한 툴 대신 핵심 작업 흐름만 유지하도록 설계된 경량 협업 보드입니다.",
    problemMd: "작은 팀은 도구가 많아질수록 관리 비용이 커지고, 정작 해야 할 일은 더 늦게 보입니다.",
    targetUsersMd: "2인에서 10인 사이의 제품 팀, 에이전시, 사이드 프로젝트 메이커를 위한 도구입니다.",
    whyMadeMd: "여러 제품을 동시에 운영하면서 상태 공유와 다음 액션 정리가 가장 큰 병목이라는 걸 반복해서 겪었기 때문에 만들었습니다.",
    stage: "beta",
    category: "productivity",
    platform: "web",
    pricingModel: "freemium",
    pricingNote: "개인용 무료, 팀 히스토리 기능은 부분 유료",
    liveUrl: "https://focus-flow.local.test",
    githubUrl: "https://github.com/local/focus-flow",
    demoUrl: "https://focus-flow.local.test/demo",
    docsUrl: "https://focus-flow.local.test/docs",
    makerAlias: "Loop Studio",
    coverImageUrl: mediaSet("Focus Flow", "#d46a52", "생산성")[0],
    gallery: mediaSet("Focus Flow", "#d46a52", "생산성"),
    isOpenSource: false,
    noSignupRequired: true,
    isSoloMaker: true,
    aiTools: ["GPT-5.4", "Cursor", "Claude"],
    verificationState: "github_verified",
    status: "published",
    featured: true,
    featuredOrder: 1,
    publishedAt: subDays(new Date(), 14),
    lastActivityAt: subHours(new Date(), 6),
    tags: ["web", "productivity", "beta", "no-signup"],
    ownerUserId: memberId,
    ownerVerificationMethod: "github",
    posts: [
      {
        id: "00000000-0000-4000-8000-000000000301",
        type: "launch",
        title: "Focus Flow 공개",
        summary: "회의 이후 다음 액션이 자동으로 카드화되는 첫 버전을 공개했습니다.",
        bodyMd: "스탠드업 메모를 AI가 바로 카드 보드로 변환하고, 오늘 처리할 우선순위를 다시 정렬합니다.",
        media: mediaSet("Focus Flow", "#d46a52", "생산성"),
        status: "published",
        publishedAt: subDays(new Date(), 14)
      },
      {
        id: "00000000-0000-4000-8000-000000000302",
        type: "update",
        title: "회의 요약에서 카드 생성 품질 개선",
        summary: "중복 카드 병합과 담당자 추출 정확도를 높였습니다.",
        bodyMd: "회의 텍스트에서 중복 카드가 과하게 생성되던 문제를 줄이고, 담당자 추정 규칙을 추가했습니다.",
        media: [mediaSet("Focus Flow", "#d46a52", "업데이트")[1]],
        status: "published",
        publishedAt: subHours(new Date(), 6)
      }
    ],
    comments: [
      {
        id: "00000000-0000-4000-8000-000000000601",
        userId: adminId,
        bodyMd: "온보딩 첫 단계가 가볍고, Try 클릭 이후 바로 카드 샘플이 보이는 점이 좋습니다.",
        postId: "00000000-0000-4000-8000-000000000302",
        createdAt: subHours(new Date(), 5)
      },
      {
        id: "00000000-0000-4000-8000-000000000602",
        guestName: "첫 방문 사용자",
        guestSessionHash: "seed-guest-focus-flow",
        bodyMd: "비회원으로도 둘러볼 수 있어서 좋았지만, 첫 카드가 왜 추천됐는지 짧은 설명이 있으면 더 이해하기 쉬울 것 같습니다.",
        createdAt: subHours(new Date(), 4)
      }
    ],
    linkHealth: {
      status: "healthy",
      httpStatus: 200,
      failureCount: 0
    }
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    slug: "canvas-care",
    title: "Canvas Care",
    tagline: "보호자와 간병인이 하루 상태를 한 화면으로 공유하는 돌봄 로그 앱",
    shortDescription: "복약, 컨디션, 메모, 병원 일정까지 한 줄 타임라인으로 정리해 주는 모바일 중심 서비스입니다.",
    overviewMd: "Canvas Care는 보호자와 간병인이 같은 사람의 하루 상태를 빠르게 공유할 수 있게 만드는 모바일 중심 돌봄 로그 앱입니다.",
    problemMd: "돌봄 정보가 카톡, 메모, 통화로 흩어져 있으면 실제로 필요한 순간에 최신 상태를 알기 어렵습니다.",
    targetUsersMd: "가족 돌봄, 요양 보조, 방문 간호와 같이 여러 사람이 같은 정보를 공유해야 하는 사용자입니다.",
    whyMadeMd: "가족 돌봄 과정에서 실제 상태 공유가 가장 기본인데도 가장 비효율적이라는 걸 경험해 만들었습니다.",
    stage: "beta",
    category: "health",
    platform: "mobile",
    pricingModel: "free",
    liveUrl: "https://canvas-care.local.test",
    githubUrl: "",
    demoUrl: "https://canvas-care.local.test/demo",
    docsUrl: "",
    makerAlias: "Care Plot",
    coverImageUrl: mediaSet("Canvas Care", "#4f8275", "돌봄")[0],
    gallery: mediaSet("Canvas Care", "#4f8275", "돌봄"),
    isOpenSource: false,
    noSignupRequired: false,
    isSoloMaker: false,
    aiTools: ["GPT-5.4", "v0"],
    verificationState: "domain_verified",
    status: "published",
    featured: true,
    featuredOrder: 2,
    publishedAt: subDays(new Date(), 21),
    lastActivityAt: subDays(new Date(), 2),
    tags: ["mobile", "health", "beta"],
    ownerUserId: memberId,
    ownerVerificationMethod: "email",
    posts: [
      {
        id: "00000000-0000-4000-8000-000000000303",
        type: "launch",
        title: "Canvas Care 런치",
        summary: "복약과 컨디션 체크를 한 줄 타임라인으로 모아보는 첫 공개입니다.",
        bodyMd: "보호자에게 필요한 정보만 남기고, 사진과 메모를 순서대로 남길 수 있게 만들었습니다.",
        media: mediaSet("Canvas Care", "#4f8275", "돌봄"),
        status: "published",
        publishedAt: subDays(new Date(), 21)
      },
      {
        id: "00000000-0000-4000-8000-000000000304",
        type: "feedback",
        title: "상태 체크 언어 톤에 대한 피드백 요청",
        summary: "너무 의료적으로 들리지 않으면서도 정확한 문구를 찾고 있습니다.",
        bodyMd: "보호자가 빠르게 체크할 수 있는 상태 라벨이 필요한데, 가볍게 보이면서도 오해가 없어야 합니다.",
        requestedFeedbackMd: "온보딩 이후 첫 상태 입력 단계가 직관적인지, 라벨 표현이 과한지 봐주세요.",
        media: [mediaSet("Canvas Care", "#4f8275", "피드백")[1]],
        status: "published",
        publishedAt: subDays(new Date(), 2)
      }
    ],
    comments: [
      {
        id: "00000000-0000-4000-8000-000000000603",
        userId: adminId,
        bodyMd: "상태 라벨은 지금보다 조금 더 일상적인 표현이 좋을 것 같습니다.",
        postId: "00000000-0000-4000-8000-000000000304",
        createdAt: subDays(new Date(), 1)
      }
    ],
    linkHealth: {
      status: "healthy",
      httpStatus: 200
    }
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    slug: "prompt-sprint",
    title: "Prompt Sprint",
    tagline: "AI 에이전트 실험을 반복 실행하고 결과를 비교하는 개발자용 실행 보드",
    shortDescription: "프롬프트, 모델, 평가 결과를 같은 화면에서 비교해 실험 루프를 짧게 가져가는 데 집중했습니다.",
    overviewMd: "Prompt Sprint는 모델별 프롬프트 실험 결과를 비교하고 회귀를 빠르게 찾게 해주는 개발자용 실행 보드입니다.",
    problemMd: "프롬프트 실험은 반복이 많은데 기록이 흩어지면 어떤 조합이 나아졌는지 기억하기 어렵습니다.",
    targetUsersMd: "에이전트, 평가, 프롬프트 버전 관리가 필요한 개발자와 메이커를 위한 도구입니다.",
    whyMadeMd: "실험마다 결과를 복사해 스프레드시트로 정리하는 작업이 너무 느려서 만들었습니다.",
    stage: "live",
    category: "developer-tools",
    platform: "web",
    pricingModel: "free",
    liveUrl: "https://prompt-sprint.local.test",
    githubUrl: "https://github.com/local/prompt-sprint",
    makerAlias: "Trace Forge",
    coverImageUrl: mediaSet("Prompt Sprint", "#6c748f", "개발")[0],
    gallery: mediaSet("Prompt Sprint", "#6c748f", "개발"),
    isOpenSource: true,
    noSignupRequired: true,
    isSoloMaker: true,
    aiTools: ["GPT-5.4", "OpenRouter"],
    verificationState: "github_verified",
    status: "published",
    featured: true,
    featuredOrder: 3,
    publishedAt: subDays(new Date(), 11),
    lastActivityAt: subHours(new Date(), 20),
    tags: ["web", "developer-tools", "open-source", "free"],
    ownerUserId: memberId,
    ownerVerificationMethod: "github",
    posts: [
      {
        id: "00000000-0000-4000-8000-000000000305",
        type: "launch",
        title: "Prompt Sprint 출시",
        summary: "프롬프트 버전별 결과를 표와 카드로 동시에 볼 수 있는 첫 버전입니다.",
        bodyMd: "실험군을 비교하고 회귀를 빠르게 찾을 수 있도록 리스트와 상세 패널을 함께 구성했습니다.",
        media: mediaSet("Prompt Sprint", "#6c748f", "개발"),
        status: "published",
        publishedAt: subDays(new Date(), 11)
      },
      {
        id: "00000000-0000-4000-8000-000000000306",
        type: "update",
        title: "실험 결과 diff 뷰 추가",
        summary: "두 실행 결과의 차이를 바로 볼 수 있도록 했습니다.",
        bodyMd: "모델 응답 길이, 평가 점수, 회귀 항목을 나란히 비교할 수 있도록 diff 패널을 추가했습니다.",
        media: [mediaSet("Prompt Sprint", "#6c748f", "업데이트")[1]],
        status: "published",
        publishedAt: subHours(new Date(), 20)
      }
    ],
    comments: [],
    linkHealth: {
      status: "healthy",
      httpStatus: 200
    }
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    slug: "mint-minute",
    title: "Mint Minute",
    tagline: "짧은 영상용 스크립트와 컷 구성안을 동시에 제안하는 크리에이터 도구",
    shortDescription: "주제만 입력하면 30초짜리 영상 기획, 장면 구분, 후킹 문장을 함께 정리합니다.",
    overviewMd: "Mint Minute는 크리에이터가 짧은 영상 아이디어를 빠르게 테스트할 수 있도록 스크립트와 컷 구조를 동시에 제안하는 도구입니다.",
    problemMd: "짧은 영상 기획은 속도가 중요한데, 아이디어가 생겨도 컷 구성과 후킹 문장을 따로 정리하면 흐름이 끊깁니다.",
    targetUsersMd: "릴스, 쇼츠, 틱톡처럼 짧은 영상 포맷을 자주 다루는 1인 크리에이터와 팀을 위한 서비스입니다.",
    whyMadeMd: "직접 콘텐츠를 만들 때 영상 기획의 첫 10분을 줄이는 것이 가장 가치 있다고 느껴 만들었습니다.",
    stage: "beta",
    category: "creator",
    platform: "web",
    pricingModel: "freemium",
    liveUrl: "https://mint-minute.local.test",
    githubUrl: "",
    makerAlias: "MintLab",
    coverImageUrl: mediaSet("Mint Minute", "#c97d47", "크리에이터")[0],
    gallery: mediaSet("Mint Minute", "#c97d47", "크리에이터"),
    isOpenSource: false,
    noSignupRequired: false,
    isSoloMaker: true,
    aiTools: ["GPT-5.4", "Runway"],
    verificationState: "unverified",
    status: "limited",
    publishedAt: subDays(new Date(), 9),
    lastActivityAt: subDays(new Date(), 1),
    tags: ["web", "creator", "beta"],
    ownerUserId: memberId,
    ownerVerificationMethod: "email",
    posts: [
      {
        id: "00000000-0000-4000-8000-000000000307",
        type: "launch",
        title: "Mint Minute 공개",
        summary: "아이디어에서 컷 구성까지 이어지는 짧은 영상 기획 도구입니다.",
        bodyMd: "훅 문장, 장면 전환, 엔딩 CTA까지 한 번에 이어서 확인할 수 있게 했습니다.",
        media: mediaSet("Mint Minute", "#c97d47", "크리에이터"),
        status: "published",
        publishedAt: subDays(new Date(), 9)
      }
    ],
    comments: [],
    linkHealth: {
      status: "degraded",
      httpStatus: 429,
      failureCount: 1,
      note: "체험 페이지 응답이 느려 제한 공개 상태"
    }
  },
  {
    id: "00000000-0000-4000-8000-000000000105",
    slug: "lesson-loop",
    title: "Lesson Loop",
    tagline: "학생 질문을 모아 다음 수업 설계에 반영하는 교사용 수업 피드백 보드",
    shortDescription: "과제, 질문, 다음 수업 포인트를 한 화면에서 볼 수 있는 교사용 회고 도구입니다.",
    overviewMd: "Lesson Loop는 학생 질문과 수업 회고를 다음 강의 설계로 이어주기 위한 교육용 피드백 보드입니다.",
    problemMd: "수업 피드백은 쌓이지만 다음 수업 설계로 자연스럽게 연결되는 도구는 많지 않습니다.",
    targetUsersMd: "온라인 강사, 부트캠프 멘토, 학습 콘텐츠 제작자에게 적합합니다.",
    whyMadeMd: "질문 수집은 되는데 다음 수업 구조에 반영하기가 너무 수동적이어서 만들었습니다.",
    stage: "alpha",
    category: "education",
    platform: "web",
    pricingModel: "free",
    liveUrl: "https://lesson-loop.local.test",
    githubUrl: "https://github.com/local/lesson-loop",
    makerAlias: "Lesson Studio",
    coverImageUrl: mediaSet("Lesson Loop", "#59758f", "교육")[0],
    gallery: mediaSet("Lesson Loop", "#59758f", "교육"),
    isOpenSource: true,
    noSignupRequired: true,
    isSoloMaker: false,
    aiTools: ["GPT-5.4"],
    verificationState: "github_verified",
    status: "published",
    featured: true,
    featuredOrder: 4,
    publishedAt: subDays(new Date(), 5),
    lastActivityAt: subHours(new Date(), 10),
    tags: ["web", "education", "open-source", "no-signup"],
    ownerUserId: adminId,
    ownerVerificationMethod: "github",
    posts: [
      {
        id: "00000000-0000-4000-8000-000000000308",
        type: "launch",
        title: "Lesson Loop 알파 런치",
        summary: "수업 피드백과 다음 액션을 한 번에 묶는 첫 공개입니다.",
        bodyMd: "질문을 태깅하고 다음 수업 계획 카드로 바로 옮길 수 있게 했습니다.",
        media: mediaSet("Lesson Loop", "#59758f", "교육"),
        status: "published",
        publishedAt: subDays(new Date(), 5)
      },
      {
        id: "00000000-0000-4000-8000-000000000309",
        type: "feedback",
        title: "멘토 피드백 흐름 검증 요청",
        summary: "질문 분류 단계가 너무 길지 않은지 확인하고 싶습니다.",
        bodyMd: "학생 질문을 받은 뒤 태그를 다는 단계가 실제 현장에서 과하지 않은지 알고 싶습니다.",
        requestedFeedbackMd: "질문 분류 이후 다음 수업 카드 생성 흐름을 직접 눌러보고 시간 감각을 알려주세요.",
        media: [mediaSet("Lesson Loop", "#59758f", "피드백")[2]],
        status: "published",
        publishedAt: subHours(new Date(), 10)
      }
    ],
    comments: [],
    linkHealth: {
      status: "healthy",
      httpStatus: 200
    }
  },
  {
    id: "00000000-0000-4000-8000-000000000106",
    slug: "patch-pulse",
    title: "Patch Pulse",
    tagline: "서비스 변경로그를 사용자 가치 중심 카드로 재구성하는 릴리스 노트 허브",
    shortDescription: "개발자용 changelog를 사용자 친화적인 카드와 타임라인으로 다시 풀어내는 서비스입니다.",
    overviewMd: "Patch Pulse는 제품 업데이트를 기능 나열이 아니라 사용자 가치 중심 스토리로 보여주는 changelog 허브입니다.",
    problemMd: "많은 팀이 릴리스 노트를 쓰지만 사용자는 무엇이 달라졌는지 읽기 어렵습니다.",
    targetUsersMd: "SaaS 팀, 초기 제품을 운영하는 메이커, changelog를 제대로 관리하려는 팀을 위한 도구입니다.",
    whyMadeMd: "업데이트는 자주 하지만 제대로 읽히는 릴리스 노트를 만드는 팀은 드물다는 문제에서 출발했습니다.",
    stage: "live",
    category: "developer-tools",
    platform: "desktop",
    pricingModel: "paid",
    pricingNote: "팀당 월 정액",
    liveUrl: "https://patch-pulse.local.test",
    githubUrl: "",
    makerAlias: "Patchnote",
    coverImageUrl: mediaSet("Patch Pulse", "#7a6157", "릴리스")[0],
    gallery: mediaSet("Patch Pulse", "#7a6157", "릴리스"),
    isOpenSource: false,
    noSignupRequired: false,
    isSoloMaker: false,
    aiTools: ["GPT-5.4", "Cursor"],
    verificationState: "domain_verified",
    status: "archived",
    publishedAt: subDays(new Date(), 40),
    lastActivityAt: subDays(new Date(), 25),
    tags: ["desktop", "developer-tools"],
    ownerUserId: adminId,
    ownerVerificationMethod: "email",
    posts: [
      {
        id: "00000000-0000-4000-8000-000000000310",
        type: "launch",
        title: "Patch Pulse 초기 공개",
        summary: "릴리스 노트를 제품 카드 중심으로 재구성하는 데스크톱 도구입니다.",
        bodyMd: "팀 changelog를 import한 뒤 사용자 관점 카드로 바꾸는 워크플로를 지원했습니다.",
        media: mediaSet("Patch Pulse", "#7a6157", "릴리스"),
        status: "published",
        publishedAt: subDays(new Date(), 40)
      }
    ],
    comments: [],
    linkHealth: {
      status: "broken",
      httpStatus: 404,
      failureCount: 4,
      note: "장기간 미운영으로 보관 처리"
    }
  },
  {
    id: "00000000-0000-4000-8000-000000000107",
    slug: "signal-shelf",
    title: "Signal Shelf",
    tagline: "커뮤니티 반응을 카드로 모아 제품 인사이트로 바꾸는 리서치 선반",
    shortDescription: "Reddit, X, Discord 요약을 프로젝트별 인사이트 카드로 정리합니다.",
    overviewMd: "Signal Shelf는 흩어진 커뮤니티 반응을 제품 인사이트 카드로 묶어 팀이 빠르게 공유하게 해주는 리서치 선반입니다.",
    problemMd: "커뮤니티 반응은 많지만 어떤 의견이 실제 제품 의사결정과 연결되는지 정리하기 어렵습니다.",
    targetUsersMd: "초기 제품 팀, PM, 리서처, 메이커가 빠르게 시장 반응을 읽기 위해 사용합니다.",
    whyMadeMd: "커뮤니티 리서치를 매번 노션에 복붙하는 과정이 너무 느려 자동화하고 싶었습니다.",
    stage: "beta",
    category: "productivity",
    platform: "web",
    pricingModel: "freemium",
    liveUrl: "https://signal-shelf.local.test",
    githubUrl: "https://github.com/local/signal-shelf",
    makerAlias: "Signal Room",
    coverImageUrl: mediaSet("Signal Shelf", "#4f6f8d", "리서치")[0],
    gallery: mediaSet("Signal Shelf", "#4f6f8d", "리서치"),
    isOpenSource: true,
    noSignupRequired: false,
    isSoloMaker: true,
    aiTools: ["GPT-5.4", "LangGraph"],
    verificationState: "github_verified",
    status: "published",
    featured: true,
    featuredOrder: 5,
    publishedAt: subDays(new Date(), 7),
    lastActivityAt: subHours(new Date(), 3),
    tags: ["web", "productivity", "open-source"],
    ownerUserId: memberId,
    ownerVerificationMethod: "github",
    posts: [
      {
        id: "00000000-0000-4000-8000-000000000311",
        type: "launch",
        title: "Signal Shelf 베타 공개",
        summary: "커뮤니티 반응을 기능 요청 카드로 묶는 워크플로를 공개했습니다.",
        bodyMd: "의견을 주제별로 클러스터링한 뒤, 바로 팀이 토론할 수 있는 카드로 정리합니다.",
        media: mediaSet("Signal Shelf", "#4f6f8d", "리서치"),
        status: "published",
        publishedAt: subDays(new Date(), 7)
      },
      {
        id: "00000000-0000-4000-8000-000000000312",
        type: "update",
        title: "프로젝트별 인사이트 보드 추가",
        summary: "여러 제품을 나눠서 볼 수 있는 보드 뷰를 추가했습니다.",
        bodyMd: "프로젝트별 카드 필터와 최근성 정렬을 제공해 여러 제품을 동시에 보기 쉽게 만들었습니다.",
        media: [mediaSet("Signal Shelf", "#4f6f8d", "업데이트")[1]],
        status: "published",
        publishedAt: subHours(new Date(), 3)
      }
    ],
    comments: [],
    linkHealth: {
      status: "healthy",
      httpStatus: 200
    }
  },
  {
    id: "00000000-0000-4000-8000-000000000108",
    slug: "studio-lane",
    title: "Studio Lane",
    tagline: "소규모 제작팀을 위한 촬영 일정과 체크리스트 보드",
    shortDescription: "촬영 일정, 소품 체크, 현장 메모를 한 보드에서 관리합니다.",
    overviewMd: "Studio Lane은 영상 제작팀이 촬영 일정과 현장 체크리스트를 한 보드에서 함께 관리하게 해주는 도구입니다.",
    problemMd: "현장 준비 정보가 문서와 채팅으로 흩어져 있으면 체크리스트가 빠르게 낡습니다.",
    targetUsersMd: "작은 영상 제작팀, 브랜드 인하우스 콘텐츠 팀, 프리랜서 촬영 팀에 적합합니다.",
    whyMadeMd: "현장 체크리스트가 늘 카톡방 위로 사라지는 경험에서 출발했습니다.",
    stage: "beta",
    category: "creator",
    platform: "mobile",
    pricingModel: "paid",
    liveUrl: "https://studio-lane.local.test",
    githubUrl: "",
    makerAlias: "Studio Lane",
    coverImageUrl: mediaSet("Studio Lane", "#6d7f56", "제작")[0],
    gallery: mediaSet("Studio Lane", "#6d7f56", "제작"),
    isOpenSource: false,
    noSignupRequired: false,
    isSoloMaker: false,
    aiTools: ["GPT-5.4"],
    verificationState: "domain_verified",
    status: "pending",
    publishedAt: subDays(new Date(), 1),
    lastActivityAt: subHours(new Date(), 12),
    tags: ["mobile", "creator", "beta"],
    ownerUserId: null,
    ownerVerificationMethod: "email",
    posts: [
      {
        id: "00000000-0000-4000-8000-000000000313",
        type: "launch",
        title: "Studio Lane 제출",
        summary: "촬영 준비용 모바일 보드를 검수 대기 상태로 올렸습니다.",
        bodyMd: "촬영 전 체크리스트와 현장 노트를 같은 흐름으로 묶는 베타 버전입니다.",
        media: mediaSet("Studio Lane", "#6d7f56", "제작"),
        status: "pending",
        publishedAt: subHours(new Date(), 12)
      }
    ],
    comments: [],
    linkHealth: {
      status: "unknown"
    }
  },
  {
    id: "00000000-0000-4000-8000-000000000109",
    slug: "quiet-quarry",
    title: "Quiet Quarry",
    tagline: "소음 기록과 집중 시간을 함께 관리하는 조용한 작업 타이머",
    shortDescription: "집중 시간과 주변 소음 기록을 같이 남겨 작업 환경 패턴을 찾습니다.",
    overviewMd: "Quiet Quarry는 집중 타이머와 소음 로그를 같이 기록해 어떤 환경에서 작업이 잘 되는지 찾는 도구입니다.",
    problemMd: "집중은 시간만 관리해서는 안 되고, 환경과 맥락을 같이 기록해야 패턴을 찾을 수 있습니다.",
    targetUsersMd: "혼자 일하는 메이커, 집중 환경을 개선하고 싶은 원격 근무자에게 적합합니다.",
    whyMadeMd: "집중 시간만 체크하는 앱은 많지만 왜 그 시간이 잘 나왔는지 알려주지 않아 만들었습니다.",
    stage: "alpha",
    category: "productivity",
    platform: "desktop",
    pricingModel: "free",
    liveUrl: "https://quiet-quarry.local.test",
    githubUrl: "https://github.com/local/quiet-quarry",
    makerAlias: "Quiet Tools",
    coverImageUrl: mediaSet("Quiet Quarry", "#84625d", "집중")[0],
    gallery: mediaSet("Quiet Quarry", "#84625d", "집중"),
    isOpenSource: true,
    noSignupRequired: true,
    isSoloMaker: true,
    aiTools: ["GPT-5.4"],
    verificationState: "github_verified",
    status: "published",
    publishedAt: subDays(new Date(), 3),
    lastActivityAt: subHours(new Date(), 14),
    tags: ["desktop", "productivity", "open-source", "free"],
    ownerUserId: memberId,
    ownerVerificationMethod: "github",
    posts: [
      {
        id: "00000000-0000-4000-8000-000000000314",
        type: "launch",
        title: "Quiet Quarry 알파 공개",
        summary: "집중 시간과 소음 기록을 함께 보는 알파 버전입니다.",
        bodyMd: "간단한 타이머 뒤에 소음과 환경 메모를 붙여 집중 패턴을 찾을 수 있게 했습니다.",
        media: mediaSet("Quiet Quarry", "#84625d", "집중"),
        status: "published",
        publishedAt: subDays(new Date(), 3)
      }
    ],
    comments: [],
    linkHealth: {
      status: "healthy",
      httpStatus: 200
    }
  },
  {
    id: "00000000-0000-4000-8000-000000000110",
    slug: "shipyard-notes",
    title: "Shipyard Notes",
    tagline: "출시 직전 체크리스트와 QA 코멘트를 한 화면에서 모으는 릴리스 룸",
    shortDescription: "QA, 문구 확인, 배포 체크를 출시 방처럼 묶어주는 도구입니다.",
    overviewMd: "Shipyard Notes는 배포 직전 확인 항목을 하나의 릴리스 룸에서 관리하게 하는 경량 QA 허브입니다.",
    problemMd: "출시 직전에는 담당자와 항목이 급격히 늘어나는데 도구는 오히려 더 분산됩니다.",
    targetUsersMd: "작은 제품 팀, 스타트업, 에이전시에서 릴리스를 자주 하는 팀에 적합합니다.",
    whyMadeMd: "배포 직전 체크가 슬랙과 문서로 갈라지면서 빠지는 항목이 반복돼 만들었습니다.",
    stage: "beta",
    category: "developer-tools",
    platform: "web",
    pricingModel: "freemium",
    liveUrl: "https://shipyard-notes.local.test",
    githubUrl: "",
    makerAlias: "Harbor Ops",
    coverImageUrl: mediaSet("Shipyard Notes", "#5b6a79", "릴리스")[0],
    gallery: mediaSet("Shipyard Notes", "#5b6a79", "릴리스"),
    isOpenSource: false,
    noSignupRequired: true,
    isSoloMaker: false,
    aiTools: ["GPT-5.4", "Cursor"],
    verificationState: "unverified",
    status: "published",
    publishedAt: subDays(new Date(), 12),
    lastActivityAt: subHours(new Date(), 8),
    tags: ["web", "developer-tools", "beta", "no-signup"],
    ownerUserId: adminId,
    ownerVerificationMethod: "email",
    posts: [
      {
        id: "00000000-0000-4000-8000-000000000315",
        type: "launch",
        title: "Shipyard Notes 런치",
        summary: "릴리스 전 QA 룸을 가볍게 운영하기 위한 첫 버전입니다.",
        bodyMd: "체크리스트, 문구 확인, 최종 링크 점검을 한 보드에서 볼 수 있도록 했습니다.",
        media: mediaSet("Shipyard Notes", "#5b6a79", "릴리스"),
        status: "published",
        publishedAt: subDays(new Date(), 12)
      },
      {
        id: "00000000-0000-4000-8000-000000000316",
        type: "update",
        title: "릴리스 승인 히스토리 추가",
        summary: "누가 언제 승인했는지 타임라인으로 볼 수 있게 했습니다.",
        bodyMd: "체크 항목뿐 아니라 승인 이력도 함께 남기도록 변경했습니다.",
        media: [mediaSet("Shipyard Notes", "#5b6a79", "업데이트")[1]],
        status: "published",
        publishedAt: subHours(new Date(), 8)
      }
    ],
    comments: [],
    linkHealth: {
      status: "healthy",
      httpStatus: 200
    }
  }
];

export const seedProjects = baseProjects;
export const seedTagSlugs = [...new Set(baseProjects.flatMap((project) => project.tags))];
export const demoUserIds = {
  adminId,
  memberId
};

export const nowReference = new Date();
export const defaultMagicLinkExpiresAt = addDays(nowReference, 3);
