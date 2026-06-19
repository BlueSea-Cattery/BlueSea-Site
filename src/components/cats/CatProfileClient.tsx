"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Palette } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/shared/AnimatedSection";
import PhotoGallery from "@/components/shared/PhotoGallery";
import { formatDate, genderLabels } from "@/lib/utils";

interface LitterInfo {
  id: string;
  name: string;
  birthDate: string | null;
  partnerName: string | null;
  partnerId: string | null;
  kittensCount: number;
  kittens: Array<{ id: string; name: string; status: string }>;
}

interface CatProfileProps {
  cat: {
    id: string;
    name: string;
    title: string;
    gender: string;
    color: string;
    photoUrl: string;
    photos?: string[];
    description: string;
    birthDate: string;
    litters: LitterInfo[];
  };
}

export default function CatProfileClient({ cat }: CatProfileProps) {
  const partnerLabel = cat.gender === "female" ? "Отец" : "Мать";

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
            href="/cats"
            className="inline-flex items-center gap-2 text-ink-500 hover:text-sea-600 transition-colors text-sm mb-8"
          >
            <ArrowLeft size={16} />
            Назад к кошкам
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Photo gallery */}
          <AnimatedSection direction="left">
            <PhotoGallery
              photos={cat.photos}
              photoUrl={cat.photoUrl}
              alt={cat.name}
              aspectRatio="aspect-[4/5]"
              priority
            />
          </AnimatedSection>

          {/* Info */}
          <AnimatedSection direction="right">
            <div className="flex flex-col justify-center h-full">
              {cat.title && (
                <span className="inline-block px-4 py-1.5 text-xs uppercase tracking-wider bg-sea-50 text-sea-700 border border-sea-200 rounded-full mb-4 w-fit">
                  {cat.title}
                </span>
              )}

              <h1 className="text-4xl md:text-5xl font-serif mb-4 text-ink-800">
                {cat.name}
              </h1>

              <div className="divider-sea mb-6" style={{ margin: "0 0 1.5rem 0" }} />

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-ink-600">
                  <div className="w-8 h-8 rounded-lg bg-sea-50 flex items-center justify-center">
                    <span className="text-sm">{cat.gender === "male" ? "♂" : "♀"}</span>
                  </div>
                  <span>{genderLabels[cat.gender] || cat.gender}</span>
                </div>

                {cat.color && (
                  <div className="flex items-center gap-3 text-ink-600">
                    <div className="w-8 h-8 rounded-lg bg-sea-50 flex items-center justify-center">
                      <Palette size={14} className="text-sea-600" />
                    </div>
                    <span>{cat.color}</span>
                  </div>
                )}

                {cat.birthDate && (
                  <div className="flex items-center gap-3 text-ink-600">
                    <div className="w-8 h-8 rounded-lg bg-sea-50 flex items-center justify-center">
                      <Calendar size={14} className="text-sea-600" />
                    </div>
                    <span>{formatDate(cat.birthDate)}</span>
                  </div>
                )}
              </div>

              {cat.description && (
                <p className="text-ink-600 leading-relaxed text-lg">
                  {cat.description}
                </p>
              )}

              {/* Litters */}
              {cat.litters.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-serif mb-4 text-ink-800">Помёты</h3>
                  <div className="space-y-3">
                    {cat.litters.map((litter) => (
                      <Link
                        key={litter.id}
                        href="/kittens"
                        className="block bg-white rounded-xl p-5 border border-black/5 shadow-sm hover:shadow-md hover:border-sea-200 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif text-ink-800 text-lg">{litter.name}</span>
                          <span className="text-xs text-sea-600 font-sans font-medium">
                            {litter.kittensCount}{" "}
                            {litter.kittensCount === 1 ? "котёнок" : litter.kittensCount < 5 ? "котёнка" : "котят"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-ink-400">
                          {litter.birthDate && (
                            <span>{formatDate(litter.birthDate)}</span>
                          )}
                          {litter.partnerName && (
                            <span>{partnerLabel}: {litter.partnerName}</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}

