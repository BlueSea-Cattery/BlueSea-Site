"use client";

import AnimatedSection from "./AnimatedSection";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <AnimatedSection>
          <h1 className="text-4xl md:text-5xl font-serif mb-4 text-ink-800">{title}</h1>
          <div className="divider-sea mb-6" />
          {subtitle && (
            <p className="text-ink-500 text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
}
