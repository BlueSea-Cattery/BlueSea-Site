import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/shared/PageHeader";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { getProxiedUrl } from "@/lib/blob";

export const metadata = {
  title: "Галерея",
  description: "Фотогалерея невских маскарадных кошек питомника Blue Sea",
  alternates: { canonical: "/gallery" },
};

const getImages = unstable_cache(
  async () => {
    try {
      return await prisma.galleryImage.findMany({
        orderBy: { sortOrder: "asc" },
      });
    } catch {
      return [];
    }
  },
  ["gallery"],
  { tags: ["gallery"], revalidate: 60 }
);

const demoImages = [
  { id: "g1", url: "/images/hero-cat.png", caption: "Наша гордость" },
  { id: "g2", url: "/images/cat-male-1.png", caption: "Гранд Лорд Арктур" },
  { id: "g3", url: "/images/cat-female-1.png", caption: "Бриллиант Нева" },
  { id: "g4", url: "/images/cat-male-2.png", caption: "Северный Шторм" },
  { id: "g5", url: "/images/cat-female-2.png", caption: "Снежная Королева" },
  { id: "g6", url: "/images/kitten-1.png", caption: "Наши котята" },
  { id: "g7", url: "/images/kitten-2.png", caption: "Игры котят" },
  { id: "g8", url: "/images/hero-cat.png", caption: "Невская маскарадная" },
];

export default async function GalleryPage() {
  const images = await getImages();
  // Proxy all image URLs server-side so GalleryGrid receives clean /storage/... paths.
  const displayImages = (images.length > 0 ? images : demoImages)
    .map((img) => ({ ...img, url: getProxiedUrl(img.url) || img.url }));

  return (
    <>
      <PageHeader
        title="Галерея"
        subtitle="Фотографии наших кошек и котят"
      />
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <GalleryGrid images={displayImages} />
        </div>
      </section>
    </>
  );
}
