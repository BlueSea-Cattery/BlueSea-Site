"use client";

import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { statusLabels, statusColors, genderLabels } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { getProxiedUrl } from "@/lib/blob";

interface KittenData {
  id: string;
  name: string;
  gender: string;
  color?: string | null;
  status: string;
  price?: number | null;
  photoUrl?: string | null;
  birthDate?: string | null;
  description?: string | null;
  parent?: { name: string } | null;
  litter?: { name: string } | null;
}

export default function AvailableKittens({ kittens }: { kittens: KittenData[] }) {
  if (kittens.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full gradient-sea flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl">🐱</span>
        </div>
        <h3 className="text-xl font-serif text-ink-700 mb-2">Нет доступных котят</h3>
        <p className="text-ink-400">
          Сейчас все котята забронированы. Свяжитесь с нами для записи на будущие помёты.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 gradient-sea text-white font-semibold rounded-xl text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-sea-500/25 transition-all"
        >
          Связаться <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <>
      <AnimatedSection>
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-sea-600 font-sans font-medium">
            Ищут новый дом
          </span>
          <h2 className="text-2xl md:text-3xl font-serif mt-3 mb-3 text-ink-800">
            Доступные котята
          </h2>
          <div className="divider-sea" />
          <p className="text-ink-500 mt-4 max-w-2xl mx-auto">
            Котята, которые готовы к переезду в новую семью или ожидают бронирования
          </p>
        </div>
      </AnimatedSection>

      {/* items-stretch ensures all cells in a row stretch to the tallest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {kittens.map((kitten, i) => (
          <AnimatedSection key={kitten.id} delay={i * 0.1} className="flex">
            {/* flex-col + h-full stretches card to row height */}
            <div className="bg-white rounded-2xl overflow-hidden card-hover shadow-sm border border-black/5 group flex flex-col w-full">
              {/* Photo */}
              <div className="relative aspect-[4/5] shrink-0">
                <Image
                  src={getProxiedUrl(kitten.photoUrl) || "/images/kitten-1.png"}
                  alt={kitten.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Status Badge only — no gradient */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs border font-sans backdrop-blur-sm ${statusColors[kitten.status]}`}>
                    {statusLabels[kitten.status] || kitten.status}
                  </span>
                </div>
              </div>

              {/* Info block — flex-1 so it grows to fill height */}
              <div className="p-5 flex flex-col flex-1">
                {/* Name + gender/color */}
                <h3 className="text-lg font-serif text-ink-800 group-hover:text-sea-600 transition-colors mb-1">
                  {kitten.name}
                </h3>
                <p className="text-ink-400 text-sm mb-3">
                  {genderLabels[kitten.gender]} • {kitten.color}
                </p>

                {kitten.description && (
                  <p className="text-ink-500 text-sm leading-relaxed mb-3">
                    {kitten.description}
                  </p>
                )}

                <div className="space-y-1.5">
                  {kitten.parent && (
                    <p className="text-ink-400 text-xs">
                      <span className="text-ink-500 font-medium">Мать:</span> {kitten.parent.name}
                    </p>
                  )}
                  {kitten.birthDate && (
                    <p className="text-ink-400 text-xs">
                      <span className="text-ink-500 font-medium">Дата рождения:</span>{" "}
                      {new Date(kitten.birthDate).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>

                {/* Price pushed to bottom */}
                <div className="mt-auto pt-4">
                  {kitten.price && kitten.status !== "sold" && (
                    <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                      <span className="text-sea-600 font-semibold text-lg font-sans">
                        {kitten.price.toLocaleString("ru-RU")} ₽
                      </span>
                      <Link
                        href="/contact"
                        className="text-xs uppercase tracking-wider text-sea-600 hover:text-sea-700 font-sans font-medium transition-colors"
                      >
                        Забронировать →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </>
  );
}
