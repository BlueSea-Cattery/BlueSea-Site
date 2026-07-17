"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Ошибка при отправке сообщения");
      }

      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setFormData({ name: "", email: "", message: "" });
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
      <h2 className="text-2xl font-serif mb-6 text-ink-800">Напишите нам</h2>

      {sent ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full gradient-sea flex items-center justify-center mx-auto mb-4 shadow-md shadow-sea-500/20">
            <Send size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-serif mb-2 text-ink-800">Сообщение отправлено!</h3>
          <p className="text-ink-500">Мы ответим вам в ближайшее время</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-ink-500 mb-2 font-sans">Имя</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-cream-100 border border-cream-400 rounded-xl px-4 py-3 text-ink-800 placeholder-ink-400 focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-100 transition-all"
              placeholder="Ваше имя"
            />
          </div>
          <div>
            <label className="block text-sm text-ink-500 mb-2 font-sans">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-cream-100 border border-cream-400 rounded-xl px-4 py-3 text-ink-800 placeholder-ink-400 focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-100 transition-all"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-ink-500 mb-2 font-sans">Сообщение</label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-cream-100 border border-cream-400 rounded-xl px-4 py-3 text-ink-800 placeholder-ink-400 focus:border-sea-400 focus:outline-none focus:ring-2 focus:ring-sea-100 transition-all resize-none"
              placeholder="Ваше сообщение..."
            />
          </div>
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 gradient-sea text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sea-500/25 transition-all duration-300 text-sm uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Отправка..." : "Отправить"}
            {!loading && <Send size={16} />}
          </button>
        </form>
      )}
    </div>
  );
}
