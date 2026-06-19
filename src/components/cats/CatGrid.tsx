"use client";

import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/shared/AnimatedSection";

interface CatData {
  id: string;
  name: string;
  title?: string | null;
  gender: string;
  color?: string | null;
  photoUrl?: string | null;
  description?: string | null;
}

export default function CatGrid({ cats }: { cats: CatData[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-8 items-stretch">
      {cats.map((cat, i) => (
        <AnimatedSection key={cat.id} delay={i * 0.1} className="flex w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.375rem)]">
          <Link href={`/cats/${cat.id}`} className="block group w-full">
            {/* flex-col + h-full = equal height cards */}
            <div className="bg-white rounded-2xl overflow-hidden card-hover shadow-sm border border-black/5 flex flex-col h-full">
              {/* Photo — no overlay, title badge only */}
              <div className="relative aspect-[4/5] img-container shrink-0">
                <Image
                  src={cat.photoUrl || "/images/hero-cat.png"}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {cat.title && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-[10px] uppercase tracking-wider bg-white/90 text-sea-700 border border-sea-200 rounded-full font-sans backdrop-blur-sm shadow-sm">
                      {cat.title}
                    </span>
                  </div>
                )}
              </div>
              {/* Name + color below photo, flex-1 fills remaining height */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-serif text-ink-800 group-hover:text-sea-600 transition-colors duration-300">
                  {cat.name}
                </h3>
                {cat.color && (
                  <p className="text-ink-400 text-sm mt-1">{cat.color}</p>
                )}
              </div>
            </div>
          </Link>
        </AnimatedSection>
      ))}
    </div>
  );
}
