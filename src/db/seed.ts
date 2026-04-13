import { db, sql as pgSql } from "./index";
import {
  profiles,
  projects,
  projectOwners,
  projectPosts,
  comments,
  projectSaves,
  projectClickEvents,
  tags,
  projectTags,
  projectRankSnapshots,
  viewImpressionCounters,
} from "./schema";

const ACCENT = "#d76542";

/* ── Helper: random date within last N days ── */
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function randomDaysAgo(min: number, max: number) {
  const n = min + Math.floor(Math.random() * (max - min));
  return daysAgo(n);
}
function randomSession() {
  return Math.random().toString(36).slice(2, 14);
}

/* ── 10 Products data ── */
const DEMO_HOST = process.env.NEXT_PUBLIC_DEMO_HOST || "http://134.185.113.46";

const PRODUCTS = [
  {
    slug: "vibeai",
    title: "VibeAI",
    tagline: "자연어로 대화하며 아이디어를 코드로 변환하는 AI 페어 프로그래머",
    shortDescription: "자연어 대화를 통해 React, Python, JavaScript 등 다양한 언어의 코드를 생성하는 AI 코딩 어시스턴트입니다.",
    overviewMd: "VibeAI는 자연어 대화를 통해 코드를 생성하고 디버깅하는 AI 페어 프로그래머입니다.\n\nReact, Python, JavaScript, TypeScript, CSS 등 다양한 언어의 코드 스니펫을 실시간으로 생성하며, 대화형 인터페이스를 통해 직관적으로 아이디어를 코드로 변환할 수 있습니다.\n\n키워드 기반 응답 매핑과 코드 하이라이팅을 지원하여, 초보자도 쉽게 원하는 코드를 얻을 수 있습니다.",
    problemMd: "코딩 초보자가 문법을 몰라도 자연어로 원하는 코드를 얻을 수 있어야 합니다. 기존 AI 코딩 도구는 진입장벽이 높고, 대화형 UX가 부족합니다.",
    targetUsersMd: "코딩을 배우는 학생, 빠르게 프로토타이핑하려는 개발자, AI 기반 개발 워크플로를 경험하고 싶은 사람",
    category: "developer-tools",
    stage: "beta",
    platform: "web",
    pricing: "free",
    liveUrl: `${DEMO_HOST}:7100`,
    makerAlias: "Vibe Studio",
    coverImage: "/images/logos/vibeai.png",
    gallery: ["/images/products/vibeai-1.png", "/images/products/vibeai-2.png"],
    tags: ["AI", "developer-tools"],
    featured: true,
    featuredOrder: 1,
    aiTools: ["Claude", "GPT-4"],
    isSoloMaker: false,
    isOpenSource: true,
    noSignupRequired: true,
  },
  {
    slug: "pixelforge",
    title: "PixelForge",
    tagline: "브라우저에서 바로 픽셀아트를 그리고 공유하는 온라인 에디터",
    shortDescription: "설치 없이 브라우저에서 16x16 픽셀아트를 그리고 PNG로 내보내는 온라인 에디터입니다.",
    overviewMd: "PixelForge는 브라우저에서 바로 실행되는 픽셀아트 에디터입니다.\n\n16x16 캔버스에서 클릭과 드래그로 픽셀아트를 그리고, 12가지 프리셋 컬러와 지우개 도구를 활용해 나만의 작품을 만들 수 있습니다.\n\n별도 설치 없이 웹 브라우저만으로 바로 시작할 수 있어, 인디 게임 개발이나 소셜 미디어용 아이콘 제작에 적합합니다.",
    problemMd: "전문 소프트웨어(Aseprite, Photoshop 등) 설치 없이 브라우저에서 빠르게 픽셀아트를 제작하고 공유할 수 있어야 합니다.",
    targetUsersMd: "인디 게임 개발자, 픽셀아트 입문자, SNS 프로필 아이콘을 만들고 싶은 디자이너",
    category: "creator",
    stage: "live",
    platform: "web",
    pricing: "free",
    liveUrl: `${DEMO_HOST}:7101`,
    makerAlias: "Pixel Labs",
    coverImage: "/images/logos/pixelforge.png",
    gallery: ["/images/products/pixelforge-1.png", "/images/products/pixelforge-2.png"],
    tags: ["web", "no-signup"],
    featured: true,
    featuredOrder: 2,
    aiTools: [],
    isSoloMaker: true,
    isOpenSource: true,
    noSignupRequired: true,
  },
  {
    slug: "datapulse",
    title: "DataPulse",
    tagline: "실시간 데이터 스트림을 시각화하는 대시보드 빌더",
    shortDescription: "SVG 기반 라인 차트, 바 차트, KPI 카운터로 실시간 데이터를 시각화하는 대시보드 빌더입니다.",
    overviewMd: "DataPulse는 실시간 데이터 스트림을 시각화하는 대시보드 빌더입니다.\n\nSVG 기반 라인 차트, 바 차트, KPI 카운터를 통해 데이터를 한눈에 파악하고, 2초 간격의 실시간 업데이트로 항상 최신 상태를 유지합니다.\n\n외부 차트 라이브러리 없이 순수 SVG로 렌더링되어 가볍고 빠릅니다.",
    problemMd: "Grafana, Datadog 같은 복잡한 도구 없이도 팀에서 빠르게 실시간 대시보드를 구축해야 하는 경우가 많습니다.",
    targetUsersMd: "데이터 엔지니어, 스타트업 PM, DevOps 엔지니어",
    category: "developer-tools",
    stage: "beta",
    platform: "web",
    pricing: "freemium",
    liveUrl: `${DEMO_HOST}:7102`,
    makerAlias: "Data Studio",
    coverImage: "/images/logos/datapulse.png",
    gallery: ["/images/products/datapulse-1.png", "/images/products/datapulse-2.png"],
    tags: ["developer-tools", "web"],
    featured: true,
    featuredOrder: 3,
    aiTools: [],
    isSoloMaker: false,
    isOpenSource: false,
    noSignupRequired: true,
  },
  {
    slug: "indiecraft",
    title: "IndieCraft",
    tagline: "브라우저에서 바로 플레이하는 2D 인디 게임 플랫폼",
    shortDescription: "화살표 키로 장애물을 피하는 중독성 있는 2D 미니게임을 브라우저에서 바로 플레이할 수 있습니다.",
    overviewMd: "IndieCraft는 브라우저에서 바로 플레이할 수 있는 2D 미니게임 플랫폼입니다.\n\n화살표 키로 캐릭터를 조종하며 떨어지는 장애물을 피하는 간단하지만 중독성 있는 게임을 체험할 수 있습니다.\n\n시간이 지날수록 속도가 빨라져 긴장감이 높아지며, Canvas API와 requestAnimationFrame으로 부드러운 60fps 렌더링을 제공합니다.",
    problemMd: "Unity나 Godot 같은 게임 엔진 없이 브라우저에서 바로 인디 게임을 체험하고 공유할 수 있어야 합니다.",
    targetUsersMd: "인디 게임 팬, 게임 개발 입문자, 캐주얼 게이머",
    category: "creator",
    stage: "alpha",
    platform: "web",
    pricing: "free",
    liveUrl: `${DEMO_HOST}:7103`,
    makerAlias: "Indie Forge",
    coverImage: "/images/logos/indiecraft.png",
    gallery: ["/images/products/indiecraft-1.png", "/images/products/indiecraft-2.png"],
    tags: ["free", "web"],
    featured: false,
    featuredOrder: null,
    aiTools: [],
    isSoloMaker: true,
    isOpenSource: true,
    noSignupRequired: true,
  },
  {
    slug: "formflow",
    title: "FormFlow",
    tagline: "드래그앤드롭으로 폼을 만들고 자동 검증까지 처리하는 폼 빌더",
    shortDescription: "텍스트, 이메일, 드롭다운 등 6가지 필드를 드래그앤드롭으로 조합해 웹 폼을 만드는 노코드 빌더입니다.",
    overviewMd: "FormFlow는 드래그앤드롭으로 웹 폼을 만드는 노코드 빌더입니다.\n\n텍스트, 이메일, 텍스트에어리어, 드롭다운, 체크박스, 숫자 등 6가지 필드를 조합해 폼을 구성하고, 미리보기 모드에서 실제 동작을 확인할 수 있습니다.\n\nHTML Drag and Drop API를 활용해 직관적인 빌더 UX를 제공합니다.",
    problemMd: "간단한 설문이나 접수 폼을 만들 때마다 개발자에게 의뢰하는 비효율을 없앱니다.",
    targetUsersMd: "마케터, 비개발자, 소규모 사업자, HR 담당자",
    category: "productivity",
    stage: "beta",
    platform: "web",
    pricing: "freemium",
    liveUrl: `${DEMO_HOST}:7104`,
    makerAlias: "Flow Works",
    coverImage: "/images/logos/formflow.png",
    gallery: ["/images/products/formflow-1.png", "/images/products/formflow-2.png"],
    tags: ["web", "no-signup"],
    featured: true,
    featuredOrder: 4,
    aiTools: [],
    isSoloMaker: false,
    isOpenSource: false,
    noSignupRequired: true,
  },
  {
    slug: "markdownpro",
    title: "MarkdownPro",
    tagline: "실시간 협업이 가능한 마크다운 에디터 + 미리보기 + 내보내기",
    shortDescription: "좌측 에디터에서 마크다운을 작성하면 우측에 실시간 미리보기가 반영되는 분할 화면 에디터입니다.",
    overviewMd: "MarkdownPro는 실시간 미리보기가 가능한 마크다운 에디터입니다.\n\n좌측에서 마크다운을 작성하면 우측에 렌더링된 결과가 즉시 반영되며, 툴바를 통해 Bold, Italic, Heading, Link, Code, List 서식을 빠르게 적용할 수 있습니다.\n\n글자 수, 단어 수, 줄 수 카운터와 .md 파일 다운로드를 제공합니다.",
    problemMd: "마크다운 문법을 배우면서 결과를 즉시 확인할 수 있는 가볍고 빠른 에디터가 필요합니다.",
    targetUsersMd: "블로거, 개발자, 기술 문서 작성자, README 편집이 필요한 오픈소스 기여자",
    category: "productivity",
    stage: "live",
    platform: "web",
    pricing: "free",
    liveUrl: `${DEMO_HOST}:7105`,
    makerAlias: "Write Labs",
    coverImage: "/images/logos/markdownpro.png",
    gallery: ["/images/products/markdownpro-1.png", "/images/products/markdownpro-2.png"],
    tags: ["free", "open-source"],
    featured: true,
    featuredOrder: 5,
    aiTools: [],
    isSoloMaker: true,
    isOpenSource: true,
    noSignupRequired: true,
  },
  {
    slug: "tinyanalytics",
    title: "TinyAnalytics",
    tagline: "가볍고 프라이버시 친화적인 웹 분석 도구 (쿠키 없음)",
    shortDescription: "쿠키 없이 페이지뷰, 유니크 방문자, 바운스율을 추적하는 프라이버시 중심 웹 분석 도구입니다.",
    overviewMd: "TinyAnalytics는 가볍고 프라이버시를 중시하는 웹 분석 도구입니다.\n\n쿠키 없이 페이지뷰, 유니크 방문자, 세션 시간, 바운스율을 추적하며, 깔끔한 대시보드에서 트래픽 트렌드와 인기 페이지를 한눈에 파악할 수 있습니다.\n\n7일/30일/90일 기간 필터와 실시간 방문자 카운터를 제공합니다.",
    problemMd: "Google Analytics는 무겁고 프라이버시 이슈가 있습니다. 핵심 지표만 빠르게 확인할 수 있는 가벼운 대안이 필요합니다.",
    targetUsersMd: "인디 메이커, 블로거, GDPR 준수가 필요한 사이트 운영자",
    category: "developer-tools",
    stage: "live",
    platform: "web",
    pricing: "freemium",
    liveUrl: `${DEMO_HOST}:7106`,
    makerAlias: "Tiny Tools",
    coverImage: "/images/logos/tinyanalytics.png",
    gallery: ["/images/products/tinyanalytics-1.png", "/images/products/tinyanalytics-2.png"],
    tags: ["developer-tools", "web"],
    featured: false,
    featuredOrder: null,
    aiTools: [],
    isSoloMaker: true,
    isOpenSource: false,
    noSignupRequired: true,
  },
  {
    slug: "soundscape",
    title: "SoundScape",
    tagline: "AI가 분위기에 맞는 배경음악을 생성해주는 사운드 디자인 앱",
    shortDescription: "Web Audio API로 빗소리, 바람, 파도 등 6가지 앰비언트 사운드를 믹싱하는 프로시저럴 사운드 믹서입니다.",
    overviewMd: "SoundScape는 Web Audio API를 활용한 앰비언트 사운드 믹서입니다.\n\n빗소리, 천둥, 바람, 불, 파도, 숲 등 6가지 프로시저럴 사운드 채널을 자유롭게 조합하고, Focus/Relax/Sleep 프리셋으로 환경을 즉시 전환할 수 있습니다.\n\n마스터 볼륨과 채널별 볼륨 슬라이더로 세밀한 조절이 가능합니다.",
    problemMd: "작업 집중력을 높이거나 수면 환경을 만들 때, 배경 소리를 손쉽게 커스터마이징할 도구가 부족합니다.",
    targetUsersMd: "재택근무자, 학생, 명상/수면에 배경음이 필요한 사람",
    category: "health",
    stage: "beta",
    platform: "web",
    pricing: "free",
    liveUrl: `${DEMO_HOST}:7107`,
    makerAlias: "Sound Lab",
    coverImage: "/images/logos/soundscape.png",
    gallery: ["/images/products/soundscape-1.png", "/images/products/soundscape-2.png"],
    tags: ["free", "web"],
    featured: false,
    featuredOrder: null,
    aiTools: ["Web Audio API"],
    isSoloMaker: true,
    isOpenSource: true,
    noSignupRequired: true,
  },
  {
    slug: "quizmaker",
    title: "QuizMaker",
    tagline: "인터랙티브 퀴즈를 만들고 결과를 공유하는 퀴즈 플랫폼",
    shortDescription: "4지선다 퀴즈를 빠르게 만들고 실시간으로 풀 수 있는 인터랙티브 퀴즈 빌더입니다.",
    overviewMd: "QuizMaker는 인터랙티브 퀴즈를 빠르게 만들고 바로 풀 수 있는 퀴즈 플랫폼입니다.\n\n4지선다 문제를 추가하고, 플레이 모드에서 즉시 정답 확인과 점수를 볼 수 있습니다.\n\n입력 검증(필수 항목 체크, 정답 선택 확인)과 재도전 기능을 제공하며, 샘플 퀴즈 2개가 기본 포함되어 있습니다.",
    problemMd: "교육용 퀴즈를 만들 때 Google Forms는 퀴즈에 최적화되어 있지 않고, 전문 퀴즈 도구는 유료입니다.",
    targetUsersMd: "교사, 교육 콘텐츠 제작자, 스터디 그룹 리더, HR 교육 담당자",
    category: "education",
    stage: "alpha",
    platform: "web",
    pricing: "free",
    liveUrl: `${DEMO_HOST}:7108`,
    makerAlias: "Quiz Studio",
    coverImage: "/images/logos/quizmaker.png",
    gallery: ["/images/products/quizmaker-1.png", "/images/products/quizmaker-2.png"],
    tags: ["free", "no-signup"],
    featured: false,
    featuredOrder: null,
    aiTools: [],
    isSoloMaker: false,
    isOpenSource: false,
    noSignupRequired: true,
  },
  {
    slug: "paletteai",
    title: "PaletteAI",
    tagline: "브랜드 키워드를 입력하면 AI가 완벽한 컬러 팔레트를 생성",
    shortDescription: "키워드 기반 해시→HSL 변환으로 조화로운 5색 컬러 팔레트를 생성하는 디자인 도구입니다.",
    overviewMd: "PaletteAI는 키워드를 입력하면 어울리는 컬러 팔레트를 생성해주는 도구입니다.\n\nComplementary, Analogous, Triadic 등 색상 조화 모드를 선택하고, 개별 색상을 잠그거나 랜덤으로 재생성할 수 있습니다.\n\nHex, RGB, HSL 값을 클릭 한 번으로 복사하며, 인접 색상 간 명도 대비 비율도 표시합니다.",
    problemMd: "디자이너가 아닌 사람이 브랜드에 맞는 조화로운 컬러 팔레트를 빠르게 생성하기 어렵습니다.",
    targetUsersMd: "웹 디자이너, 브랜딩 담당자, 인디 메이커, 프론트엔드 개발자",
    category: "creator",
    stage: "live",
    platform: "web",
    pricing: "free",
    liveUrl: `${DEMO_HOST}:7109`,
    makerAlias: "Color AI",
    coverImage: "/images/logos/paletteai.png",
    gallery: ["/images/products/paletteai-1.png", "/images/products/paletteai-2.png"],
    tags: ["AI", "free"],
    featured: true,
    featuredOrder: 6,
    aiTools: ["HSL Algorithm"],
    isSoloMaker: true,
    isOpenSource: true,
    noSignupRequired: true,
  },
];

