import { db } from "./index";
import { projects } from "./schema";
import { eq } from "drizzle-orm";

const COVER_UPDATES: Record<string, { cover: string; gallery: string[] }> = {
  "focus-flow": {
    cover: "/images/products/focus-flow-cover.svg",
    gallery: ["/images/products/focus-flow-1.svg", "/images/products/focus-flow-2.svg"],
  },
  "canvas-care": {
    cover: "/images/products/canvas-care-cover.svg",
    gallery: ["/images/products/canvas-care-1.svg", "/images/products/canvas-care-2.svg"],
  },
  "prompt-sprint": {
    cover: "/images/products/prompt-sprint-cover.svg",
    gallery: ["/images/products/prompt-sprint-1.svg", "/images/products/prompt-sprint-2.svg"],
  },
  "lesson-loop": {
    cover: "/images/products/lesson-loop-cover.svg",
    gallery: ["/images/products/lesson-loop-1.svg", "/images/products/lesson-loop-2.svg"],
  },
  "signal-shelf": {
    cover: "/images/products/signal-shelf-cover.svg",
    gallery: ["/images/products/signal-shelf-1.svg", "/images/products/signal-shelf-2.svg"],
  },
  "shipyard-notes": {
    cover: "/images/products/shipyard-notes-cover.svg",
    gallery: ["/images/products/shipyard-notes-1.svg", "/images/products/shipyard-notes-2.svg"],
  },
  "quiet-quarry": {
    cover: "/images/products/quiet-quarry-cover.svg",
    gallery: ["/images/products/quiet-quarry-1.svg", "/images/products/quiet-quarry-2.svg"],
  },
};

async function main() {
  for (const [slug, data] of Object.entries(COVER_UPDATES)) {
    await db
      .update(projects)
      .set({
        coverImageUrl: data.cover,
        galleryJson: data.gallery,
      })
      .where(eq(projects.slug, slug));
    console.log(`Updated ${slug}`);
  }
  console.log("Done");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
