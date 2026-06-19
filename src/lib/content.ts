import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

export const CONTENT_DEFAULTS = {
  hero_bg: "/images/hero-bg.jpg",
  hero_title: "Blue Sea",
  hero_subtitle: "Питомник невских маскарадных кошек",
  hero_description:
    "Породистые невские маскарадные кошки с сибирским характером и королевской грацией",
  about_title: "Традиции породы",
  about_text:
    "Питомник Blue Sea — это семейное дело, основанное на глубокой любви к невским маскарадным кошкам. Мы гордимся тем, что наши кошки не только обладают безупречной породной красотой, но и прекрасным характером. Каждый котёнок окружён заботой с первых дней жизни и передаётся в новую семью полностью социализированным и здоровым.",
  contact_phone: "+7 (900) 123-45-67",
  contact_email: "info@bluesea-cattery.ru",
  contact_address: "Санкт-Петербург, Россия",
  telegram_url: "https://t.me/bluesea",
  whatsapp_url: "https://wa.me/79001234567",
  instagram_url: "",
  max_url: "",
} as const;

export type ContentKey = keyof typeof CONTENT_DEFAULTS;
export type SiteContent = Record<ContentKey, string>;

const fetchContent = unstable_cache(
  async (): Promise<Record<string, string>> => {
    try {
      const rows = await prisma.siteContent.findMany();
      const map: Record<string, string> = {};
      rows.forEach((r) => {
        if (r.value) map[r.key] = r.value;
      });
      return map;
    } catch {
      return {};
    }
  },
  ["site-content"],
  { tags: ["content"], revalidate: 3600 }
);

export async function getContent(): Promise<SiteContent> {
  const stored = await fetchContent();
  return { ...CONTENT_DEFAULTS, ...stored } as SiteContent;
}
