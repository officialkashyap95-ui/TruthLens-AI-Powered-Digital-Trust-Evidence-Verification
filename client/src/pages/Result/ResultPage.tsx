import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import "./Result.css";

import VerdictCard from "./components/VerdictCard";
import ConfidenceScore from "./components/ConfidenceScore";
import AnalysisSummary from "./components/AnalysisSummary";
import EvidenceList from "./components/EvidenceList";
import SubmittedContent from "./components/SubmittedContent";
import VerificationDetails from "./components/VerificationDetails";

type Evidence = {
  type: "supporting" | "contradicting" | "context";
  title: string;
  domain: string;
  description: string;
};

type AnalysisItem = {
  title: string;
  description: string;
};

type VerificationData = {
  verdict: string;
  confidence: number;
  type: string;
  summary: string;
  submittedContent: string;
  analysis: AnalysisItem[];
  evidence: Evidence[];
};

const verificationData: VerificationData = {
  verdict: "Likely Misleading",

  confidence: 82,

  type: "Text Verification",

  summary:
    "The submitted claim contains information that conflicts with multiple available sources. Some parts may be accurate, but the overall claim lacks sufficient supporting evidence.",

  submittedContent:
    "Example claim submitted for verification. This content will be replaced with the actual content submitted by the user.",

  analysis: [
    {
      title: "Claim Consistency",
      description:
        "The claim partially conflicts with information found across available sources.",
    },
    {
      title: "Source Credibility",
      description:
        "Higher-quality sources provide stronger evidence than several secondary references.",
    },
    {
      title: "Evidence Agreement",
      description:
        "Available sources show inconsistencies that reduce confidence in the claim.",
    },
    {
      title: "Context Analysis",
      description:
        "The claim appears to omit relevant context that changes how the information should be interpreted.",
    },
  ],

  evidence: [
    {
      type: "supporting",
      title: "Primary source supporting part of the claim",
      domain: "example.gov",
      description:
        "This source provides information that supports a portion of the submitted claim.",
    },
    {
      type: "contradicting",
      title: "Independent source contradicting the claim",
      domain: "example-news.com",
      description:
        "The source provides information that conflicts with an important part of the submitted statement.",
    },
    {
      type: "context",
      title: "Additional context surrounding the claim",
      domain: "example.org",
      description:
        "This source provides additional background needed to understand the claim accurately.",
    },
  ],
};

export default function ResultPage() {
  return (
    <div className="result-page">
      {/* Navigation */}
      <header className="result-nav">
        <div className="result-nav-inner">
          <Link to="/" className="result-brand">
            <span className="result-brand-mark">TL</span>
            <span>TruthLens</span>
          </Link>

          <nav className="result-nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/verify">New Verification</Link>
          </nav>

          <Link to="/verify" className="result-nav-button">
            Verify Content
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="result-main">
        {/* Back */}
        <motion.div
          className="result-back"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link to="/verify">
            <ArrowLeft size={15} />
            Back to verification
          </Link>
        </motion.div>

        {/* Header */}
        <motion.section
          className="result-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <span className="result-eyebrow">
            VERIFICATION RESULT
          </span>

          <h1>Verification Analysis</h1>

          <p>
            TruthLens analyzed the submitted content against available
            evidence and source signals.
          </p>

          <div className="result-completed">
            <CheckCircle2 size={14} />
            Analysis completed just now
          </div>
        </motion.section>

        {/* Verdict */}
        <motion.section
          className="result-verdict-layout"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.1,
            duration: 0.45,
          }}
        >
          <VerdictCard
            verdict={verificationData.verdict}
            summary={verificationData.summary}
          />

          <ConfidenceScore
            confidence={verificationData.confidence}
          />
        </motion.section>

        {/* Section 01 */}
        <section className="result-section">
          <div className="result-section-heading">
            <span>01</span>

            <div>
              <h2>Why TruthLens reached this verdict</h2>

              <p>
                The result is based on multiple verification signals rather
                than a single AI prediction.
              </p>
            </div>
          </div>

          <AnalysisSummary
            items={verificationData.analysis}
          />
        </section>

        {/* Section 02 */}
        <section className="result-section">
          <div className="result-section-heading">
            <span>02</span>

            <div>
              <h2>Evidence &amp; Sources</h2>

              <p>
                Review the evidence signals used to produce this verification
                result.
              </p>
            </div>
          </div>

          <div className="evidence-strength">
            <div>
              <span>Evidence Strength</span>
              <strong>Strong</strong>
            </div>

            <div className="strength-bar">
              <span />
            </div>

            <div className="evidence-count">
              {verificationData.evidence.length} relevant sources analyzed
            </div>
          </div>

          <EvidenceList
            evidence={verificationData.evidence}
          />
        </section>

        {/* Section 03 */}
        <section className="result-section">
          <div className="result-section-heading">
            <span>03</span>

            <div>
              <h2>Submitted Content</h2>

              <p>
                The original content submitted for verification.
              </p>
            </div>
          </div>

          <SubmittedContent
            content={verificationData.submittedContent}
          />
        </section>

        {/* Section 04 */}
        <section className="result-section">
          <div className="result-section-heading">
            <span>04</span>

            <div>
              <h2>Verification Details</h2>

              <p>
                Technical information about this analysis.
              </p>
            </div>
          </div>

          <VerificationDetails
            type={verificationData.type}
            sources={verificationData.evidence.length}
            processingTime="2.4 seconds"
            verificationId="TL-2026-0001"
          />
        </section>

        {/* Disclaimer */}
        <section className="result-disclaimer">
          <ShieldCheck size={18} />

          <div>
            <strong>Evidence-based, not absolute.</strong>

            <p>
              TruthLens evaluates available evidence and source signals.
              Confidence indicates the strength of the available evidence,
              not a guarantee of absolute truth.
            </p>
          </div>
        </section>

        {/* Actions */}
        <section className="result-actions">
          <Link
            to="/verify"
            className="result-primary-action"
          >
            <FileCheck2 size={17} />
            New Verification
          </Link>

          <Link
            to="/dashboard"
            className="result-secondary-action"
          >
            Back to Dashboard
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="result-footer">
        <span>
          TruthLens — Digital trust &amp; evidence verification
        </span>

        <div>
          <Link to="/">About</Link>
          <Link to="/">Privacy</Link>
          <Link to="/">Terms</Link>
        </div>
      </footer>
    </div>
  );
}