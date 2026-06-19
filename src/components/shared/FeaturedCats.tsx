"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";

interface Cat {
  id: string;
  name: string;
  title: string | null;
  gender: string;
  photoUrl: string | null;
}

export default function FeaturedCats({ cats }: { cats: Cat[] }) {
  return (
    <section className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sea-50/40 to-transparent" />
      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-sea-600 font-sans font-medium">
              Гордость питомника
            </span>
            <h2 className="text-3xl md:text-4xl font-serif mt-4 mb-4">
              Наши производители
            </h2>
            <div className="divider-sea" />
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cats.map((cat, i) => (
            <AnimatedSection key={cat.id} delay={i * 0.15}>
              <Link href="/cats" className="block group">
                <div className="bg-white rounded-2xl overflow-hidden card-hover shadow-sm border border-black/5">
                  <div className="relative aspect-[4/5] img-container">
                    <Image
                      src={cat.photoUrl || "/images/cat-male-1.png"}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="text-xs uppercase tracking-wider text-sea-200 font-sans">
                        {cat.title}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif group-hover:text-sea-600 transition-colors duration-300 text-ink-800">
                      {cat.name}
                    </h3>
                    <p className="text-ink-400 text-sm mt-1">
                      {cat.gender === "male" ? "Кот" : "Кошка"}
                    </p>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.3}>
          <div className="text-center mt-12">
            <Link
              href="/cats"
              className="inline-flex items-center gap-2 text-sea-600 hover:text-sea-700 transition-colors text-sm uppercase tracking-wider font-sans font-medium"
            >
              Все наши кошки
              <ArrowRight size={16} />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
