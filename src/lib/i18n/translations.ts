export type Locale = "ko" | "en";

export const translations = {
  ko: {
    nav: {
      home: "홈",
      products: "프로덕트",
      trending: "트렌딩",
      new: "뉴",
      feedback: "피드백",
      blog: "블로그",
      submit: "등록하기",
      login: "로그인",
      logout: "로그아웃",
      saved: "저장함",
      myProjects: "내 프로젝트",
      admin: "운영",
      adminBlog: "블로그 관리",
    },
    footer: {
      description: "바이브코딩 프로젝트를 발견하고, 피드백하고, 함께 성장하는 커뮤니티",
      policy: "운영 정책",
      privacy: "개인정보 안내",
      submitProject: "프로젝트 등록",
      explore: "탐색",
      newProjects: "새 프로젝트",
      categories: "카테고리",
      maker: "메이커",
      dashboard: "대시보드",
      guide: "등록 가이드",
      faq: "FAQ",
      copyright: "Made by the Vibe Coding Community",
      slogan: "만든 것을 세상에 보여주세요.",
      platform: "바이브코딩 프로젝트 쇼케이스 플랫폼.",
    },
  },
  en: {
    nav: {
      home: "Home",
      products: "Products",
      trending: "Trending",
      new: "New",
      feedback: "Feedback",
      blog: "Blog",
      submit: "Submit",
      login: "Login",
      logout: "Logout",
      saved: "Saved",
      myProjects: "My Projects",
      admin: "Admin",
      adminBlog: "Blog Mgmt",
    },
    footer: {
      description: "Discover, try, and give feedback on vibe coding projects.",
      policy: "Content Policy",
      privacy: "Privacy",
      submitProject: "Submit Project",
      explore: "Explore",
      newProjects: "New Projects",
      categories: "Categories",
      maker: "Maker",
      dashboard: "Dashboard",
      guide: "Submit Guide",
      faq: "FAQ",
      copyright: "Made by the Vibe Coding Community",
      slogan: "Show your work to the world.",
      platform: "Vibe Coding Project Showcase Platform.",
    },
  },
} as const;

export function t(locale: Locale) {
  return translations[locale];
}

export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE = "viber-locale";
