"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Baby } from "lucide-react";

interface LitterData {
  id: string;
  name: string;
  birthDate: string | null;
  description: string | null;
  motherId: string | null;
  fatherId: string | null;
  pedigreeId: string | null;
  isActive: boolean;
  sortOrder: number;
  mother?: { id: string; name: string } | null;
  father?: { id: string; name: string } | null;
  pedigree?: { id: string; name: string } | null;
  kittens?: { id: string; name: string; status: string }[];
}

interface CatOption { id: string; name: string; gender: string; }
interface PedigreeOption { id: string; name: string; }

const emptyForm = {
  name: "",
  birthDate: "",
  description: "",
  motherId: "",
  fatherId: "",
  pedigreeId: "",
  isActive: true,
  sortOrder: 0,
};

export default function AdminLittersPage() {
  const [litters, setLitters] = useState<LitterData[]>([]);
  const [cats, setCats] = useState<CatOption[]>([]);
  const [pedigrees, setPedigrees] = useState<PedigreeOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const [lRes, cRes, pRes] = await Promise.all([fetch("/api/litters"), fetch("/api/cats"), fetch("/api/pedigrees")]);
    setLitters(await lRes.json());
    setCats(await cRes.json());
    setPedigrees(await pRes.json());
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch("/api/litters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing, ...form }),
      });
    } else {
      await fetch("/api/litters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    fetchData();
  };

  const handleEdit = (l: LitterData) => {
    setForm({
      name: l.name,
      birthDate: l.birthDate || "",
      description: l.description || "",
      motherId: l.motherId || "",
      fatherId: l.fatherId || "",
      pedigreeId: l.pedigreeId || "",
      isActive: l.isActive,
      sortOrder: l.sortOrder,
    });
    setEditing(l.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить помёт? Котята из помёта не удаляются, но потеряют привязку.")) return;
    await fetch(`/api/litters?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const females = cats.filter((c) => c.gender === "female");
  const males = cats.filter((c) => c.gender === "male");

  const inputStyle = "w-full bg-cream-100 border border-cream-400 rounded-xl px-4 py-2.5 text-ink-800 placeholder-ink-400 focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-100 text-sm transition-all";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-ink-800">Помёты</h1>
        <button
          onClick={() => { setForm(emptyForm); setEditing(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 gradient-sea text-white font-semibold rounded-xl text-sm hover:shadow-lg hover:shadow-sea-500/20 transition-all"
        >
          <Plus size={16} /> Добавить помёт
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
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Помёт</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Дата рождения</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Мать</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Отец</th>
              <th className="text-left text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Котят</th>
              <th className="text-right text-xs uppercase tracking-wider text-ink-400 pb-3 font-sans">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {litters.map((l) => (
              <tr key={l.id} className="hover:bg-cream-100/50 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Baby size={14} className="text-sea-400 shrink-0" />
                    <span className="text-ink-700 text-sm font-medium">{l.name}</span>
                    {!l.isActive && <span className="text-[10px] px-1.5 py-0.5 bg-cream-300 text-ink-400 rounded-md">скрыт</span>}
                  </div>
                </td>
                <td className="py-3 text-ink-500 text-sm">
                  {l.birthDate ? new Date(l.birthDate).toLocaleDateString("ru-RU") : "—"}
                </td>
                <td className="py-3 text-ink-500 text-sm">{l.mother?.name || "—"}</td>
                <td className="py-3 text-ink-500 text-sm">{l.father?.name || "—"}</td>
                <td className="py-3 text-ink-500 text-sm">{l.kittens?.length ?? 0}</td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(l)} className="p-2 rounded-lg hover:bg-cream-300/50 text-ink-400 hover:text-sea-600 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(l.id)} className="p-2 rounded-lg hover:bg-red-50 text-ink-400 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {litters.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-ink-400">Помётов нет.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl border border-black/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif text-ink-800">{editing ? "Редактировать" : "Добавить"} помёт</h2>
              <button onClick={() => setShowModal(false)} className="text-ink-400 hover:text-ink-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-ink-500 mb-1">Название помёта *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputStyle} placeholder="Помёт «А»" />
              </div>
              <div>
                <label className="block text-sm text-ink-500 mb-1">Дата рождения</label>
                <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className={inputStyle} />
              </div>
              <div>
                <label className="block text-sm text-ink-500 mb-1">Мать</label>
                <select value={form.motherId} onChange={(e) => setForm({ ...form, motherId: e.target.value })} className={inputStyle}>
                  <option value="">Не указана</option>
                  {females.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {females.length === 0 && cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-ink-500 mb-1">Отец</label>
                <select value={form.fatherId} onChange={(e) => setForm({ ...form, fatherId: e.target.value })} className={inputStyle}>
                  <option value="">Не указан</option>
                  {males.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {males.length === 0 && cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-ink-500 mb-1">Родословная</label>
                <select value={form.pedigreeId} onChange={(e) => setForm({ ...form, pedigreeId: e.target.value })} className={inputStyle}>
                  <option value="">Не прикреплена</option>
                  {pedigrees.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-ink-500 mb-1">Описание</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputStyle} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-ink-500 mb-1">Сортировка</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className={inputStyle} />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded" />
                    <span className="text-sm text-ink-500">Активен</span>
                  </label>
                </div>
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
