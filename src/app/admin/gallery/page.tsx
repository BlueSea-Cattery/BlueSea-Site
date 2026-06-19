"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/upload-client";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { getProxiedUrl } from "@/lib/blob";

interface GalleryImage { id: string; url: string; caption: string | null; sortOrder: number; }

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImages = async () => {
    setImages(await (await fetch("/api/gallery")).json());
    setIsLoading(false);
  };
  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploadedUrl = await uploadImage(file);
      setUrl(uploadedUrl);
    } catch (err) { setUploadError(err instanceof Error ? err.message : "Ошибка загрузки"); }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, caption, sortOrder: images.length }) });
    setShowModal(false); setUrl(""); setCaption(""); fetchImages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить?")) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" }); fetchImages();
  };

  const inputStyle = "w-full bg-cream-100 border border-cream-400 rounded-xl px-4 py-2.5 text-ink-800 placeholder-ink-400 focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-100 text-sm transition-all";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-ink-800">Галерея</h1>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 gradient-sea text-white font-semibold rounded-xl text-sm hover:shadow-lg hover:shadow-sea-500/20 transition-all">
          <Plus size={16} /> Добавить фото
        </button>
      </div>

      {isLoading && (
        <div className="admin-card flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-sea-200 border-t-sea-600 rounded-full animate-spin" />
        </div>
      )}
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4${isLoading ? " hidden" : ""}`}>
        {images.map((img) => (
          <div key={img.id} className="admin-card p-2 group relative">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image src={getProxiedUrl(img.url)} alt={img.caption || ""} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/40 transition-colors flex items-center justify-center">
                <button onClick={() => handleDelete(img.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 rounded-lg text-white hover:bg-red-600 shadow-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {img.caption && <p className="text-xs text-ink-500 mt-2 px-1 truncate">{img.caption}</p>}
          </div>
        ))}
        {images.length === 0 && <div className="col-span-full text-center py-16 text-ink-400">Нет фотографий</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border border-black/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-ink-800">Добавить фото</h2>
              <button onClick={() => setShowModal(false)} className="text-ink-400 hover:text-ink-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-ink-500 mb-1">Фото *</label>
                <div className="flex gap-3">
                  <input required value={url} onChange={(e) => setUrl(e.target.value)} className={`flex-1 ${inputStyle}`} placeholder="URL" />
                  <label className="px-4 py-2.5 bg-cream-200 border border-cream-400 rounded-xl cursor-pointer hover:bg-cream-300 transition-colors flex items-center gap-2 text-sm text-ink-500"><Upload size={14} />{uploading ? "..." : ""}<input type="file" accept="image/*" onChange={handleUpload} className="hidden" /></label>
                </div>
                {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
                {url && <div className="relative w-full aspect-video rounded-lg overflow-hidden mt-3 shadow-sm"><Image src={getProxiedUrl(url)} alt="Preview" fill className="object-cover" sizes="400px" /></div>}
              </div>
              <div><label className="block text-sm text-ink-500 mb-1">Подпись</label><input value={caption} onChange={(e) => setCaption(e.target.value)} className={inputStyle} /></div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-cream-200 border border-cream-400 rounded-xl text-ink-500 text-sm">Отмена</button>
                <button type="submit" className="flex-1 px-4 py-2.5 gradient-sea text-white font-semibold rounded-xl text-sm">Добавить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
