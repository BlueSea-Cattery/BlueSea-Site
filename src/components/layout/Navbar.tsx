"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/cats", label: "Наши производители" },
  { href: "/kittens", label: "Котята" },
  { href: "/gallery", label: "Галерея" },
  { href: "/achievements", label: "Достижения" },
  { href: "/contact", label: "Контакты" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // isMounted prevents Framer Motion's layoutId from generating data-projection-id
  // on the server. Without this guard, the SSR counter and client counter diverge,
  // producing React hydration Error #418.
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "glass shadow-sm"
          : "bg-transparent"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full gradient-sea flex items-center justify-center text-white font-bold text-lg shadow-md shadow-sea-500/20">
            B
          </div>
          <div>
            <span className={`text-xl font-serif tracking-wide transition-colors duration-300 ${pathname === '/' && !isScrolled ? 'text-white' : 'text-ink-800 group-hover:text-sea-600'}`}>
              Blue Sea
            </span>
            <span className={`block text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${pathname === '/' && !isScrolled ? 'text-white/80' : 'text-ink-400'}`}>
              Cattery
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const isHomeTop = pathname === '/' && !isScrolled;

            let textClass = "";
            if (isActive) {
              textClass = isHomeTop ? "text-sea-300 font-medium" : "text-sea-600 font-medium";
            } else {
              textClass = isHomeTop ? "text-white/80 hover:text-white" : "text-ink-500 hover:text-ink-800";
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm transition-colors duration-300 rounded-lg ${textClass}`}
              >
                {link.label}
                {isActive && isMounted && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${isHomeTop ? 'bg-sea-300' : 'bg-sea-500'}`}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={`md:hidden transition-colors p-2 ${pathname === '/' && !isScrolled ? 'text-white hover:text-sea-300' : 'text-ink-600 hover:text-sea-600'}`}
          aria-label="Меню"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass border-t border-black/5"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`block px-4 py-3 rounded-lg text-sm transition-colors ${pathname === link.href
                        ? "text-sea-600 bg-sea-50 font-medium"
                        : "text-ink-500 hover:text-ink-800 hover:bg-cream-300/50"
                      }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
