import sanitizeHtml from "sanitize-html";
import { Marked } from "marked";

const blogParser = new Marked({ gfm: true, breaks: true });

const allowedTags = [
  "h2", "h3", "p", "br", "strong", "em", "code", "pre",
  "ul", "ol", "li", "blockquote", "a", "hr",
];

export function renderBlogMarkdown(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const rawHtml = blogParser.parse(trimmed);
  if (rawHtml instanceof Promise) {
    throw new Error("Async markdown not supported");
  }

  return sanitizeHtml(rawHtml, {
    allowedTags,
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (_tagName, attrs) => {
        const href = typeof attrs.href === "string" ? attrs.href.trim() : "";
        const emptyAttributes: Record<string, string> = {};
        if (!href) return { tagName: "span", attribs: emptyAttributes };
        return {
          tagName: "a",
          attribs: { href, target: "_blank", rel: "noopener noreferrer" },
        };
      },
    },
  });
}
