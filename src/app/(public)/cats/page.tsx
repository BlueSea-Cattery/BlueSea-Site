import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/shared/PageHeader";
import CatGrid from "@/components/cats/CatGrid";
import { getProxiedUrl } from "@/lib/blob";

export const metadata = {
  title: "Наши производители",
  description: "Невские маскарадные кошки питомника Blue Sea — породистые коты и кошки с международными титулами.",
  alternates: { canonical: "/cats" },
};

const getCats = unstable_cache(
  async () => {
    try {
      return await prisma.cat.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });
    } catch {
      return [];
    }
  },
  ["cats"],
  { tags: ["cats"], revalidate: 60 }
);

export default async function CatsPage() {
  const cats = await getCats();
  // Proxy all photoUrls server-side before passing to CatGrid (Client Component).
  const proxyCats = cats.map((c) => ({ ...c, photoUrl: getProxiedUrl(c.photoUrl) }));
  const males = proxyCats.filter((c) => c.gender === "male");
  const females = proxyCats.filter((c) => c.gender === "female");

  return (
    <>
      <PageHeader
        title="Наши производители"
        subtitle="Породистые невские маскарадные кошки с международными титулами"
      />

      {/* Males */}
      {males.length > 0 && (
        <section className="pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-serif mb-8 text-center">
              <span className="text-gradient-sea">Коты</span>
            </h2>
            <CatGrid cats={males} />
          </div>
        </section>
      )}

      {/* Females */}
      {females.length > 0 && (
        <section className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-serif mb-8 text-center">
              <span className="text-gradient-sea">Кошки</span>
            </h2>
            <CatGrid cats={females} />
          </div>
        </section>
      )}
    </>
  );
}
