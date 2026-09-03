import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton } from "@clerk/react";

interface DashboardNavbarProps {
  onHistoryClick: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Verify Content", href: "/verify", primary: true },
  { label: "Settings", href: "/settings" },
];

function Brand() {
  return (
    <a
      href="/"
      className="dash-brand"
      aria-label="TruthLens home"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
        <span className="text-sm font-bold">TL</span>
      </div>

      <span>TruthLens</span>
    </a>
  );
}

export default function DashboardNavbar({
  onHistoryClick,
}: DashboardNavbarProps) {
  const [open, setOpen] = useState(false);

  const handleHistoryClick = () => {
    setOpen(false);
    onHistoryClick();
  };

  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <Brand />

        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}

        <nav
          className="desktop-nav"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`top-nav-link ${
                item.primary
                  ? "top-nav-primary"
                  : item.label === "Dashboard"
                    ? "is-active"
                    : ""
              }`}
            >
              {item.label}
            </a>
          ))}

          {/* HISTORY BUTTON */}

          <button
            type="button"
            className="top-nav-link"
            onClick={handleHistoryClick}
          >
            History
          </button>
        </nav>

        {/* =====================================================
            ACCOUNT
        ===================================================== */}

        <div className="nav-account">
          <span className="account-label">
            Workspace
          </span>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "dashboard-user-avatar",
              },
            }}
          />
        </div>

        {/* =====================================================
            MOBILE MENU BUTTON
        ===================================================== */}

        <button
          type="button"
          className="mobile-menu"
          onClick={() => setOpen((value) => !value)}
          aria-label={
            open
              ? "Close navigation"
              : "Open navigation"
          }
        >
          {open ? (
            <X size={19} />
          ) : (
            <Menu size={19} />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-nav"
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={
                  item.primary
                    ? "mobile-nav-primary"
                    : ""
                }
                onClick={() =>
                  setOpen(false)
                }
              >
                {item.label}
              </a>
            ))}

            {/* MOBILE HISTORY BUTTON */}

            <button
              type="button"
              className="mobile-nav-history"
              onClick={handleHistoryClick}
            >
              History
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}