import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-8">
        <a
          href="/"
          className="flex items-center gap-2.5"
          aria-label="TruthLens home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <span className="text-sm font-bold">TL</span>
          </div>

          <span className="text-lg font-semibold tracking-tight text-slate-900">
            TruthLens
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            How It Works
          </a>

          <a
            href="#capabilities"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Capabilities
          </a>

          <a
            href="#evidence"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Evidence
          </a>

          <a
            href="#about"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            About
          </a>
        </div>

        <div className="hidden md:block">
          <a
            href="/verify"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Verify Content
            <ArrowRight size={16} />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-700 md:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#how-it-works" onClick={() => setMobileOpen(false)}>
              How It Works
            </a>

            <a href="#capabilities" onClick={() => setMobileOpen(false)}>
              Capabilities
            </a>

            <a href="#evidence" onClick={() => setMobileOpen(false)}>
              Evidence
            </a>

            <a href="#about" onClick={() => setMobileOpen(false)}>
              About
            </a>

            <a
              href="/verify"
              className="mt-2 rounded-lg bg-slate-900 px-4 py-3 text-center font-semibold text-white"
            >
              Verify Content
            </a>
          </div>
        </div>
      )}
    </motion.header>
  );
}