/* ── Dummy commenters ── */
const COMMENTER_NAMES = [
  "인디해커_민수", "코드마스터_지은", "디자인러_하늘", "풀스택_재현", "AI덕후_소연",
  "스타트업_동현", "프론트엔드_유진", "백엔드_성호", "데이터_미래", "UX리서처_은비",
];

const FEEDBACK_TEMPLATES = [
  ["정말 유용한 도구네요! 매일 사용하고 있습니다.", "UI가 깔끔하고 직관적이에요.", "로딩 속도가 빠른 점이 마음에 듭니다.", "모바일에서도 잘 동작하면 좋겠어요.", "다크모드 지원이 훌륭합니다."],
  ["기능이 단순해서 좋아요. 복잡한 건 필요 없어요.", "처음 써보는데 진입장벽이 낮아서 좋습니다.", "비슷한 도구 많이 써봤는데 이게 제일 깔끔해요.", "무료인데 이 정도면 대단합니다.", "팀원들에게도 추천했어요."],
  ["한 가지 아쉬운 점은 내보내기 기능이 더 다양했으면 해요.", "커스터마이징 옵션이 좀 더 많으면 좋겠습니다.", "전반적으로 만족스럽고, 앞으로 업데이트가 기대됩니다.", "오프라인 모드도 지원해주세요!", "API 연동이 가능하면 더 좋을 것 같아요."],
  ["바이브코딩으로 만들었다니 놀랍네요!", "가입 없이 바로 쓸 수 있어서 좋아요.", "성능 최적화가 잘 되어 있는 것 같습니다.", "문서화가 더 되면 좋겠어요.", "오픈소스라니! 기여하고 싶어요."],
  ["이런 도구가 필요했는데 딱 맞습니다.", "심플한 디자인이 마음에 들어요.", "버그 하나 발견했는데 리포트 어디서 하나요?", "다음 업데이트에서 뭐가 추가되나요?", "한국어 지원이 완벽해서 좋습니다."],
];

