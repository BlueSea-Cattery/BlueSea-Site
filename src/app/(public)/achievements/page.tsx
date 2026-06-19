import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/shared/PageHeader";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { getProxiedUrl } from "@/lib/blob";

export const metadata = {
  title: "Достижения | Blue Sea",
  description: "Награды и достижения питомника Blue Sea невской маскарадной породы",
  alternates: { canonical: "/achievements" },
};

const getAchievements = unstable_cache(
  async () => {
    try {
      return await prisma.achievement.findMany({
        orderBy: { sortOrder: "asc" },
      });
    } catch {
      return [];
    }
  },
  ["achievements"],
  { tags: ["achievements"], revalidate: 60 }
);

const demoAchievements = [
  { id: "a1", url: "/images/cat-male-1.png", caption: "Grand International Champion — Гранд Лорд Арктур, 2024" },
  { id: "a2", url: "/images/cat-female-1.png", caption: "International Champion — Бриллиант Нева, 2024" },
  { id: "a3", url: "/images/cat-male-2.png", caption: "Champion — Северный Шторм, 2023" },
  { id: "a4", url: "/images/cat-female-2.png", caption: "Champion — Снежная Королева, 2023" },
  { id: "a5", url: "/images/hero-cat.png", caption: "Best in Show — международная выставка, Москва 2024" },
  { id: "a6", url: "/images/kitten-1.png", caption: "Best Kitten — Снежинка, 2025" },
];

export default async function AchievementsPage() {
  const dbItems = await getAchievements();
  // Proxy all image URLs server-side before passing to Client Component.
  const displayItems = (dbItems.length > 0 ? dbItems : demoAchievements)
    .map((item) => ({ ...item, url: getProxiedUrl(item.url) || item.url }));

  return (
    <>
      <PageHeader
        title="Достижения"
        subtitle="Награды и дипломы питомника Blue Sea"
      />
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <GalleryGrid images={displayItems} />
        </div>
      </section>
    </>
  );
}
