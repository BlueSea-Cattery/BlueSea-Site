"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoGalleryProps {
  photos?: string[];
  photoUrl?: string | null;
  alt: string;
  aspectRatio?: string;
  priority?: boolean;
}

export default function PhotoGallery({
  photos = [],
  photoUrl,
  alt,
  aspectRatio = "aspect-[4/5]",
  priority = false,
}: PhotoGalleryProps) {
  // Combine main photo + photos array, deduplicate, fall back to placeholder
  // Proxy all blob URLs through /storage/* to bypass RKN blocks
  const allPhotos = (() => {
    const combined = [photoUrl, ...(photos || [])].filter(
      (p): p is string => Boolean(p)
    );
    const unique = Array.from(new Set(combined));
    // URLs are already proxied by the Server Component — no transformation needed here.
    return unique.length > 0 ? unique : ["/images/hero-cat.png"];
  })();

  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageLoading, setLightboxImageLoading] = useState(false);

  const prev = useCallback(() => {
    setLightboxImageLoading(true);
    setCurrent((c) => (c - 1 + allPhotos.length) % allPhotos.length);
  }, [allPhotos.length]);

  const next = useCallback(() => {
    setLightboxImageLoading(true);
    setCurrent((c) => (c + 1) % allPhotos.length);
  }, [allPhotos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, prev, next]);

  return (
    <>
      <div>
        {/* Main photo */}
        <div
          className={`relative ${aspectRatio} rounded-2xl overflow-hidden shadow-lg group cursor-zoom-in`}
          onClick={() => { setLightboxOpen(true); setLightboxImageLoading(true); }}
        >
          <Image
            src={allPhotos[current]}
            alt={alt}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={priority}
          />

          {/* Zoom hint overlay */}
          <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/10 transition-colors duration-300" />
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/0 group-hover:bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-md">
            <ZoomIn size={15} className="text-ink-700" />
          </div>

          {/* Arrow navigation (only if > 1 photo) */}
          {allPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft size={18} className="text-ink-700" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
                aria-label="Следующее фото"
              >
                <ChevronRight size={18} className="text-ink-700" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {allPhotos.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrent(i);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      i === current
                        ? "bg-white w-4"
                        : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Фото ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails (only if > 1 photo) */}
        {allPhotos.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {allPhotos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                  i === current
                    ? "border-sea-500 shadow-md shadow-sea-200"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`Выбрать фото ${i + 1}`}
              >
                <Image
                  src={photo}
                  alt={`${alt} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/90 backdrop-blur-lg p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-4xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors z-10"
                aria-label="Закрыть"
              >
                <X size={28} />
              </button>

              {/* Main lightbox image */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                {/* Loading indicator */}
                {lightboxImageLoading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink-900/60">
                    <Loader2 size={40} className="text-white animate-spin" />
                  </div>
                )}
                <Image
                  src={allPhotos[current]}
                  alt={alt}
                  fill
                  className={`object-contain bg-ink-900 transition-opacity duration-300 ${lightboxImageLoading ? "opacity-0" : "opacity-100"}`}
                  sizes="100vw"
                  onLoad={() => setLightboxImageLoading(false)}
                />

                {/* Lightbox arrow navigation */}
                {allPhotos.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white/40 transition-colors z-10"
                      aria-label="Предыдущее фото"
                    >
                      <ChevronLeft size={22} className="text-white" />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white/40 transition-colors z-10"
                      aria-label="Следующее фото"
                    >
                      <ChevronRight size={22} className="text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Lightbox dot indicators */}
              {allPhotos.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {allPhotos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setLightboxImageLoading(true); setCurrent(i); }}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        i === current
                          ? "bg-white w-4"
                          : "bg-white/40 hover:bg-white/70"
                      }`}
                      aria-label={`Фото ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Counter */}
              {allPhotos.length > 1 && (
                <p className="text-center text-white/50 mt-2 text-xs font-sans">
                  {current + 1} / {allPhotos.length}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
