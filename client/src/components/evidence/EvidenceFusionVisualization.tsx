import { motion } from "framer-motion";
import {
  Database,
  FileSearch,
  Globe,
  Layers3,
  ShieldCheck,
} from "lucide-react";

const inputs = [
  { label: "Source", icon: Globe },
  { label: "Visual", icon: FileSearch },
  { label: "Metadata", icon: Database },
  { label: "Context", icon: Layers3 },
];

export default function EvidenceFusionVisualization() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_220px_1fr] lg:items-center">
        <div className="space-y-3">
          {inputs.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                  <Icon size={17} className="text-slate-600" />
                </div>

                <span className="text-sm font-medium text-slate-700">
                  {item.label} Evidence
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="relative flex justify-center">
          <div className="absolute hidden h-px w-full bg-slate-200 lg:block" />

          <motion.div
            whileHover={{ scale: 1.03 }}
            className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-center"
          >
            <ShieldCheck size={30} className="text-blue-700" />

            <span className="mt-2 text-xs font-bold uppercase tracking-wider text-blue-900">
              Evidence
            </span>

            <span className="text-xs text-blue-700">Fusion Engine</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Assessment
          </div>

          <div className="mt-4 text-3xl font-bold text-slate-900">
            78 / 100
          </div>

          <div className="mt-1 text-sm font-medium text-amber-700">
            Suspicious
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-500">
            Multiple evidence signals are combined to produce an explainable
            assessment rather than relying on a single detector.
          </div>
        </motion.div>
      </div>
    </div>
  );
}