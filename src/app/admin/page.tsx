import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Cat, Baby, ImageIcon } from "lucide-react";

async function getStats() {
  try {
    const [catsCount, kittensCount, galleryCount] = await Promise.all([
      prisma.cat.count({ where: { isActive: true } }),
      prisma.kitten.count({ where: { isActive: true } }),
      prisma.galleryImage.count(),
    ]);
    return { catsCount, kittensCount, galleryCount };
  } catch {
    return { catsCount: 0, kittensCount: 0, galleryCount: 0 };
  }
}

export default async function AdminDashboard() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin/login");

  const stats = await getStats();

  const cards = [
    { label: "Кошки", value: stats.catsCount, icon: Cat, href: "/admin/cats" },
    { label: "Котята", value: stats.kittensCount, icon: Baby, href: "/admin/kittens" },
    { label: "Фото в галерее", value: stats.galleryCount, icon: ImageIcon, href: "/admin/gallery" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif mb-8 text-ink-800">Панель управления</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <a key={card.label} href={card.href} className="admin-card card-hover group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-ink-500 text-sm">{card.label}</span>
              <div className="w-10 h-10 rounded-xl bg-sea-50 flex items-center justify-center">
                <card.icon size={18} className="text-sea-600" />
              </div>
            </div>
            <p className="text-3xl font-serif text-ink-800 group-hover:text-sea-600 transition-colors">
              {card.value}
            </p>
          </a>
        ))}
      </div>

      <div className="admin-card">
        <h2 className="text-xl font-serif mb-4 text-ink-800">Добро пожаловать!</h2>
        <p className="text-ink-500 leading-relaxed">
          Используйте боковую панель для управления содержимым сайта. Вы можете добавлять,
          редактировать и удалять кошек, котят, фотографии в галерее и текстовое содержимое сайта.
        </p>
      </div>
    </div>
  );
}
