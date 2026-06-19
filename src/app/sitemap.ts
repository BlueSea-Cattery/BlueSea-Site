import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = "https://bluesea-cattery.ru";

type SitemapEntry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // --- Static pages ---
  const staticPages: SitemapEntry[] = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/cats`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/kittens`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/gallery`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/achievements`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // --- Dynamic: cats ---
  let catPages: SitemapEntry[] = [];
  try {
    const cats = await prisma.cat.findMany({
      select: { id: true, updatedAt: true },
    });
    catPages = cats.map((cat) => ({
      url: `${BASE_URL}/cats/${cat.id}`,
      lastModified: cat.updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable — skip dynamic pages
  }

  // --- Dynamic: kittens detail pages ---
  let kittenPages: SitemapEntry[] = [];
  try {
    const kittens = await prisma.kitten.findMany({
      select: { id: true, updatedAt: true },
    });
    kittenPages = kittens.map((kitten) => ({
      url: `${BASE_URL}/kittens/detail/${kitten.id}`,
      lastModified: kitten.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable — skip dynamic pages
  }

  // --- Dynamic: kittens by cat (litters pages) ---
  let litterPages: SitemapEntry[] = [];
  try {
    const catsWithLitters = await prisma.cat.findMany({
      where: {
        littersAsMother: { some: {} },
      },
      select: { id: true, updatedAt: true },
    });
    litterPages = catsWithLitters.map((cat) => ({
      url: `${BASE_URL}/kittens/${cat.id}`,
      lastModified: cat.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable — skip dynamic pages
  }

  return [...staticPages, ...catPages, ...kittenPages, ...litterPages];
}
