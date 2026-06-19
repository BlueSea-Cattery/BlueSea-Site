import Link from "next/link";
import { Heart } from "lucide-react";
import { getContent } from "@/lib/content";

export default async function Footer() {
  const content = await getContent();
  const telHref = `tel:${content.contact_phone.replace(/[^+\d]/g, "")}`;
  return (
    <footer className="relative border-t border-black/5 bg-cream-50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full gradient-sea flex items-center justify-center text-white font-bold text-lg shadow-md shadow-sea-500/20">
                B
              </div>
              <div>
                <span className="text-xl font-serif tracking-wide text-ink-800">
                  Blue Sea
                </span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-ink-400">
                  Cattery
                </span>
              </div>
            </Link>
            <p className="text-ink-500 text-sm leading-relaxed">
              Питомник невских маскарадных кошек. Разведение породистых кошек
              с любовью и заботой.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-ink-400 mb-4 font-sans font-semibold">
              Навигация
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Главная" },
                { href: "/cats", label: "Наши производители" },
                { href: "/kittens", label: "Котята" },
                { href: "/gallery", label: "Галерея" },
                { href: "/contact", label: "Контакты" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-500 hover:text-sea-600 text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-ink-400 mb-4 font-sans font-semibold">
              Контакты
            </h4>
            <ul className="space-y-2 text-ink-500 text-sm">
              <li>
                <a href={`mailto:${content.contact_email}`} className="hover:text-sea-600 transition-colors">
                  {content.contact_email}
                </a>
              </li>
              <li>
                <a href={telHref} className="hover:text-sea-600 transition-colors">
                  {content.contact_phone}
                </a>
              </li>
              <li>{content.contact_address}</li>
            </ul>
            <div className="flex gap-4 mt-4 flex-wrap">
              {content.telegram_url && (
                <a href={content.telegram_url} target="_blank" rel="noopener noreferrer" className="text-ink-400 hover:text-sea-600 transition-colors text-sm">
                  Telegram
                </a>
              )}
              {content.whatsapp_url && (
                <a href={content.whatsapp_url} target="_blank" rel="noopener noreferrer" className="text-ink-400 hover:text-sea-600 transition-colors text-sm">
                  WhatsApp
                </a>
              )}
              {content.instagram_url && (
                <a href={content.instagram_url} target="_blank" rel="noopener noreferrer" className="text-ink-400 hover:text-sea-600 transition-colors text-sm">
                  Instagram
                </a>
              )}
              {content.max_url && (
                <a href={content.max_url} target="_blank" rel="noopener noreferrer" className="text-ink-400 hover:text-sea-600 transition-colors text-sm">
                  MAX
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-ink-400 text-xs">
            © {new Date().getFullYear()} Blue Sea Cattery. Все права защищены.
          </p>
          <p className="text-ink-400 text-xs flex items-center gap-1">
            Сделано с <Heart size={12} className="text-sea-500" /> для наших кошек
          </p>
        </div>
      </div>
    </footer>
  );
}
