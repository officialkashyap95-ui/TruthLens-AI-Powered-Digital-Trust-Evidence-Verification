import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Show, UserButton, SignInButton } from "@clerk/react";

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

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

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
        {/* Logo */}
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

        {/* Desktop Navigation */}
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

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Logged Out */}
          <Show when="signed-out">
            <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
              <button
                type="button"
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Sign In
              </button>
            </SignInButton>
          </Show>

          {/* Logged In */}
          <Show when="signed-in">
            <a
              href="/dashboard"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Dashboard
            </a>

            <UserButton />
          </Show>

          {/* Primary Product Action */}
          <a
            href="/verify"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Verify Content
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-5">
              <a
                href="#how-it-works"
                onClick={closeMobileMenu}
                className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
              >
                How It Works
              </a>

              <a
                href="#capabilities"
                onClick={closeMobileMenu}
                className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
              >
                Capabilities
              </a>

              <a
                href="#evidence"
                onClick={closeMobileMenu}
                className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
              >
                Evidence
              </a>

              <a
                href="#about"
                onClick={closeMobileMenu}
                className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
              >
                About
              </a>

              <div className="my-1 h-px bg-slate-100" />

              {/* Mobile Logged Out */}
              <Show when="signed-out">
                <SignInButton
                  mode="redirect"
                  forceRedirectUrl="/dashboard"
                >
                  <button
                    type="button"
                    onClick={closeMobileMenu}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    Sign In
                  </button>
                </SignInButton>
              </Show>

              {/* Mobile Logged In */}
              <Show when="signed-in">
                <a
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Dashboard
                </a>

                <div className="flex items-center justify-center py-2">
                  <UserButton />
                </div>
              </Show>

              {/* Mobile Verify */}
              <a
                href="/verify"
                onClick={closeMobileMenu}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Verify Content
                <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}