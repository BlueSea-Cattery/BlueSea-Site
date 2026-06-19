"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Palette, Tag } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/shared/AnimatedSection";
import PhotoGallery from "@/components/shared/PhotoGallery";
import { formatDate, genderLabels, statusLabels, statusColors } from "@/lib/utils";

interface ParentInfo {
  id: string;
  name: string;
  photoUrl?: string | null;
  title?: string | null;
}

interface KittenProfileProps {
  kitten: {
    id: string;
    name: string;
    gender: string;
    color?: string | null;
    birthDate?: string | null;
    status: string;
    price?: number | null;
    description?: string | null;
    photoUrl?: string | null;
    photos?: string[];
    parent?: ParentInfo | null;
    litter?: {
      id: string;
      name: string;
      birthDate?: string | null;
      mother?: ParentInfo | null;
      father?: ParentInfo | null;
    } | null;
  };
}

export default function KittenProfileClient({ kitten }: KittenProfileProps) {
  return (
    <div className="pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/kittens"
            className="inline-flex items-center gap-2 text-ink-500 hover:text-sea-600 transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Назад к котятам
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Photo gallery */}
          <AnimatedSection direction="left">
            <PhotoGallery
              photos={kitten.photos}
              photoUrl={kitten.photoUrl}
              alt={kitten.name}
              aspectRatio="aspect-[4/5]"
              priority
            />
          </AnimatedSection>

          {/* Info */}
          <AnimatedSection direction="right">
            <div className="flex flex-col justify-center h-full">
              {/* Status badge */}
              <div className="mb-4">
                <span
                  className={`inline-flex px-4 py-1.5 text-xs uppercase tracking-wider rounded-full border font-sans font-medium ${statusColors[kitten.status]}`}
                >
                  {statusLabels[kitten.status] || kitten.status}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif mb-4 text-ink-800">
                {kitten.name}
              </h1>

              <div className="divider-sea mb-6" style={{ margin: "0 0 1.5rem 0" }} />

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-ink-600">
                  <div className="w-8 h-8 rounded-lg bg-sea-50 flex items-center justify-center">
                    <span className="text-sm">{kitten.gender === "male" ? "♂" : "♀"}</span>
                  </div>
                  <span>{genderLabels[kitten.gender] || kitten.gender}</span>
                </div>

                {kitten.color && (
                  <div className="flex items-center gap-3 text-ink-600">
                    <div className="w-8 h-8 rounded-lg bg-sea-50 flex items-center justify-center">
                      <Palette size={14} className="text-sea-600" />
                    </div>
                    <span>{kitten.color}</span>
                  </div>
                )}

                {kitten.birthDate && (
                  <div className="flex items-center gap-3 text-ink-600">
                    <div className="w-8 h-8 rounded-lg bg-sea-50 flex items-center justify-center">
                      <Calendar size={14} className="text-sea-600" />
                    </div>
                    <span>{formatDate(kitten.birthDate)}</span>
                  </div>
                )}

                {kitten.price && kitten.status !== "sold" && (
                  <div className="flex items-center gap-3 text-ink-600">
                    <div className="w-8 h-8 rounded-lg bg-sea-50 flex items-center justify-center">
                      <Tag size={14} className="text-sea-600" />
                    </div>
                    <span className="text-sea-600 font-semibold font-sans text-lg">
                      {kitten.price.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                )}
              </div>

              {kitten.description && (
                <p className="text-ink-600 leading-relaxed text-lg mb-8">
                  {kitten.description}
                </p>
              )}

              {/* CTA button */}
              {kitten.status === "available" && (
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 gradient-sea text-white font-semibold rounded-xl text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-sea-500/25 transition-all w-fit mb-8"
                >
                  Забронировать
                </Link>
              )}

              {/* Parents block */}
              {(() => {
                // Mother: direct parent relation OR litter.mother
                const mother = kitten.parent ?? kitten.litter?.mother ?? null;
                // Father: from litter.father
                const father = kitten.litter?.father ?? null;

                if (!mother && !father) return null;

                return (
                  <div className="mt-2">
                    <h3 className="text-xl font-serif mb-4 text-ink-800">Родители</h3>
                    <div className="flex gap-4 flex-wrap">
                      {/* Mother */}
                      {mother && (
                        <Link
                          href={`/cats/${mother.id}`}
                          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-black/5 shadow-sm hover:shadow-md hover:border-sea-200 transition-all duration-300 flex-1 min-w-[160px]"
                        >
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-sea-100 shrink-0">
                            <Image
                              src={mother.photoUrl || "/images/cat-female-1.png"}
                              alt={mother.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-ink-400 font-sans">Мать</p>
                            <p className="text-sm font-serif text-ink-800">{mother.name}</p>
                            {mother.title && (
                              <p className="text-[10px] text-sea-600 font-sans">{mother.title}</p>
                            )}
                          </div>
                        </Link>
                      )}

                      {/* Father */}
                      {father && (
                        <Link
                          href={`/cats/${father.id}`}
                          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-black/5 shadow-sm hover:shadow-md hover:border-sea-200 transition-all duration-300 flex-1 min-w-[160px]"
                        >
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-sea-100 shrink-0">
                            <Image
                              src={father.photoUrl || "/images/cat-male-1.png"}
                              alt={father.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-ink-400 font-sans">Отец</p>
                            <p className="text-sm font-serif text-ink-800">{father.name}</p>
                            {father.title && (
                              <p className="text-[10px] text-sea-600 font-sans">{father.title}</p>
                            )}
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Litter info */}
              {kitten.litter && (
                <div className="mt-6 p-4 bg-cream-100/60 rounded-xl border border-black/5">
                  <p className="text-xs uppercase tracking-wider text-ink-400 font-sans mb-1">Помёт</p>
                  <p className="text-sm font-serif text-ink-800">{kitten.litter.name}</p>
                  {kitten.litter.birthDate && (
                    <p className="text-xs text-ink-500 mt-0.5">
                      {new Date(kitten.litter.birthDate).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
