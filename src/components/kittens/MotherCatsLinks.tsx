"use client";

import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { ArrowRight } from "lucide-react";
import { getProxiedUrl } from "@/lib/blob";

interface MotherCatData {
  id: string;
  name: string;
  photoUrl?: string | null;
  title?: string | null;
  totalKittens: number;
  availableKittens: number;
  littersCount: number;
}

export default function MotherCatsLinks({ cats }: { cats: MotherCatData[] }) {
  if (cats.length === 0) return null;

  return (
    <>
      <AnimatedSection>
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-sea-600 font-sans font-medium">
            Помёты
          </span>
          <h2 className="text-2xl md:text-3xl font-serif mt-3 mb-3 text-ink-800">
            Наши кошки и их котята
          </h2>
          <div className="divider-sea" />
          <p className="text-ink-500 mt-4 max-w-2xl mx-auto">
            Выберите кошку, чтобы увидеть все её помёты и котят, включая выпускников
          </p>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cats.map((cat, i) => (
          <AnimatedSection key={cat.id} delay={i * 0.1}>
            <Link href={`/kittens/${cat.id}`} className="block group">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5 transition-all duration-300 hover:shadow-lg hover:border-sea-200 hover:-translate-y-1">
                {/* Cat photo — no overlay */}
                <div className="relative aspect-[4/3]">
                  <Image
                    src={getProxiedUrl(cat.photoUrl) || "/images/cat-female-1.png"}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Name + title below photo */}
                <div className="px-5 pt-4 pb-2">
                  <h3 className="text-lg font-serif text-ink-800 mb-0.5">
                    {cat.name}
                  </h3>
                  {cat.title && (
                    <p className="text-sea-600 text-xs font-sans">
                      {cat.title}
                    </p>
                  )}
                </div>

                {/* Stats + CTA */}
                <div className="px-5 pb-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <span className="block text-lg font-semibold text-ink-700 font-sans">
                        {cat.littersCount}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-ink-400 font-sans">
                        {cat.littersCount === 1 ? "помёт" : "помёта"}
                      </span>
                    </div>
                    <div className="w-px h-8 bg-black/8" />
                    <div className="text-center">
                      <span className="block text-lg font-semibold text-ink-700 font-sans">
                        {cat.totalKittens}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-ink-400 font-sans">
                        котят
                      </span>
                    </div>
                    {cat.availableKittens > 0 && (
                      <>
                        <div className="w-px h-8 bg-black/8" />
                        <div className="text-center">
                          <span className="block text-lg font-semibold text-emerald-600 font-sans">
                            {cat.availableKittens}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-sans">
                            свободных
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full gradient-sea flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity shadow-md shadow-sea-500/20">
                    <ArrowRight size={18} className="text-white" />
                  </div>
                </div>
              </div>
            </Link>
          </AnimatedSection>
        ))}
      </div>
    </>
  );
}
