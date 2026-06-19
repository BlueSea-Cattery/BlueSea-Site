"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/shared/AnimatedSection";
import { statusLabels, statusColors, genderLabels } from "@/lib/utils";
import { getProxiedUrl } from "@/lib/blob";

interface KittenData {
  id: string;
  name: string;
  gender: string;
  color?: string | null;
  status: string;
  price?: number | null;
  photoUrl?: string | null;
  description?: string | null;
  parent?: { name: string } | null;
}

const filterOptions = [
  { key: "all", label: "Все" },
  { key: "available", label: "Доступен" },
  { key: "reserved", label: "Забронирован" },
  { key: "evaluation", label: "На оценке" },
  { key: "sold", label: "Продан" },
];

export default function KittensGrid({ kittens }: { kittens: KittenData[] }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? kittens : kittens.filter((k) => k.status === filter);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={`px-5 py-2 rounded-full text-sm transition-all duration-300 font-sans ${
              filter === opt.key
                ? "gradient-sea text-white font-semibold shadow-md shadow-sea-500/20"
                : "bg-white text-ink-500 border border-black/8 hover:text-ink-700 hover:bg-cream-300/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((kitten, i) => (
            <motion.div
              key={kitten.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <div className="bg-white rounded-2xl overflow-hidden card-hover shadow-sm border border-black/5 group">
                <div className="relative aspect-square img-container">
                  <Image
                    src={getProxiedUrl(kitten.photoUrl) || "/images/kitten-1.png"}
                    alt={kitten.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-transparent" />
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs border font-sans backdrop-blur-sm ${statusColors[kitten.status]}`}>
                      {statusLabels[kitten.status] || kitten.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-serif group-hover:text-sea-600 transition-colors text-ink-800">
                    {kitten.name}
                  </h3>

                  <div className="mt-2 space-y-1">
                    <p className="text-ink-400 text-sm">
                      {genderLabels[kitten.gender]} {kitten.color && `• ${kitten.color}`}
                    </p>
                    {kitten.parent && (
                      <p className="text-ink-400 text-xs">
                        Родитель: {kitten.parent.name}
                      </p>
                    )}
                  </div>

                  {kitten.price && kitten.status !== "sold" && (
                    <div className="mt-3 pt-3 border-t border-black/5">
                      <span className="text-sea-600 font-semibold text-sm font-sans">
                        {kitten.price.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-ink-400 text-lg">
            Нет котят с выбранным статусом
          </p>
        </div>
      )}
    </>
  );
}
