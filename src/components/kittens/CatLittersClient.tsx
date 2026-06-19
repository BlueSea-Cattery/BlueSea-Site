"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { statusLabels, statusColors, genderLabels } from "@/lib/utils";

interface LitterKitten {
  id: string;
  name: string;
  gender: string;
  color?: string | null;
  birthDate?: string | null;
  status: string;
  price?: number | null;
  photoUrl?: string | null;
  description?: string | null;
}

interface Father {
  id: string;
  name: string;
  photoUrl?: string | null;
  title?: string | null;
}

interface LitterData {
  id: string;
  name: string;
  birthDate?: string | null;
  description?: string | null;
  father?: Father | null;
  kittens: LitterKitten[];
}

interface CatData {
  id: string;
  name: string;
  title?: string | null;
  photoUrl?: string | null;
  color?: string | null;
  description?: string | null;
  litters: LitterData[];
}

export default function CatLittersClient({ cat }: { cat: CatData }) {
  const totalKittens = cat.litters.reduce((sum, l) => sum + l.kittens.length, 0);
  const availableKittens = cat.litters.reduce(
    (sum, l) => sum + l.kittens.filter((k) => k.status === "available").length,
    0,
  );

  return (
    <>
      {/* Cat hero/profile header */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/kittens"
              className="inline-flex items-center gap-2 text-sea-600 hover:text-sea-700 transition-colors text-sm font-sans font-medium mb-8"
            >
              <ArrowLeft size={16} />
              Все котята
            </Link>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Cat photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="shrink-0"
            >
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-lg border-2 border-sea-100">
                <Image
                  src={cat.photoUrl || "/images/cat-female-1.png"}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  sizes="224px"
                  priority
                />
              </div>
            </motion.div>

            {/* Cat info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1"
            >
              <h1 className="text-3xl md:text-4xl font-serif text-ink-800 mb-2">
                Котята {cat.name}
              </h1>
              {cat.title && (
                <p className="text-sea-600 text-sm font-sans font-medium mb-3">
                  {cat.title}
                </p>
              )}
              {cat.color && (
                <p className="text-ink-500 text-sm mb-2">
                  Окрас: <span className="text-ink-700">{cat.color}</span>
                </p>
              )}
              {cat.description && (
                <p className="text-ink-500 text-sm leading-relaxed max-w-2xl mb-4">
                  {cat.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div>
                  <span className="block text-2xl font-semibold text-ink-700 font-sans">
                    {cat.litters.length}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-ink-400 font-sans">
                    {cat.litters.length === 1 ? "помёт" : "помёта"}
                  </span>
                </div>
                <div className="w-px h-10 bg-black/8" />
                <div>
                  <span className="block text-2xl font-semibold text-ink-700 font-sans">
                    {totalKittens}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-ink-400 font-sans">
                    котят всего
                  </span>
                </div>
                {availableKittens > 0 && (
                  <>
                    <div className="w-px h-10 bg-black/8" />
                    <div>
                      <span className="block text-2xl font-semibold text-emerald-600 font-sans">
                        {availableKittens}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-emerald-500 font-sans">
                        свободных
                      </span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Litters */}
      <section className="pb-24 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          {cat.litters.map((litter, li) => (
            <AnimatedSection key={litter.id} delay={li * 0.1}>
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                {/* Litter header */}
                <div className="p-6 md:p-8 bg-gradient-to-r from-sea-50/60 to-cream-200/40 border-b border-black/5">
                  <div className="flex flex-col md:flex-row md:items-center gap-5">
                    {/* Father photo (if exists) */}
                    {litter.father && (
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-sea-200 shadow-md">
                          <Image
                            src={litter.father.photoUrl || "/images/cat-male-1.png"}
                            alt={litter.father.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-ink-400 font-sans">Отец</p>
                          <p className="text-sm font-medium text-sea-700">{litter.father.name}</p>
                          {litter.father.title && (
                            <p className="text-[10px] text-ink-400">{litter.father.title}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Litter info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-serif text-ink-800 mb-1">
                        {litter.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                        {litter.birthDate && (
                          <span>
                            Дата рождения:{" "}
                            {new Date(litter.birthDate).toLocaleDateString("ru-RU", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        )}
                        <span>
                          Котят: <span className="font-semibold text-ink-600">{litter.kittens.length}</span>
                          {" · "}
                          Свободных:{" "}
                          <span className="font-semibold text-emerald-600">
                            {litter.kittens.filter((k) => k.status === "available").length}
                          </span>
                        </span>
                      </div>
                      {litter.description && (
                        <p className="text-ink-500 text-sm mt-2 leading-relaxed">
                          {litter.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kittens grid */}
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {litter.kittens.map((kitten) => (
                      <Link
                        key={kitten.id}
                        href={`/kittens/detail/${kitten.id}`}
                        className="rounded-xl overflow-hidden border border-black/5 transition-all duration-300 hover:shadow-md hover:border-sea-200 block group/kitten"
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={kitten.photoUrl || "/images/kitten-1.png"}
                            alt={kitten.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover/kitten:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                          {/* Status badge */}
                          <div className="absolute top-2 right-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] border font-sans backdrop-blur-sm ${statusColors[kitten.status]}`}
                            >
                              {statusLabels[kitten.status] || kitten.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="font-serif text-sm text-ink-800 font-medium mb-1 group-hover/kitten:text-sea-600 transition-colors">
                            {kitten.name}
                          </p>
                          <p className="text-ink-500 text-xs">
                            {genderLabels[kitten.gender]} • {kitten.color}
                          </p>
                          {kitten.birthDate && (
                            <p className="text-ink-400 text-[10px] mt-0.5">
                              {new Date(kitten.birthDate).toLocaleDateString("ru-RU", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          )}
                          {kitten.description && (
                            <p className="text-ink-400 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                              {kitten.description}
                            </p>
                          )}
                          {kitten.price && kitten.status !== "sold" && (
                            <p className="text-sea-600 font-semibold text-sm mt-1.5 font-sans">
                              {kitten.price.toLocaleString("ru-RU")} ₽
                            </p>
                          )}
                          {kitten.status === "sold" && (
                            <p className="text-ink-400 text-xs mt-1 italic">
                              В новом доме
                            </p>
                          )}
                          <p className="text-sea-600 text-[10px] font-sans font-medium mt-1.5 uppercase tracking-wider">
                            Подробнее →
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}

          {cat.litters.length === 0 && (
            <div className="text-center py-16">
              <p className="text-ink-400 text-lg">У этой кошки пока нет помётов</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
