"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";

interface GalleryImage {
  id: string;
  url: string;
  caption?: string | null;
}

export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  // Masonry-like layout with varying heights
  const getSpan = (i: number) => {
    const pattern = [2, 1, 1, 1, 2, 1, 1, 1];
    return pattern[i % pattern.length];
  };

  return (
    <>
      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        {images.map((img, i) => (
          <AnimatedSection key={img.id} delay={i * 0.05}>
            <div
              onClick={() => setSelected(img)}
              className="cursor-pointer group break-inside-avoid"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-black/5">
                <div
                  className={`relative ${getSpan(i) === 2 ? "aspect-[3/4]" : "aspect-square"}`}
                >
                  <Image
                    src={img.url}
                    alt={img.caption || "Фото"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/20 transition-colors duration-500" />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ink-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-white text-sm">{img.caption}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/90 backdrop-blur-lg p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-4xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors z-10"
              >
                <X size={28} />
              </button>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={selected.url}
                  alt={selected.caption || "Фото"}
                  fill
                  className="object-contain bg-ink-900"
                  sizes="100vw"
                />
              </div>
              {selected.caption && (
                <p className="text-center text-white/70 mt-4 text-sm">
                  {selected.caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
