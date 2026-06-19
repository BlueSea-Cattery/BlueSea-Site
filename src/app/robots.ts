import type { MetadataRoute } from "next";

const BASE_URL = "https://bluesea-cattery.ru";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Все обычные поисковики
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // Google
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // Yandex
      {
        userAgent: "YandexBot",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // OpenAI / ChatGPT
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // Google AI (Gemini, AI Overviews)
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // Anthropic (Claude)
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // Meta AI
      {
        userAgent: "FacebookBot",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // Apple
      {
        userAgent: "Applebot",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // Perplexity AI
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // Common Crawl (обучающие данные)
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
