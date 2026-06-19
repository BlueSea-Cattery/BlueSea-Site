"use client";

import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { statusLabels, statusColors, genderLabels } from "@/lib/utils";
import { getProxiedUrl } from "@/lib/blob";

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

interface ParentCat {
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
  mother?: ParentCat | null;
  father?: ParentCat | null;
  kittens: LitterKitten[];
}

export default function LittersSection({ litters }: { litters: LitterData[] }) {
  if (litters.length === 0) return null;

  return (
    <>
      <AnimatedSection>
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-sea-600 font-sans font-medium">
            История питомника
          </span>
          <h2 className="text-2xl md:text-3xl font-serif mt-3 mb-3 text-ink-800">
            Помёты
          </h2>
          <div className="divider-sea" />
          <p className="text-ink-500 mt-4 max-w-2xl mx-auto">
            Все помёты наших кошек — включая котят, которые уже нашли свой дом
          </p>
        </div>
      </AnimatedSection>

      <div className="space-y-12">
        {litters.map((litter, li) => (
          <AnimatedSection key={litter.id} delay={li * 0.1}>
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
              {/* Litter header — parents info */}
              <div className="p-6 md:p-8 bg-gradient-to-r from-sea-50/60 to-cream-200/40 border-b border-black/5">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Parents photos */}
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Mother */}
                    {litter.mother && (
                      <Link href="/cats" className="group">
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-sea-200 shadow-md group-hover:border-sea-400 transition-colors">
                          <Image
                            src={getProxiedUrl(litter.mother.photoUrl) || "/images/cat-female-1.png"}
                            alt={litter.mother.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      </Link>
                    )}
                    <span className="text-sea-300 text-xl font-serif">×</span>
                    {/* Father */}
                    {litter.father && (
                      <Link href="/cats" className="group">
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-sea-200 shadow-md group-hover:border-sea-400 transition-colors">
                          <Image
                            src={getProxiedUrl(litter.father.photoUrl) || "/images/cat-male-1.png"}
                            alt={litter.father.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Litter info */}
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-serif text-ink-800 mb-1">
                      {litter.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                      {litter.mother && (
                        <span>
                          <span className="text-ink-400">Мать:</span>{" "}
                          <span className="text-sea-600 font-medium">{litter.mother.name}</span>
                          {litter.mother.title && (
                            <span className="text-ink-400 text-xs ml-1">({litter.mother.title})</span>
                          )}
                        </span>
                      )}
                      {litter.father && (
                        <span>
                          <span className="text-ink-400">Отец:</span>{" "}
                          <span className="text-sea-600 font-medium">{litter.father.name}</span>
                          {litter.father.title && (
                            <span className="text-ink-400 text-xs ml-1">({litter.father.title})</span>
                          )}
                        </span>
                      )}
                      {litter.birthDate && (
                        <span>
                          <span className="text-ink-400">Дата рождения:</span>{" "}
                          {new Date(litter.birthDate).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    {litter.description && (
                      <p className="text-ink-500 text-sm mt-2 leading-relaxed max-w-2xl">
                        {litter.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-ink-400 font-sans">
                        Котят в помёте: <span className="font-semibold text-ink-600">{litter.kittens.length}</span>
                      </span>
                      <span className="text-xs text-ink-400 font-sans">
                        Свободных:{" "}
                        <span className="font-semibold text-emerald-600">
                          {litter.kittens.filter((k) => k.status === "available").length}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kittens grid */}
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {litter.kittens.map((kitten) => (
                    <div
                      key={kitten.id}
                      className={`rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-md ${
                        kitten.status === "sold"
                          ? "border-black/5 opacity-70 grayscale-[30%]"
                          : "border-black/5 hover:border-sea-200"
                      }`}
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={getProxiedUrl(kitten.photoUrl) || "/images/kitten-1.png"}
                          alt={kitten.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-transparent" />
                        {/* Status badge */}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] border font-sans backdrop-blur-sm ${statusColors[kitten.status]}`}>
                            {statusLabels[kitten.status] || kitten.status}
                          </span>
                        </div>
                        {/* Name at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white font-serif text-sm font-medium">
                            {kitten.name}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-white">
                        <p className="text-ink-500 text-xs">
                          {genderLabels[kitten.gender]} • {kitten.color}
                        </p>
                        {kitten.price && kitten.status !== "sold" && (
                          <p className="text-sea-600 font-semibold text-sm mt-1 font-sans">
                            {kitten.price.toLocaleString("ru-RU")} ₽
                          </p>
                        )}
                        {kitten.status === "sold" && (
                          <p className="text-ink-400 text-xs mt-1 italic">
                            В новом доме
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </>
  );
}
