import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  ImageIcon,
  Newspaper,
  PlaySquare,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";

import Navbar from "../../components/navigation/Navbar";
import Footer from "../../components/navigation/Footer";
import VerificationVisualization from "../../components/verification/VerificationVisualization";
import EvidenceFusionVisualization from "../../components/evidence/EvidenceFusionVisualization";

const capabilities = [
  {
    icon: Newspaper,
    title: "Text & News",
    description:
      "Analyze claims, sources, supporting evidence, and contextual consistency.",
  },
  {
    icon: ImageIcon,
    title: "Image Analysis",
    description:
      "Inspect visual signals, metadata, provenance, and manipulation indicators.",
  },
  {
    icon: PlaySquare,
    title: "Video Analysis",
    description:
      "Examine frames, temporal consistency, audio, metadata, and manipulation signals.",
  },
  {
    icon: FileText,
    title: "Document Analysis",
    description:
      "Inspect extracted text, metadata, layout, fonts, alignment, and consistency.",
  },
  {
    icon: SearchCheck,
    title: "Evidence Fusion",
    description:
      "Combine independent signals into an explainable verification assessment.",
  },
];

const steps = [
  {
    number: "01",
    title: "Submit",
    description: "Upload or enter the content you want to verify.",
  },
  {
    number: "02",
    title: "Analyze",
    description: "Specialized analysis modules examine the content.",
  },
  {
    number: "03",
    title: "Gather Evidence",
    description:
      "Collect signals from content, metadata, sources, and context.",
  },
  {
    number: "04",
    title: "Fuse Signals",
    description:
      "Multiple signals are combined instead of relying on one detector.",
  },
  {
    number: "05",
    title: "Explain",
    description:
      "Receive a risk assessment, confidence level, evidence, and recommendation.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:48px_48px]" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(59,130,246,0.10),transparent_30%)]" />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-slate-500 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                AI-POWERED DIGITAL TRUST
              </div>

              <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
                See the evidence behind what you believe.
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
                TruthLens examines claims, images, videos, and documents using
                multiple independent signals, then explains the evidence behind
                its assessment.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/verify"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Verify Content
                  <ArrowRight size={17} />
                </a>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  See How It Works
                </a>
              </div>

              <div className="mt-9 flex items-center gap-3 text-sm text-slate-500">
                <ShieldCheck size={18} className="text-teal-700" />
                Evidence-first verification
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <VerificationVisualization />
            </motion.div>
          </div>
        </section>

        {/* SIGNAL STRIP */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-7 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {[
                "Text & Claims",
                "Image Analysis",
                "Video Analysis",
                "Document Analysis",
                "Source & Context",
              ].map((item) => (
                <div
                  key={item}
                  className="text-center text-sm font-medium text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
        >
          <div className="max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-700">
              How It Works
            </div>

            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              From content to evidence.
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              TruthLens turns complex digital verification into a transparent,
              traceable process.
            </p>
          </div>

          <div className="mt-14 grid gap-0 border-y border-slate-200 md:grid-cols-5">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="border-b border-slate-200 p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
              >
                <div className="text-sm font-bold text-blue-700">
                  {step.number}
                </div>

                <h3 className="mt-8 text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CAPABILITIES */}
        <section id="capabilities" className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="max-w-2xl">
              <div className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-700">
                Capabilities
              </div>

              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                One system for modern digital verification.
              </h2>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.07 }}
                    whileHover={{ y: -3 }}
                    className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white">
                      <Icon size={19} className="text-slate-700" />
                    </div>

                    <h3 className="mt-6 text-lg font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>

                    <div className="mt-6 text-sm font-semibold text-slate-700">
                      Explore →
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* EVIDENCE FUSION */}
        <section id="evidence" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-700">
                Evidence Fusion
              </div>

              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                Verification shouldn't depend on a single signal.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                A suspicious result should be supported by evidence. TruthLens
                combines independent signals to build a more reliable and
                explainable assessment.
              </p>
            </div>

            <EvidenceFusionVisualization />
          </div>
        </section>

        {/* RESULT PREVIEW */}
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-300">
                  Explainable Results
                </div>

                <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                  Understand why the system reached its conclusion.
                </h2>

                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
                  Instead of a black-box verdict, TruthLens presents the
                  signals, evidence, confidence, and recommended next action.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                <div className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Verification Result
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-semibold">Suspicious</div>
                    <div className="mt-1 text-sm text-slate-400">
                      Confidence: Medium
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-4xl font-bold text-blue-400">
                      78
                    </div>
                    <div className="text-xs text-slate-500">Risk / 100</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    ["Source Credibility", "72"],
                    ["Visual Analysis", "81"],
                    ["Context Consistency", "65"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>

                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 border-t border-slate-800 pt-5">
                  <div className="text-sm font-semibold">
                    Why this result?
                  </div>

                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                    <li>• Source evidence requires additional verification</li>
                    <li>• Visual inconsistencies were detected</li>
                    <li>• Available context does not fully support the claim</li>
                  </ul>
                </div>

                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-xs uppercase tracking-wider text-slate-500">
                    Recommended Action
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Verify the original source before sharing this content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 text-center sm:px-12">
            <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:36px_36px]" />

            <div className="relative">
              <h2 className="text-4xl font-semibold tracking-tight text-white">
                Have something you're not sure about?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                Let the evidence speak.
              </p>

              <a
                href="/verify"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Start Verification
                <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}