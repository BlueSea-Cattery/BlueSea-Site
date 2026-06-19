import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AnimatedSection from "@/components/shared/AnimatedSection";
import ContactForm from "@/components/shared/ContactForm";
import { getContent } from "@/lib/content";

export const metadata = {
  title: "Контакты | Blue Sea",
  description: "Свяжитесь с питомником Blue Sea невских маскарадных кошек",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const content = await getContent();
  const phoneDigits = content.contact_phone.replace(/[^+\d]/g, "");

  const contacts = [
    { icon: Phone, label: content.contact_phone, href: `tel:${phoneDigits}` },
    { icon: Mail, label: content.contact_email, href: `mailto:${content.contact_email}` },
    { icon: MapPin, label: content.contact_address, href: null as string | null },
  ];

  const socials = [
    content.telegram_url ? { icon: MessageCircle, label: "Telegram", href: content.telegram_url } : null,
    content.whatsapp_url ? { icon: Phone, label: "WhatsApp", href: content.whatsapp_url } : null,
    content.instagram_url ? { icon: MessageCircle, label: "Instagram", href: content.instagram_url } : null,
    content.max_url ? { icon: MessageCircle, label: "MAX", href: content.max_url } : null,
  ].filter(Boolean) as { icon: typeof MessageCircle; label: string; href: string }[];

  return (
    <>
      <PageHeader
        title="Контакты"
        subtitle="Свяжитесь с нами для получения информации о котятах"
      />

      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <AnimatedSection direction="left">
              <ContactForm />
            </AnimatedSection>

            {/* Info */}
            <AnimatedSection direction="right">
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
                  <h2 className="text-2xl font-serif mb-6 text-ink-800">Контактная информация</h2>
                  <div className="space-y-4">
                    {contacts.map((c, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sea-50 flex items-center justify-center flex-shrink-0">
                          <c.icon size={18} className="text-sea-600" />
                        </div>
                        {c.href ? (
                          <a href={c.href} className="text-ink-600 hover:text-sea-600 transition-colors">
                            {c.label}
                          </a>
                        ) : (
                          <span className="text-ink-600">{c.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/5">
                  <h2 className="text-2xl font-serif mb-6 text-ink-800">Мессенджеры</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {socials.map((s, i) => (
                      <a
                        key={i}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-cream-100 rounded-xl p-4 flex items-center gap-3 hover:bg-sea-50 transition-colors group border border-black/5"
                      >
                        <s.icon size={20} className="text-sea-600" />
                        <span className="text-ink-600 group-hover:text-sea-700 transition-colors text-sm">
                          {s.label}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="bg-sea-50 rounded-2xl p-8 border border-sea-100">
                  <p className="text-ink-600 text-sm leading-relaxed">
                    💡 Предпочтительный способ связи — <strong className="text-sea-700">Telegram</strong> или <strong className="text-sea-700">WhatsApp</strong>.
                    Мы отвечаем на все сообщения в течение 24 часов.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
