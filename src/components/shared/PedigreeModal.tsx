"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Scroll } from "lucide-react";

interface Props {
  photoUrl: string;
  label?: string;
}

export default function PedigreeModal({ photoUrl, label = "Родословная" }: Props) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleOpen = () => { setLoaded(false); setOpen(true); };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-sea-600 hover:text-sea-700 font-sans font-medium transition-colors"
      >
        <Scroll size={12} />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-ink-600 hover:text-ink-900 hover:bg-white shadow transition-all"
            >
              <X size={18} />
            </button>

            {!loaded && (
              <div className="flex items-center justify-center" style={{ minHeight: 300 }}>
                <div className="w-10 h-10 border-2 border-sea-200 border-t-sea-600 rounded-full animate-spin" />
              </div>
            )}

            <div className="relative w-full" style={{ minHeight: loaded ? undefined : 0, overflow: loaded ? undefined : "hidden", height: loaded ? undefined : 0 }}>
              <Image
                src={photoUrl}
                alt="Родословная"
                width={900}
                height={1200}
                className="w-full h-auto object-contain"
                sizes="(max-width: 768px) 100vw, 900px"
                onLoad={() => setLoaded(true)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
