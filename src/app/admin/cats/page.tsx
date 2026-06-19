"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/upload-client";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import { getProxiedUrl } from "@/lib/blob";

interface CatData {
  id: string;
  name: string;
  title: string | null;
  gender: string;
  color: string | null;
  description: string | null;
  photoUrl: string | null;
  birthDate: string | null;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm = {
  name: "",
  title: "",
  gender: "male",
  color: "",
  description: "",
  photoUrl: "",
  photos: [] as string[],
  birthDate: "",
  isActive: true,
  sortOrder: 0,
};

export default function AdminCatsPage() {
  const [cats, setCats] = useState<CatData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCats = async () => {
    const res = await fetch("/api/cats");
    const data = await res.json();
    setCats(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchCats(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploadedUrl = await uploadImage(file);
      setForm((prev) => ({ ...prev, photoUrl: uploadedUrl }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Ошибка загрузки");
    }
    setUploading(false);
  };

  const handleUploadExtra = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingExtra(true);
    setUploadError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const uploadedUrl = await uploadImage(file);
        urls.push(uploadedUrl);
      }
      setForm((prev) => ({ ...prev, photos: [...prev.photos, ...urls] }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Ошибка загрузки");
    }
    setUploadingExtra(false);
    e.target.value = "";
  };

  const removeExtraPhoto = (index: number) => {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/cats/${editing}` : "/api/cats";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    fetchCats();
  };

  const handleEdit = (cat: CatData) => {
    setForm({
      name: cat.name,
      title: cat.title || "",
      gender: cat.gender,
      color: cat.color || "",
      description: cat.description || "",
      photoUrl: cat.photoUrl || "",
      photos: (cat as CatData & { photos?: string[] }).photos || [],
      birthDate: cat.birthDate || "",
      isActive: cat.isActive,
      sortOrder: cat.sortOrder,
    });
    setEditing(cat.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить эту кошку?")) return;
    await fetch(`/api/cats/${id}`, { method: "DELETE" });
    fetchCats();
  };

  const inputStyle = "w-full bg-cream-100 border border-cream-400 rounded-xl px-4 py-2.5 text-ink-800 placeholder-ink-400 focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-100 text-sm transition-all";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-ink-800">Кошки</h1>
        <button
          onClick={() => { setForm(emptyForm); setEditing(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 gradient-sea text-white font-semibold rounded-xl text-sm hover:shadow-lg hover:shadow-sea-500/20 transition-all"
        >
          <Plus size={16} />
          Добавить
        </button>
      </div>

      {isLoading ? (
        <div className="admin-card flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-sea-200 border-t-sea-600 rounded-full animate-spin" />
        </div>
      ) : null}
      <div className={`admin-card overflow-hidden${isLoading ? " hidden" : ""}`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/5">
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Фото</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Имя</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Титул</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Пол</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Статус</th>
              <th className="text-right text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {cats.map((cat) => (
              <tr key={cat.id} className="group hover:bg-cream-100/50 transition-colors">
                <td className="py-3">
                  {cat.photoUrl ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm">
                      <Image src={getProxiedUrl(cat.photoUrl)} alt={cat.name} fill className="object-cover" sizes="48px" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-cream-300 flex items-center justify-center text-ink-400 text-xs">Нет</div>
                  )}
                </td>
                <td className="py-3 text-ink-700 font-medium">{cat.name}</td>
                <td className="py-3 text-ink-500 text-sm">{cat.title || "—"}</td>
                <td className="py-3 text-ink-500 text-sm">{cat.gender === "male" ? "♂ Кот" : "♀ Кошка"}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${cat.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                    {cat.isActive ? "Активен" : "Скрыт"}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(cat)} className="p-2 rounded-lg hover:bg-cream-300/50 text-ink-400 hover:text-sea-600 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg hover:bg-red-50 text-ink-400 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {cats.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-ink-400">Нет кошек. Нажмите «Добавить».</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl border border-black/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-ink-800">{editing ? "Редактировать" : "Добавить"} кошку</h2>
              <button onClick={() => setShowModal(false)} className="text-ink-400 hover:text-ink-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-ink-500 mb-1">Имя *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputStyle} />
              </div>
              <div>
                <label className="block text-sm text-ink-500 mb-1">Титул</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputStyle} placeholder="например: Grand International Champion" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-ink-500 mb-1">Пол *</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputStyle}>
                    <option value="male">Кот</option>
                    <option value="female">Кошка</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-ink-500 mb-1">Окрас</label>
                  <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-ink-500 mb-1">Дата рождения</label>
                <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className={inputStyle} />
              </div>
              <div>
                <label className="block text-sm text-ink-500 mb-1">Описание</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputStyle} resize-none`} />
              </div>
              <div>
                <label className="block text-sm text-ink-500 mb-1">Фото</label>
                <div className="flex gap-3">
                  <input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} className={`flex-1 ${inputStyle}`} placeholder="URL или загрузите файл" />
                  <label className="px-4 py-2.5 bg-cream-200 border border-cream-400 rounded-xl cursor-pointer hover:bg-cream-300 transition-colors flex items-center gap-2 text-sm text-ink-500">
                    <Upload size={14} />{uploading ? "..." : ""}
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                </div>
                {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
                {form.photoUrl && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden mt-3 shadow-sm">
                    <Image src={getProxiedUrl(form.photoUrl)} alt="Preview" fill className="object-cover" sizes="96px" />
                  </div>
                )}
              </div>

              {/* Extra photos */}
              <div>
                <label className="block text-sm text-ink-500 mb-1">Дополнительные фото</label>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-cream-200 border border-cream-400 rounded-xl cursor-pointer hover:bg-cream-300 transition-colors text-sm text-ink-500">
                  <Upload size={14} />
                  {uploadingExtra ? "Загрузка..." : "Добавить фото"}
                  <input type="file" accept="image/*" multiple onChange={handleUploadExtra} className="hidden" disabled={uploadingExtra} />
                </label>
                {form.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.photos.map((url, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden shadow-sm group/photo">
                        <Image src={getProxiedUrl(url)} alt={`Фото ${i + 1}`} fill className="object-cover" sizes="80px" />
                        <button
                          type="button"
                          onClick={() => removeExtraPhoto(i)}
                          className="absolute inset-0 bg-ink-900/50 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center transition-opacity"
                          aria-label="Удалить фото"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                <label htmlFor="isActive" className="text-sm text-ink-500">Активен (показывать на сайте)</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-cream-200 border border-cream-400 rounded-xl text-ink-500 hover:text-ink-700 text-sm transition-colors">Отмена</button>
                <button type="submit" className="flex-1 px-4 py-2.5 gradient-sea text-white font-semibold rounded-xl text-sm hover:shadow-lg transition-all">{editing ? "Сохранить" : "Создать"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
