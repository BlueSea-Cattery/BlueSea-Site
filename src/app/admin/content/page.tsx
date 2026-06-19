"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/upload-client";
import { Save, Check, Upload } from "lucide-react";
import { getProxiedUrl } from "@/lib/blob";

const contentFields = [
  { key: "hero_bg", label: "Фото Hero (главная страница)", type: "image", placeholder: "/images/hero-bg.jpg" },
  { key: "hero_title", label: "Заголовок Hero", type: "text", placeholder: "Blue Sea" },
  { key: "hero_subtitle", label: "Подзаголовок Hero", type: "text", placeholder: "Питомник невских маскарадных кошек" },
  { key: "hero_description", label: "Описание Hero", type: "textarea", placeholder: "Породистые невские маскарадные кошки..." },
  { key: "about_title", label: "Заголовок О нас", type: "text", placeholder: "Традиции породы" },
  { key: "about_text", label: "Текст О нас", type: "textarea", placeholder: "Питомник Blue Sea — это семейное дело..." },
  { key: "contact_phone", label: "Телефон", type: "text", placeholder: "+7 (900) 123-45-67" },
  { key: "contact_email", label: "Email", type: "text", placeholder: "info@bluesea-cattery.ru" },
  { key: "contact_address", label: "Адрес", type: "text", placeholder: "Санкт-Петербург, Россия" },
  { key: "telegram_url", label: "Telegram URL (оставьте пустым — скрыть)", type: "text", placeholder: "https://t.me/bluesea" },
  { key: "whatsapp_url", label: "WhatsApp URL (оставьте пустым — скрыть)", type: "text", placeholder: "https://wa.me/79001234567" },
  { key: "instagram_url", label: "Instagram URL (оставьте пустым — скрыть)", type: "text", placeholder: "https://instagram.com/bluesea" },
  { key: "max_url", label: "MAX (мессенджер) URL (оставьте пустым — скрыть)", type: "text", placeholder: "https://max.ru/..." },
];

export default function AdminContentPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content").then((r) => r.json()).then((data) => { setContent(data); setIsLoading(false); }).catch(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const handleImageUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploadedUrl = await uploadImage(file);
      setContent((prev) => ({ ...prev, [key]: uploadedUrl }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Ошибка загрузки");
    }
    setUploading(false);
  };

  const inputStyle = "w-full bg-cream-100 border border-cream-400 rounded-xl px-4 py-3 text-ink-800 placeholder-ink-400 focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-100 text-sm transition-all";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-ink-800">Контент сайта</h1>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 gradient-sea text-white font-semibold rounded-xl text-sm hover:shadow-lg hover:shadow-sea-500/20 transition-all disabled:opacity-50">
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Сохранено!" : saving ? "Сохранение..." : "Сохранить всё"}
        </button>
      </div>

      {isLoading && (
        <div className="admin-card flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-sea-200 border-t-sea-600 rounded-full animate-spin" />
        </div>
      )}
      <div className={`space-y-6${isLoading ? " hidden" : ""}`}>
        {contentFields.map((field) => (
          <div key={field.key} className="admin-card">
            <label className="block text-sm text-ink-600 mb-2 font-sans font-medium">{field.label}</label>

            {field.type === "image" ? (
              <div className="space-y-3">
                {content[field.key] && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-cream-400">
                    <Image src={getProxiedUrl(content[field.key])} alt="Hero preview" fill className="object-cover" unoptimized />
                  </div>
                )}
                <label className={`inline-flex items-center gap-2 px-4 py-2.5 border border-cream-400 rounded-xl text-sm text-ink-600 cursor-pointer hover:border-sea-400 hover:text-sea-600 transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                  <Upload size={15} />
                  {uploading ? "Загрузка..." : "Загрузить фото"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(field.key, e)} disabled={uploading} />
                </label>
                {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
                <input type="text" value={content[field.key] || ""} onChange={(e) => setContent({ ...content, [field.key]: e.target.value })} className={inputStyle} placeholder={field.placeholder} />
              </div>
            ) : field.type === "textarea" ? (
              <textarea rows={4} value={content[field.key] || ""} onChange={(e) => setContent({ ...content, [field.key]: e.target.value })} className={`${inputStyle} resize-none`} placeholder={field.placeholder} />
            ) : (
              <input type="text" value={content[field.key] || ""} onChange={(e) => setContent({ ...content, [field.key]: e.target.value })} className={inputStyle} placeholder={field.placeholder} />
            )}

            <p className="text-xs text-ink-400 mt-1">Ключ: <code className="text-ink-500">{field.key}</code></p>
          </div>
        ))}
      </div>
    </div>
  );
}
