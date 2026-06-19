import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import PageHeader from "@/components/shared/PageHeader";
import AnimatedSection from "@/components/shared/AnimatedSection";
import PedigreeModal from "@/components/shared/PedigreeModal";
import { statusLabels, statusColors } from "@/lib/utils";
import { getProxiedUrl } from "@/lib/blob";

export const metadata = {
  title: "Котята | Blue Sea",
  description: "Помёты и котята питомника Blue Sea невской маскарадной породы.",
  alternates: { canonical: "/kittens" },
};

const getLitters = unstable_cache(
  async () => {
    try {
      return await prisma.litter.findMany({
        where: { isActive: true },
        include: {
          mother: { select: { id: true, name: true, title: true, photoUrl: true } },
          father: { select: { id: true, name: true, title: true, photoUrl: true } },
          pedigree: { select: { photoUrl: true } },
          kittens: {
            where: { isActive: true },
            orderBy: { createdAt: "asc" },
            select: {
              id: true, name: true, gender: true, color: true,
              status: true, price: true, photoUrl: true, description: true,
              birthDate: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      });
    } catch {
      return [];
    }
  },
  ["litters"],
  { tags: ["kittens", "cats"], revalidate: 60 }
);

const demoLitters = [
  {
    id: "l1", name: "Помёт «А»", birthDate: "2025-11-10",
    mother: { id: "c1", name: "Бриллиант Нева", title: "International Champion", photoUrl: "/images/cat-female-1.png" },
    father: { id: "c2", name: "Гранд Лорд Арктур", title: "Grand International Champion", photoUrl: "/images/cat-male-1.png" },
    pedigree: null,
    kittens: [
      { id: "k1", name: "Аврора", gender: "female", color: "Блю пойнт", status: "sold", price: null, photoUrl: "/images/kitten-1.png", description: "Нежная девочка с изысканным характером", birthDate: "2025-11-10" },
      { id: "k2", name: "Снежинка", gender: "female", color: "Сил пойнт", status: "available", price: 45000, photoUrl: "/images/kitten-1.png", description: "Ласковая малышка с нежным характером", birthDate: "2025-11-10" },
      { id: "k3", name: "Барон", gender: "male", color: "Сил тэбби пойнт", status: "reserved", price: 50000, photoUrl: "/images/kitten-2.png", description: "Крепкий и активный котик, копия папы", birthDate: "2025-11-10" },
    ],
  },
  {
    id: "l2", name: "Помёт «Б»", birthDate: "2026-01-25",
    mother: { id: "c3", name: "Снежная Королева", title: "Champion", photoUrl: "/images/cat-female-2.png" },
    father: { id: "c4", name: "Северный Шторм", title: "Champion", photoUrl: "/images/cat-male-2.png" },
    pedigree: null,
    kittens: [
      { id: "k4", name: "Метель", gender: "female", color: "Крем пойнт", status: "available", price: 40000, photoUrl: "/images/kitten-1.png", description: "Ласковая и игривая малышка с редким окрасом", birthDate: "2026-01-25" },
      { id: "k5", name: "Ветер", gender: "male", color: "Блю тэбби пойнт", status: "evaluation", price: null, photoUrl: "/images/kitten-2.png", description: "Перспективный кот, оставлен для оценки", birthDate: "2026-01-25" },
      { id: "k6", name: "Буран", gender: "male", color: "Сил тэбби пойнт", status: "available", price: 48000, photoUrl: "/images/kitten-2.png", description: "Активный и любопытный котик, отличный компаньон", birthDate: "2026-01-25" },
      { id: "k7", name: "Блик", gender: "male", color: "Блю пойнт", status: "available", price: 47000, photoUrl: "/images/kitten-2.png", description: "Спокойный и ласковый мальчик с глубоким голубым окрасом", birthDate: "2026-01-25" },
    ],
  },
];

const genderLabels: Record<string, string> = { male: "Кот", female: "Кошка" };

export default async function KittensPage() {
  const dbLitters = await getLitters();
  const litters = dbLitters.length > 0 ? dbLitters : demoLitters;

  return (
    <>
      <PageHeader
        title="Котята"
        subtitle="Помёты питомника Blue Sea — невская маскарадная порода"
      />

      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          {litters.map((litter, i) => (
            <AnimatedSection key={litter.id} delay={i * 0.1}>

              {/* Decorative divider between litters */}
              {i > 0 && (
                <div className="flex items-center gap-4 mb-16 -mt-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sea-300/40 to-transparent" />
                  <span className="text-sea-400/60 text-xl">🐾</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sea-300/40 to-transparent" />
                </div>
              )}


              {/* ── Litter Title ── */}
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-serif mb-2 text-ink-800">{litter.name}</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-sea-600 font-sans font-medium">
                  {litter.birthDate && new Date(litter.birthDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                {litter.pedigree?.photoUrl && (
                  <div className="mt-3">
                    <PedigreeModal photoUrl={getProxiedUrl(litter.pedigree.photoUrl)} label="Родословная помёта" />
                  </div>
                )}
              </div>

              {/* ── Parents ── */}
              <div className="grid grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
                {[
                  { label: "Мать", cat: litter.mother },
                  { label: "Отец", cat: litter.father },
                ].map(({ label, cat }) => (
                  <div key={label} className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden text-center">
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={getProxiedUrl(cat?.photoUrl) || "/images/hero-cat.png"}
                        alt={cat?.name || label}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 300px"
                      />
                    </div>
                    <div className="px-4 py-4">
                      <span className="text-[10px] uppercase tracking-widest text-sea-500 font-sans">{label}</span>
                      {cat ? (
                        <Link href={`/cats/${cat.id}`} className="block font-serif text-lg text-ink-800 hover:text-sea-600 transition-colors mt-0.5">
                          {cat.name}
                        </Link>
                      ) : (
                        <p className="font-serif text-ink-400 mt-0.5">—</p>
                      )}
                      {cat?.title && (
                        <p className="text-ink-400 text-xs mt-0.5">{cat.title}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Kittens Grid ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {litter.kittens.map((kitten, ki) => (
                  <AnimatedSection key={kitten.id} delay={ki * 0.07} className="flex">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5 flex flex-col w-full card-hover">
                      {/* Photo */}
                      <Link href={`/kittens/detail/${kitten.id}`} className="relative aspect-[4/5] shrink-0 block">
                        <Image
                          src={getProxiedUrl(kitten.photoUrl) || "/images/kitten-1.png"}
                          alt={kitten.name}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {/* Status badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs border font-sans backdrop-blur-sm ${statusColors[kitten.status]}`}>
                            {statusLabels[kitten.status] || kitten.status}
                          </span>
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="p-5 flex flex-col flex-1">
                        <Link href={`/kittens/detail/${kitten.id}`} className="group/name">
                          <h3 className="text-lg font-serif text-ink-800 mb-1 group-hover/name:text-sea-600 transition-colors">{kitten.name}</h3>
                        </Link>
                        <p className="text-ink-400 text-sm mb-3">
                          {genderLabels[kitten.gender]} · {kitten.color}
                        </p>

                        {kitten.description && (
                          <p className="text-ink-500 text-sm leading-relaxed mb-3">{kitten.description}</p>
                        )}

                        {kitten.birthDate && (
                          <p className="text-ink-400 text-xs mb-3">
                            <span className="font-medium text-ink-500">Дата рождения:</span>{" "}
                            {new Date(kitten.birthDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        )}

                        {/* Price pinned to bottom */}
                        <div className="mt-auto pt-4">
                          {litter.pedigree?.photoUrl && (
                            <div className="mb-3">
                              <PedigreeModal photoUrl={getProxiedUrl(litter.pedigree.photoUrl)} />
                            </div>
                          )}
                          <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                            {kitten.price && kitten.status !== "sold" ? (
                              <span className="text-sea-600 font-semibold text-lg font-sans">
                                {kitten.price.toLocaleString("ru-RU")} ₽
                              </span>
                            ) : (
                              <span />
                            )}
                            <Link
                              href={`/kittens/detail/${kitten.id}`}
                              className="text-xs uppercase tracking-wider text-sea-600 hover:text-sea-700 font-sans font-medium transition-colors"
                            >
                              Подробнее →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>

            </AnimatedSection>
          ))}

          {litters.length === 0 && (
            <AnimatedSection>
              <div className="text-center py-20 text-ink-400">
                <p className="text-2xl font-serif mb-3">Помётов пока нет</p>
                <p className="text-sm">Свяжитесь с нами, чтобы узнать о планируемых помётах.</p>
                <Link href="/contact" className="inline-block mt-6 px-8 py-3 gradient-sea text-white rounded-xl text-sm font-semibold uppercase tracking-wider">
                  Связаться
                </Link>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </>
  );
}
