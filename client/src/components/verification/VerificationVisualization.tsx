import { motion } from "framer-motion";
import {
  FileCheck2,
  Fingerprint,
  Globe2,
  ImageIcon,
  ShieldCheck,
} from "lucide-react";

const signals = [
  {
    label: "Source Evidence",
    icon: Globe2,
    position: "left-0 top-10",
  },
  {
    label: "Visual Analysis",
    icon: ImageIcon,
    position: "right-0 top-16",
  },
  {
    label: "Metadata",
    icon: Fingerprint,
    position: "left-4 bottom-12",
  },
  {
    label: "Provenance",
    icon: FileCheck2,
    position: "right-4 bottom-8",
  },
];

export default function VerificationVisualization() {
  return (
    <div className="relative mx-auto h-[480px] w-full max-w-[560px]">
      <div className="absolute inset-0 rounded-[28px] border border-slate-200 bg-white/70 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]" />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 560 480"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M110 115 C170 150 190 190 240 215"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          <path
            d="M450 125 C390 155 370 190 320 215"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          <path
            d="M115 395 C175 350 205 315 245 290"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          <path
            d="M445 390 C390 350 360 320 315 290"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          <circle cx="280" cy="250" r="92" stroke="#dbeafe" />
          <circle cx="280" cy="250" r="72" stroke="#bfdbfe" />
        </svg>

        {signals.map((signal, index) => {
          const Icon = signal.icon;

          return (
            <motion.div
              key={signal.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.5 + index * 0.12,
                duration: 0.45,
              }}
              className={`absolute ${signal.position} z-10 w-40 rounded-xl border border-slate-200 bg-white p-3 shadow-sm`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Icon size={16} className="text-slate-600" />
                </div>

                <span className="text-xs font-semibold text-slate-700">
                  {signal.label}
                </span>
              </div>
            </motion.div>
          );
        })}

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="absolute left-1/2 top-1/2 z-20 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            <ShieldCheck size={15} />
            Verification Assessment
          </div>

          <div className="mt-5 flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold tracking-tight text-slate-900">
                Suspicious
              </div>

              <div className="mt-1 text-sm text-slate-500">
                Confidence: Medium
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-blue-700">78</div>
              <div className="text-xs text-slate-400">Risk / 100</div>
            </div>
          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "78%" }}
              transition={{ delay: 0.9, duration: 1.1 }}
              className="h-full rounded-full bg-blue-700"
            />
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
            <span className="text-slate-400">Evidence Fusion</span>
            <span className="font-semibold text-slate-700">5 signals</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}