import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { ArrowRight, Award, Heart, Shield } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import FeaturedCats from "@/components/shared/FeaturedCats";
import prisma from "@/lib/prisma";
import { getContent } from "@/lib/content";
import { getProxiedUrl } from "@/lib/blob";

export const metadata = {
  alternates: { canonical: "/" },
};

const features = [
  {
    icon: Award,
    title: "Титулованные родители",
    desc: "Все наши кошки — обладатели международных титулов WCF",
  },
  {
    icon: Heart,
    title: "Забота и любовь",
    desc: "Котята растут в домашней обстановке, социализированы с первых дней",
  },
  {
    icon: Shield,
    title: "Гарантия здоровья",
    desc: "Полная ветеринарная проверка, вакцинация и документы",
  },
];

const getFeaturedCats = unstable_cache(
  async () => {
    try {
      return await prisma.cat.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 3,
        select: { id: true, name: true, title: true, gender: true, photoUrl: true },
      });
    } catch {
      return [];
    }
  },
  ["featured-cats"],
  { tags: ["cats"], revalidate: 60 }
);

export default async function HomePage() {
  const [cats, content] = await Promise.all([getFeaturedCats(), getContent()]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <Image
          src={getProxiedUrl(content.hero_bg) || "/images/hero-bg.jpg"}
          alt="Невская маскарадная кошка Blue Sea"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/80 via-ink-900/50 to-ink-900/20" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-32">
          <div className="max-w-2xl">
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-white mb-6 font-sans font-medium">
              {content.hero_subtitle}
            </span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif mb-6 leading-tight !text-white">
              {content.hero_title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-sea-300">
                {content.hero_title.split(" ").slice(-1)}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-lg leading-relaxed">
              {content.hero_description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/cats"
                className="inline-flex items-center gap-2 px-8 py-4 gradient-sea text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sea-500/25 transition-all duration-300 text-sm uppercase tracking-wider"
              >
                Наши производители
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/kittens"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 text-white border border-white/20 rounded-xl hover:bg-white/25 hover:border-white/40 transition-all duration-300 text-sm uppercase tracking-wider backdrop-blur-sm"
              >
                Котята
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-24 left-0 right-0 flex justify-center">
          <Link
            href="/kittens"
            className="text-base font-sans font-normal text-white/80 hover:text-white transition-colors duration-300"
          >
            У нас родились котята
          </Link>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-sea-300 rounded-full" />
          </div>
        </div>
      </section>

      {/* About / Mission Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.3em] text-sea-600 font-sans font-medium">
                О питомнике
              </span>
              <h2 className="text-3xl md:text-4xl font-serif mt-4 mb-4">
                {content.about_title}
              </h2>
              <div className="divider-sea" />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div className="bg-white rounded-2xl p-8 text-center card-hover shadow-sm border border-black/5">
                  <div className="w-14 h-14 rounded-xl gradient-sea flex items-center justify-center mx-auto mb-6 shadow-md shadow-sea-500/20">
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-serif mb-3 text-ink-800">{feature.title}</h3>
                  <p className="text-ink-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.3}>
            <div className="mt-16 bg-white rounded-2xl p-8 md:p-12 max-w-4xl mx-auto shadow-sm border border-black/5">
              <p className="text-ink-600 leading-relaxed text-center text-lg whitespace-pre-line">
                {content.about_text}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured Cats — proxy all photoUrls server-side before passing to Client Component */}
      <FeaturedCats cats={cats.map((cat) => ({ ...cat, photoUrl: getProxiedUrl(cat.photoUrl) }))} />

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="bg-white rounded-3xl p-12 md:p-16 text-center shadow-md border border-sea-100 animate-pulse-glow">
              <h2 className="text-3xl md:text-4xl font-serif mb-4 text-ink-800">
                Хотите котёнка?
              </h2>
              <p className="text-ink-500 text-lg mb-8 max-w-xl mx-auto">
                Свяжитесь с нами, чтобы узнать о доступных котятах и
                забронировать своего будущего компаньона
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 gradient-sea text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-sea-500/25 transition-all duration-300 text-sm uppercase tracking-wider"
              >
                Связаться с нами
                <ArrowRight size={16} />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
