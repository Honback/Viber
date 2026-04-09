/* ── 10 showcase demo projects (single source of truth) ── */

export type DemoProject = {
  slug: string;
  title: string;
  icon: string;
  category: string;
  categoryKo: string;
  tagline: string;
  taglineShort: string;
  tries: number;
  votes: number;
  score: number;
  feedbackQuestion: string;
  createdAt: string;
  tags: string[];
  delta: string;
  timeAgo: string;
  question: string;
  replies: number;
  description: string;
  features: string[];
  techStack: string[];
  problemStatement: string;
  targetUsers: string;
  makerName: string;
  accentGradient: string;
  liveUrl: string;
};

export const DEMO_PROJECTS: DemoProject[] = [
  {
    slug: "vibeai",
    title: "VibeAI",
    icon: "/images/logos/vibeai.png",
    category: "ai",
    categoryKo: "AI / ML",
    tagline: "자연어로 대화하며 아이디어를 코드로 변환하는 AI 페어 프로그래머",
    taglineShort: "자연어로 UI를 생성하는 AI 디자인 도구",
    tries: 3420,
    votes: 892,
    score: 4.8,
    feedbackQuestion: "AI 응답 속도와 코드 품질에 대한 의견을 주세요",
    createdAt: "2026-03-28",
    tags: ["AI", "디자인"],
    delta: "+52",
    timeAgo: "2시간 전",
    question: "AI 디자인 도구의 UX가 직관적인가요? 어떤 기능이 더 필요할까요?",
    replies: 14,
    description: "VibeAI는 자연어 대화를 통해 코드를 생성하고 디버깅하는 AI 페어 프로그래머입니다. React, Python, JavaScript, TypeScript, CSS 등 다양한 언어의 코드 스니펫을 실시간으로 생성하며, 대화형 인터페이스를 통해 직관적으로 아이디어를 코드로 변환할 수 있습니다.",
    features: ["자연어를 코드로 변환하는 AI 엔진", "React, Python, JS, TS, CSS 다중 언어 지원", "실시간 대화형 인터페이스", "코드 스니펫 하이라이팅 및 복사"],
    techStack: ["React", "TypeScript", "Next.js"],
    problemStatement: "코딩 초보자가 문법을 몰라도 자연어로 원하는 코드를 얻을 수 있도록 합니다.",
    targetUsers: "코딩을 배우는 학생, 빠르게 프로토타이핑하려는 개발자",
    makerName: "Vibe Studio",
    accentGradient: "from-purple-600 to-indigo-600",
    liveUrl: "http://134.185.113.46:7100",
  },
  {
    slug: "pixelforge",
    title: "PixelForge",
    icon: "/images/logos/pixelforge.png",
    category: "web",
    categoryKo: "디자인",
    tagline: "브라우저에서 바로 픽셀아트를 그리고 공유하는 온라인 에디터",
    taglineShort: "브라우저에서 실행되는 픽셀아트 에디터",
    tries: 1890,
    votes: 523,
    score: 4.5,
    feedbackQuestion: "레이어 기능과 내보내기 품질에 대한 피드백 부탁드립니다",
    createdAt: "2026-03-27",
    tags: ["에디터", "픽셀아트"],
    delta: "+38",
    timeAgo: "5시간 전",
    question: "브라우저 기반 에디터의 성능은 충분한가요? 레이어 기능이 필요할까요?",
    replies: 11,
    description: "PixelForge는 브라우저에서 바로 실행되는 픽셀아트 에디터입니다. 설치 없이 16x16 캔버스에서 클릭과 드래그로 픽셀아트를 그리고, 12가지 프리셋 컬러와 지우개 도구를 활용해 나만의 작품을 만들 수 있습니다.",
    features: ["16x16 픽셀 그리드 캔버스", "클릭 & 드래그 페인팅", "12가지 프리셋 컬러 팔레트", "지우개 & 전체 초기화 도구"],
    techStack: ["React", "CSS Grid", "TypeScript"],
    problemStatement: "전문 소프트웨어 설치 없이 브라우저에서 빠르게 픽셀아트를 제작할 수 있습니다.",
    targetUsers: "인디 게임 개발자, 픽셀아트 입문자, 디자이너",
    makerName: "Pixel Labs",
    accentGradient: "from-cyan-500 to-blue-600",
    liveUrl: "http://134.185.113.46:7101",
  },
  {
    slug: "datapulse",
    title: "DataPulse",
    icon: "/images/logos/datapulse.png",
    category: "data",
    categoryKo: "SaaS",
    tagline: "실시간 데이터 스트림을 시각화하는 대시보드 빌더",
    taglineShort: "실시간 데이터 파이프라인 모니터링 대시보드",
    tries: 1650,
    votes: 487,
    score: 4.4,
    feedbackQuestion: "차트 렌더링 속도와 커스터마이징 옵션에 대해 알려주세요",
    createdAt: "2026-03-27",
    tags: ["데이터", "모니터링"],
    delta: "+29",
    timeAgo: "6시간 전",
    question: "대시보드에 어떤 차트 유형이 추가되면 좋을까요?",
    replies: 7,
    description: "DataPulse는 실시간 데이터 스트림을 시각화하는 대시보드 빌더입니다. SVG 기반 라인 차트, 바 차트, KPI 카운터를 통해 데이터를 한눈에 파악하고, 실시간 업데이트로 항상 최신 상태를 유지합니다.",
    features: ["실시간 SVG 라인 차트 (20 데이터포인트)", "요일별 바 차트", "3가지 KPI 카운터 (애니메이션)", "일시정지/재개 토글"],
    techStack: ["React", "SVG", "TypeScript"],
    problemStatement: "복잡한 데이터 시각화 도구 없이도 실시간 대시보드를 빠르게 구축합니다.",
    targetUsers: "데이터 엔지니어, 스타트업 PM, DevOps 엔지니어",
    makerName: "Data Studio",
    accentGradient: "from-teal-500 to-emerald-600",
    liveUrl: "http://134.185.113.46:7102",
  },
  {
    slug: "indiecraft",
    title: "IndieCraft",
    icon: "/images/logos/indiecraft.png",
    category: "game",
    categoryKo: "게임",
    tagline: "노코드로 2D 인디 게임을 만들고 웹에 퍼블리싱하는 플랫폼",
    taglineShort: "인디 게임 개발자 커뮤니티 & 잼 플랫폼",
    tries: 1420,
    votes: 412,
    score: 4.3,
    feedbackQuestion: "게임 에디터의 사용성에 대한 의견을 주세요",
    createdAt: "2026-03-26",
    tags: ["커뮤니티", "게임잼"],
    delta: "+27",
    timeAgo: "8시간 전",
    question: "게임잼 이벤트의 적정 기간은 얼마가 좋을까요?",
    replies: 18,
    description: "IndieCraft는 브라우저에서 바로 플레이할 수 있는 2D 미니게임 플랫폼입니다. 화살표 키로 캐릭터를 조종하며 떨어지는 장애물을 피하는 간단하지만 중독성 있는 게임을 체험할 수 있습니다. 시간이 지날수록 속도가 빨라져 긴장감이 높아집니다.",
    features: ["화살표 키 조작 2D 게임", "점진적 난이도 상승", "실시간 점수 카운터", "시작/재시작 기능"],
    techStack: ["Canvas API", "requestAnimationFrame", "TypeScript"],
    problemStatement: "복잡한 게임 엔진 없이 브라우저에서 바로 인디 게임을 체험하고 공유할 수 있습니다.",
    targetUsers: "인디 게임 팬, 게임 개발 입문자, 캐주얼 게이머",
    makerName: "Indie Forge",
    accentGradient: "from-pink-500 to-rose-600",
    liveUrl: "http://134.185.113.46:7103",
  },
  {
    slug: "formflow",
    title: "FormFlow",
    icon: "/images/logos/formflow.png",
    category: "tool",
    categoryKo: "웹 서비스",
    tagline: "드래그앤드롭으로 폼을 만들고 자동 검증까지 처리하는 폼 빌더",
    taglineShort: "드래그앤드롭으로 폼을 만드는 노코드 빌더",
    tries: 1380,
    votes: 398,
    score: 4.2,
    feedbackQuestion: "폼 검증 로직이 충분한지 확인해주세요",
    createdAt: "2026-03-26",
    tags: ["노코드", "폼"],
    delta: "+24",
    timeAgo: "10시간 전",
    question: "노코드 폼 빌더에 조건부 로직이 꼭 필요한가요?",
    replies: 5,
    description: "FormFlow는 드래그앤드롭으로 웹 폼을 만드는 노코드 빌더입니다. 텍스트, 이메일, 텍스트에어리어, 드롭다운, 체크박스, 숫자 등 6가지 필드를 조합해 폼을 구성하고, 미리보기 모드에서 실제 동작을 확인할 수 있습니다.",
    features: ["6가지 필드 타입 드래그앤드롭", "실시간 라벨 편집", "미리보기 모드", "필드 삭제 및 재정렬"],
    techStack: ["React", "HTML Drag and Drop API", "TypeScript"],
    problemStatement: "코딩 없이 누구나 웹 폼을 빠르게 만들고 배포할 수 있습니다.",
    targetUsers: "마케터, 비개발자, 소규모 사업자",
    makerName: "Flow Works",
    accentGradient: "from-amber-500 to-orange-600",
    liveUrl: "http://134.185.113.46:7104",
  },
  {
    slug: "markdownpro",
    title: "MarkdownPro",
    icon: "/images/logos/markdownpro.png",
    category: "tool",
    categoryKo: "웹 서비스",
    tagline: "실시간 협업이 가능한 마크다운 에디터 + 미리보기 + 내보내기",
    taglineShort: "실시간 협업이 가능한 마크다운 에디터",
    tries: 1080,
    votes: 312,
    score: 3.9,
    feedbackQuestion: "협업 기능의 안정성을 테스트해주세요",
    createdAt: "2026-03-24",
    tags: ["마크다운", "협업"],
    delta: "+17",
    timeAgo: "1일 전",
    question: "실시간 협업 시 충돌 해결은 어떤 방식이 좋을까요?",
    replies: 6,
    description: "MarkdownPro는 실시간 미리보기가 가능한 마크다운 에디터입니다. 좌측에서 마크다운을 작성하면 우측에 렌더링된 결과가 즉시 반영되며, 툴바를 통해 서식을 빠르게 적용할 수 있습니다. 글자 수, 단어 수 카운터도 제공합니다.",
    features: ["분할 화면: 에디터 + 실시간 미리보기", "서식 툴바 (Bold, Italic, Heading, Link, Code, List)", "글자/단어/줄 수 카운터", "마크다운 파일 다운로드"],
    techStack: ["React", "marked", "TypeScript"],
    problemStatement: "마크다운 문법을 배우면서 결과를 즉시 확인할 수 있는 편리한 에디터를 제공합니다.",
    targetUsers: "블로거, 개발자, 기술 문서 작성자",
    makerName: "Write Labs",
    accentGradient: "from-yellow-500 to-amber-600",
    liveUrl: "http://134.185.113.46:7105",
  },
  {
    slug: "tinyanalytics",
    title: "TinyAnalytics",
    icon: "/images/logos/tinyanalytics.png",
    category: "saas",
    categoryKo: "SaaS",
    tagline: "가볍고 프라이버시 친화적인 웹 분석 도구 (쿠키 없음)",
    taglineShort: "프라이버시 중심의 경량 웹 분석 도구",
    tries: 920,
    votes: 267,
    score: 3.7,
    feedbackQuestion: "분석 대시보드의 데이터 정확도를 확인해주세요",
    createdAt: "2026-03-23",
    tags: ["분석", "프라이버시"],
    delta: "+14",
    timeAgo: "2일 전",
    question: "웹 분석에서 꼭 필요한 지표 3가지는 무엇인가요?",
    replies: 3,
    description: "TinyAnalytics는 가볍고 프라이버시를 중시하는 웹 분석 도구입니다. 쿠키 없이 페이지뷰, 유니크 방문자, 세션 시간, 바운스율을 추적하며, 깔끔한 대시보드에서 트래픽 트렌드와 인기 페이지를 한눈에 파악할 수 있습니다.",
    features: ["페이지뷰 라인 차트 (7일/30일/90일)", "상위 페이지 & 유입 경로 분석", "실시간 방문자 카운터", "기간 선택 필터"],
    techStack: ["React", "SVG", "TypeScript"],
    problemStatement: "Google Analytics 같은 무거운 도구 대신, 프라이버시를 지키면서 핵심 지표만 추적합니다.",
    targetUsers: "인디 메이커, 블로거, 프라이버시 중시 사이트 운영자",
    makerName: "Tiny Tools",
    accentGradient: "from-indigo-500 to-violet-600",
    liveUrl: "http://134.185.113.46:7106",
  },
  {
    slug: "soundscape",
    title: "SoundScape",
    icon: "/images/logos/soundscape.png",
    category: "music",
    categoryKo: "AI / ML",
    tagline: "AI가 분위기에 맞는 배경음악을 생성해주는 사운드 디자인 앱",
    taglineShort: "AI로 배경음악을 생성하는 앰비언트 도구",
    tries: 870,
    votes: 245,
    score: 3.6,
    feedbackQuestion: "생성된 음악의 품질에 대한 의견을 주세요",
    createdAt: "2026-03-23",
    tags: ["음악", "생성AI"],
    delta: "+12",
    timeAgo: "2일 전",
    question: "AI 배경음악의 장르 선택지로 무엇이 필요할까요?",
    replies: 10,
    description: "SoundScape는 Web Audio API를 활용한 앰비언트 사운드 믹서입니다. 빗소리, 천둥, 바람, 불, 파도, 숲 등 6가지 프로시저럴 사운드 채널을 자유롭게 조합하고, 프리셋으로 집중/휴식/수면 환경을 즉시 만들 수 있습니다.",
    features: ["6가지 프로시저럴 사운드 채널", "채널별 볼륨 슬라이더 & 토글", "3가지 무드 프리셋 (Focus, Relax, Sleep)", "마스터 볼륨 컨트롤"],
    techStack: ["Web Audio API", "React", "TypeScript"],
    problemStatement: "작업 집중력을 높이거나 편안한 환경을 만들기 위한 배경 소리를 손쉽게 커스터마이징합니다.",
    targetUsers: "재택근무자, 학생, 명상/수면에 배경음이 필요한 사람",
    makerName: "Sound Lab",
    accentGradient: "from-purple-500 to-fuchsia-600",
    liveUrl: "http://134.185.113.46:7107",
  },
  {
    slug: "quizmaker",
    title: "QuizMaker",
    icon: "/images/logos/quizmaker.png",
    category: "web",
    categoryKo: "웹 서비스",
    tagline: "인터랙티브 퀴즈를 만들고 결과를 공유하는 퀴즈 플랫폼",
    taglineShort: "인터랙티브 퀴즈를 5분 만에 제작",
    tries: 810,
    votes: 234,
    score: 3.5,
    feedbackQuestion: "퀴즈 제작 UI가 직관적인지 테스트해주세요",
    createdAt: "2026-03-22",
    tags: ["퀴즈", "교육"],
    delta: "+11",
    timeAgo: "3일 전",
    question: "퀴즈 유형 중 어떤 것을 가장 많이 사용하시나요?",
    replies: 4,
    description: "QuizMaker는 인터랙티브 퀴즈를 빠르게 만들고 바로 풀 수 있는 퀴즈 플랫폼입니다. 4지선다 문제를 추가하고, 플레이 모드에서 즉시 정답 확인과 점수를 볼 수 있습니다. 샘플 퀴즈 2개가 기본 제공됩니다.",
    features: ["퀴즈 생성 모드 (4지선다)", "실시간 플레이 & 정답 확인", "점수 요약 및 재도전", "입력 검증 (필수 항목 체크)"],
    techStack: ["React", "TypeScript"],
    problemStatement: "별도 도구 없이 교육용 퀴즈를 빠르게 만들고 공유할 수 있습니다.",
    targetUsers: "교사, 교육 콘텐츠 제작자, 스터디 그룹",
    makerName: "Quiz Studio",
    accentGradient: "from-cyan-500 to-teal-600",
    liveUrl: "http://134.185.113.46:7108",
  },
  {
    slug: "paletteai",
    title: "PaletteAI",
    icon: "/images/logos/paletteai.png",
    category: "ai",
    categoryKo: "디자인",
    tagline: "브랜드 키워드를 입력하면 AI가 완벽한 컬러 팔레트를 생성",
    taglineShort: "AI가 추천하는 컬러 팔레트 생성기",
    tries: 680,
    votes: 187,
    score: 3.2,
    feedbackQuestion: "생성된 팔레트의 조화에 대한 의견을 주세요",
    createdAt: "2026-03-21",
    tags: ["컬러", "AI"],
    delta: "+6",
    timeAgo: "5일 전",
    question: "컬러 팔레트 생성 시 이미지 업로드 기반 추출이 필요한가요?",
    replies: 2,
    description: "PaletteAI는 키워드를 입력하면 AI가 어울리는 컬러 팔레트를 생성해주는 도구입니다. Complementary, Analogous, Triadic 등 색상 조화 모드를 선택하고, 개별 색상을 잠그거나 랜덤으로 재생성할 수 있습니다. Hex, RGB, HSL 값을 클릭 한 번으로 복사합니다.",
    features: ["키워드 기반 팔레트 생성 (해시 → HSL)", "3가지 색상 조화 모드", "개별 색상 잠금 & 랜덤 재생성", "원클릭 컬러 코드 복사"],
    techStack: ["React", "TypeScript"],
    problemStatement: "디자이너가 아니어도 브랜드에 맞는 조화로운 컬러 팔레트를 빠르게 얻을 수 있습니다.",
    targetUsers: "웹 디자이너, 브랜딩 담당자, 인디 메이커",
    makerName: "Color AI",
    accentGradient: "from-rose-500 to-pink-600",
    liveUrl: "http://134.185.113.46:7109",
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  ai: "#8B5CF6",
  tool: "#F59E0B",
  web: "#06B6D4",
  game: "#EC4899",
  saas: "#6366F1",
  data: "#14B8A6",
  music: "#A855F7",
};

/* ── Mapper helpers for different variant shapes ── */

export function toFeatureShape(p: DemoProject) {
  return {
    title: p.title,
    icon: p.icon,
    category: p.category,
    tagline: p.tagline,
    tries: p.tries,
    votes: p.votes,
    score: p.score,
    feedbackQuestion: p.feedbackQuestion,
    createdAt: p.createdAt,
    slug: p.slug,
    liveUrl: p.liveUrl,
  };
}

export function toFeatureIndexShape(p: DemoProject) {
  return {
    title: p.title,
    icon: p.icon,
    category: p.category,
    tagline: p.tagline,
    tries: p.tries,
    votes: p.votes,
    score: p.score,
    feedback: p.feedbackQuestion,
    slug: p.slug,
    liveUrl: p.liveUrl,
  };
}

export function toMinimalRankShape(p: DemoProject, i: number) {
  return {
    rank: i + 1,
    title: p.title,
    desc: p.taglineShort,
    icon: p.icon,
    score: p.votes,
  };
}

export function toMinimalProductShape(p: DemoProject, i: number) {
  return {
    id: i + 1,
    title: p.title,
    desc: p.taglineShort,
    icon: p.icon,
    score: p.votes,
    category: p.categoryKo,
    tags: p.tags,
    slug: p.slug,
    liveUrl: p.liveUrl,
  };
}

export function toMinimalTrendingShape(p: DemoProject, i: number) {
  return {
    id: i + 1,
    title: p.title,
    desc: p.taglineShort,
    icon: p.icon,
    score: p.votes,
    category: p.categoryKo,
    delta: p.delta,
  };
}

export function toMinimalNewShape(p: DemoProject, i: number) {
  return {
    id: i + 1,
    title: p.title,
    desc: p.taglineShort,
    icon: p.icon,
    category: p.categoryKo,
    tags: p.tags,
    timeAgo: p.timeAgo,
    slug: p.slug,
  };
}

export function toMinimalFeedbackShape(p: DemoProject, i: number) {
  return {
    id: i + 1,
    title: p.title,
    icon: p.icon,
    question: p.question,
    replies: p.replies,
    slug: p.slug,
  };
}