async function main() {
  console.log("Seeding database...");

  // 1. Create dummy profiles for commenters
  const profileIds: string[] = [];
  for (const name of COMMENTER_NAMES) {
    const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}@demo.vibeollio.com`;
    const [p] = await db
      .insert(profiles)
      .values({ email, displayName: name, role: "member" })
      .onConflictDoNothing()
      .returning({ id: profiles.id });
    if (p) {
      profileIds.push(p.id);
    } else {
      // profile already exists, fetch it
      const existing = await db.select({ id: profiles.id }).from(profiles).where(
        pgSql`${profiles.email} = ${email}`
      ).limit(1);
      if (existing[0]) profileIds.push(existing[0].id);
    }
  }
  console.log(`Created ${profileIds.length} profiles`);

  // 2. Create or find tags
  const tagMap: Record<string, string> = {};
  const allTagSlugs = [...new Set(PRODUCTS.flatMap((p) => p.tags))];
  for (const slug of allTagSlugs) {
    const [t] = await db
      .insert(tags)
      .values({ slug, name: slug })
      .onConflictDoNothing()
      .returning({ id: tags.id });
    if (t) {
      tagMap[slug] = t.id;
    } else {
      const existing = await db.select({ id: tags.id }).from(tags).where(pgSql`${tags.slug} = ${slug}`).limit(1);
      if (existing[0]) tagMap[slug] = existing[0].id;
    }
  }
  console.log(`Created/found ${Object.keys(tagMap).length} tags`);

  // 3. Insert projects
  for (let pi = 0; pi < PRODUCTS.length; pi++) {
    const prod = PRODUCTS[pi];
    const publishedAt = daysAgo(30 - pi * 2);
    const lastActivityAt = daysAgo(pi);

    // Check if project exists
    const existing = await db.select({ id: projects.id }).from(projects).where(pgSql`${projects.slug} = ${prod.slug}`).limit(1);
    if (existing[0]) {
      console.log(`Project ${prod.slug} already exists, skipping`);
      continue;
    }

    const [project] = await db
      .insert(projects)
      .values({
        slug: prod.slug,
        title: prod.title,
        tagline: prod.tagline,
        shortDescription: prod.shortDescription,
        overviewMd: prod.overviewMd,
        problemMd: prod.problemMd,
        targetUsersMd: prod.targetUsersMd,
        stage: prod.stage,
        category: prod.category,
        platform: prod.platform,
        pricingModel: prod.pricing,
        liveUrl: prod.liveUrl,
        liveUrlNormalized: prod.liveUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        makerAlias: prod.makerAlias,
        coverImageUrl: prod.coverImage,
        galleryJson: prod.gallery,
        isOpenSource: prod.isOpenSource,
        noSignupRequired: prod.noSignupRequired,
        isSoloMaker: prod.isSoloMaker,
        aiToolsJson: prod.aiTools,
        verificationState: "github_verified",
        status: "published",
        featured: prod.featured,
        featuredOrder: prod.featuredOrder,
        publishedAt,
        lastActivityAt,
      })
      .returning({ id: projects.id });

    const projectId = project.id;
    console.log(`Created project: ${prod.title} (${projectId})`);

    // 4. Create owner
    await db.insert(projectOwners).values({
      projectId,
      userId: profileIds[pi % profileIds.length],
      verificationMethod: "github",
      isPrimary: true,
      claimedAt: publishedAt,
    });

    // 5. Link tags
    for (const tagSlug of prod.tags) {
      if (tagMap[tagSlug]) {
        await db.insert(projectTags).values({
          projectId,
          tagId: tagMap[tagSlug],
        }).onConflictDoNothing();
      }
    }

    // 6. Create launch post
    const [launchPost] = await db.insert(projectPosts).values({
      projectId,
      type: "launch",
      title: `${prod.title} 런칭!`,
      summary: prod.tagline,
      bodyMd: `**${prod.title}**이 Vibeollio에 등록되었습니다!\n\n${prod.shortDescription}\n\n지금 바로 체험해보세요.`,
      status: "published",
      publishedAt,
    }).returning({ id: projectPosts.id });

    // 7. Create feedback post
    const [feedbackPost] = await db.insert(projectPosts).values({
      projectId,
      type: "feedback",
      title: `${prod.title}에 대한 의견을 들려주세요`,
      summary: "사용 경험과 개선 아이디어를 공유해주세요",
      bodyMd: `${prod.title}을 사용해보셨나요?\n\n어떤 점이 좋았고, 어떤 점을 개선하면 좋을지 의견을 남겨주세요.`,
      requestedFeedbackMd: "사용성, 디자인, 성능, 기능 등 어떤 의견이든 환영합니다!",
      status: "published",
      publishedAt: daysAgo(20 - pi),
    }).returning({ id: projectPosts.id });

    // 8. Create 5 comments per project
    const feedbackSet = FEEDBACK_TEMPLATES[pi % FEEDBACK_TEMPLATES.length];
    for (let ci = 0; ci < 5; ci++) {
      const commenterId = profileIds[(pi + ci + 1) % profileIds.length];
      await db.insert(comments).values({
        projectId,
        postId: ci < 3 ? feedbackPost.id : null, // 3 on feedback post, 2 general
        userId: commenterId,
        bodyMd: feedbackSet[ci],
        status: "active",
        createdAt: randomDaysAgo(1, 14),
      });
    }

    // 9. Create click events (varying counts per project)
    const clickCount = 20 + Math.floor(Math.random() * 80);
    const clickSources = ["home_try", "projects_try", "detail_try", "tag_try"];
    for (let ci = 0; ci < clickCount; ci++) {
      await db.insert(projectClickEvents).values({
        projectId,
        source: clickSources[ci % clickSources.length],
        sessionHash: randomSession(),
        userId: Math.random() > 0.7 ? profileIds[Math.floor(Math.random() * profileIds.length)] : null,
        createdAt: randomDaysAgo(0, 7),
      });
    }

    // 10. Create saves
    const saveCount = 3 + Math.floor(Math.random() * 5);
    const shuffled = [...profileIds].sort(() => Math.random() - 0.5);
    for (let si = 0; si < Math.min(saveCount, shuffled.length); si++) {
      await db.insert(projectSaves).values({
        projectId,
        userId: shuffled[si],
        createdAt: randomDaysAgo(0, 30),
      }).onConflictDoNothing();
    }

    // 11. Create view impressions
    const viewCount = 50 + Math.floor(Math.random() * 200);
    for (let vi = 0; vi < viewCount; vi++) {
      await db.insert(viewImpressionCounters).values({
        projectId,
        source: vi % 2 === 0 ? "project_card_impression" : "project_detail_view",
        sessionHash: randomSession(),
        createdAt: randomDaysAgo(0, 14),
      });
    }

    // 12. Create rank snapshot
    const uniqueClicks = Math.floor(clickCount * 0.6);
    const savesCount = saveCount;
    const commentSignal = Math.min(5, 3 * 2);
    const baseScore = uniqueClicks + savesCount * 4 + commentSignal * 5;
    const freshness = pi < 3 ? 115 : pi < 6 ? 100 : 85;
    const finalScore = Math.round((baseScore * freshness * 100) / 10000);

    await db.insert(projectRankSnapshots).values({
      projectId,
      finalScore,
      uniqueTryClicks7d: uniqueClicks,
      newSaves30d: savesCount,
      commentSignal30d: commentSignal,
      freshnessMultiplier: freshness,
      qualityMultiplier: 100,
      rankPosition: pi + 1,
    });
  }

  console.log("\nSeed completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
