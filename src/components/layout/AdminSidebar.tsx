"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Cat, Baby, ImageIcon, FileText, LogOut, ArrowLeft, Trophy, BookOpen, Scroll } from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard },
  { href: "/admin/cats", label: "Кошки", icon: Cat },
  { href: "/admin/litters", label: "Помёты", icon: BookOpen },
  { href: "/admin/kittens", label: "Котята", icon: Baby },
  { href: "/admin/gallery", label: "Галерея", icon: ImageIcon },
  { href: "/admin/achievements", label: "Достижения", icon: Trophy },
  { href: "/admin/pedigrees", label: "Родословные", icon: Scroll },
  { href: "/admin/content", label: "Контент", icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-black/8 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-sea flex items-center justify-center text-white font-bold text-lg shadow-sm">
            B
          </div>
          <div>
            <span className="text-lg font-serif text-ink-800">Blue Sea</span>
            <span className="block text-[10px] uppercase tracking-[0.15em] text-ink-400">
              Админ-панель
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? "bg-sea-50 text-sea-700 font-medium"
                  : "text-ink-500 hover:text-ink-700 hover:bg-cream-300/50"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-black/5 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-ink-500 hover:text-ink-700 hover:bg-cream-300/50 transition-all"
        >
          <ArrowLeft size={18} />
          На сайт
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-ink-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
