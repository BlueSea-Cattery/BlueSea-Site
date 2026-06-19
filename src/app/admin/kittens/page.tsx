"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/upload-client";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import { statusLabels, statusColors } from "@/lib/utils";
import { getProxiedUrl } from "@/lib/blob";

interface KittenData {
  id: string;
  name: string;
  gender: string;
  color: string | null;
  birthDate: string | null;
  status: string;
  price: number | null;
  description: string | null;
  photoUrl: string | null;
  litterId: string | null;
  isActive: boolean;
  litter?: { id: string; name: string } | null;
}

interface LitterOption { id: string; name: string; }

const emptyForm = { name: "", gender: "male", color: "", birthDate: "", status: "available", price: "", description: "", photoUrl: "", photos: [] as string[], litterId: "", isActive: true };

export default function AdminKittensPage() {
  const [kittens, setKittens] = useState<KittenData[]>([]);
  const [litters, setLitters] = useState<LitterOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const [kRes, lRes] = await Promise.all([fetch("/api/kittens"), fetch("/api/litters")]);
    setKittens(await kRes.json());
    setLitters(await lRes.json());
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

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
    const url = editing ? `/api/kittens/${editing}` : "/api/kittens";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowModal(false); setEditing(null); setForm(emptyForm); fetchData();
  };

  const handleEdit = (k: KittenData) => {
    setForm({ name: k.name, gender: k.gender, color: k.color || "", birthDate: k.birthDate || "", status: k.status, price: k.price?.toString() || "", description: k.description || "", photoUrl: k.photoUrl || "", photos: (k as KittenData & { photos?: string[] }).photos || [], litterId: k.litterId || "", isActive: k.isActive });
    setEditing(k.id); setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить?")) return;
    await fetch(`/api/kittens/${id}`, { method: "DELETE" }); fetchData();
  };

  const handleStatusChange = async (k: KittenData, status: string) => {
    await fetch(`/api/kittens/${k.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...k, status }) });
    fetchData();
  };

  const inputStyle = "w-full bg-cream-100 border border-cream-400 rounded-xl px-4 py-2.5 text-ink-800 placeholder-ink-400 focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-100 text-sm transition-all";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-ink-800">Котята</h1>
        <button onClick={() => { setForm(emptyForm); setEditing(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 gradient-sea text-white font-semibold rounded-xl text-sm hover:shadow-lg hover:shadow-sea-500/20 transition-all">
          <Plus size={16} /> Добавить
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
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Пол</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Помёт</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Статус</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Цена</th>
              <th className="text-right text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {kittens.map((k) => (
              <tr key={k.id} className="hover:bg-cream-100/50 transition-colors">
                <td className="py-3">
                  {k.photoUrl ? <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-sm"><Image src={getProxiedUrl(k.photoUrl)} alt={k.name} fill className="object-cover" sizes="40px" /></div> : <div className="w-10 h-10 rounded-lg bg-cream-300" />}
                </td>
                <td className="py-3 text-ink-700 text-sm font-medium">{k.name}</td>
                <td className="py-3 text-ink-500 text-sm">{k.gender === "male" ? "♂" : "♀"}</td>
                <td className="py-3 text-ink-500 text-sm">{k.litter?.name || "—"}</td>
                <td className="py-3">
                  <select value={k.status} onChange={(e) => handleStatusChange(k, e.target.value)}
                    className={`px-2 py-1 rounded-lg text-xs border bg-transparent focus:outline-none ${statusColors[k.status]}`}>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key} className="bg-white text-ink-700">{label}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 text-ink-500 text-sm">{k.price ? `${k.price.toLocaleString("ru-RU")} ₽` : "—"}</td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(k)} className="p-2 rounded-lg hover:bg-cream-300/50 text-ink-400 hover:text-sea-600 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(k.id)} className="p-2 rounded-lg hover:bg-red-50 text-ink-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {kittens.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-ink-400">Нет котят.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl border border-black/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-ink-800">{editing ? "Редактировать" : "Добавить"} котёнка</h2>
              <button onClick={() => setShowModal(false)} className="text-ink-400 hover:text-ink-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm text-ink-500 mb-1">Имя *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputStyle} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-ink-500 mb-1">Пол</label><select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputStyle}><option value="male">Кот</option><option value="female">Кошка</option></select></div>
                <div><label className="block text-sm text-ink-500 mb-1">Статус</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputStyle}>{Object.entries(statusLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-ink-500 mb-1">Окрас</label><input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputStyle} /></div>
                <div><label className="block text-sm text-ink-500 mb-1">Цена (₽)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputStyle} /></div>
              </div>
              <div><label className="block text-sm text-ink-500 mb-1">Помёт</label><select value={form.litterId} onChange={(e) => setForm({ ...form, litterId: e.target.value })} className={inputStyle}><option value="">Не указан</option>{litters.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
              <div><label className="block text-sm text-ink-500 mb-1">Описание</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputStyle} resize-none`} /></div>
              <div>
                <label className="block text-sm text-ink-500 mb-1">Главное фото</label>
                <div className="flex gap-3">
                  <input value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} className={`flex-1 ${inputStyle}`} placeholder="URL" />
                  <label className="px-4 py-2.5 bg-cream-200 border border-cream-400 rounded-xl cursor-pointer hover:bg-cream-300 transition-colors flex items-center gap-2 text-sm text-ink-500"><Upload size={14} />{uploading ? "..." : ""}<input type="file" accept="image/*" onChange={handleUpload} className="hidden" /></label>
                </div>
                {form.photoUrl && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden mt-2 shadow-sm">
                    <Image src={getProxiedUrl(form.photoUrl)} alt="Preview" fill className="object-cover" sizes="80px" />
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
                {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
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

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-cream-200 border border-cream-400 rounded-xl text-ink-500 text-sm">Отмена</button>
                <button type="submit" className="flex-1 px-4 py-2.5 gradient-sea text-white font-semibold rounded-xl text-sm hover:shadow-lg transition-all">{editing ? "Сохранить" : "Создать"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
