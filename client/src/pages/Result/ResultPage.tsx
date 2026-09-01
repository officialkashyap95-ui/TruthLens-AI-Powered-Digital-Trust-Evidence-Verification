import {
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getVerification,
  type Verification,
} from "../../services/verificationService";

import VerdictCard from "./components/VerdictCard";
import ConfidenceScore from "./components/ConfidenceScore";
import AnalysisSummary from "./components/AnalysisSummary";
import EvidenceList from "./components/EvidenceList";
import SubmittedContent from "./components/SubmittedContent";
import VerificationDetails from "./components/VerificationDetails";

import "./Result.css";

export default function ResultPage() {

  /*
   * IMPORTANT:
   *
   * App.tsx uses:
   *
   * /result/:verificationId
   *
   * Therefore we must read:
   *
   * verificationId
   */
  const {
    verificationId,
  } = useParams<{
    verificationId: string;
  }>();

  const [
    verification,
    setVerification,
  ] =
    useState<Verification | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  /*
   * Fetch verification result.
   */
  useEffect(() => {

    const fetchVerification =
      async () => {

        if (!verificationId) {

          setError(
            "Verification ID is missing."
          );

          setLoading(false);

          return;
        }

        try {

          const result =
            await getVerification(
              verificationId
            );

          setVerification(
            result
          );

        } catch (err) {

          console.error(
            "Verification fetch error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load verification."
          );

        } finally {

          setLoading(false);

        }
      };

    fetchVerification();

  }, [verificationId]);

  /*
   * Loading state
   */
  if (loading) {

    return (
      <div className="result-page">

        <div className="result-loading">

          <Loader2
            className="result-loading-icon"
            size={32}
          />

          <h2>
            Loading verification...
          </h2>

          <p>
            TruthLens is retrieving
            your verification result.
          </p>

        </div>

      </div>
    );
  }

  /*
   * Error state
   */
  if (
    error ||
    !verification
  ) {

    return (
      <div className="result-page">

        <div className="result-error">

          <ShieldCheck
            size={36}
          />

          <h2>
            Unable to load verification
          </h2>

          <p>
            {error ||
              "The requested verification could not be found."}
          </p>

          <Link
            to="/verify"
            className="result-primary-action"
          >
            <ArrowLeft
              size={17}
            />

            Back to Verification

          </Link>

        </div>

      </div>
    );
  }

  /*
   * Evidence
   */
  const evidence =
    verification.evidence || [];

  /*
   * Analysis
   */
  const analysis =
    verification.analysis || [];

  return (
    <div className="result-page">

      {/* =========================
          NAVIGATION
      ========================== */}

      <header className="result-nav">

        <div className="result-nav-inner">

          <Link
            to="/"
            className="result-brand"
          >

            <span className="result-brand-mark">
              TL
            </span>

            <span>
              TruthLens
            </span>

          </Link>

          <nav className="result-nav-links">

            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/verify">
              New Verification
            </Link>

          </nav>

          <Link
            to="/verify"
            className="result-nav-button"
          >
            Verify Content
          </Link>

        </div>

      </header>

      {/* =========================
          MAIN
      ========================== */}

      <main className="result-main">

        {/* Back */}
        <motion.div
          className="result-back"
          initial={{
            opacity: 0,
            x: -8,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.3,
          }}
        >

          <Link to="/verify">

            <ArrowLeft
              size={15}
            />

            Back to verification

          </Link>

        </motion.div>

        {/* Header */}
        <motion.section
          className="result-header"
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
        >

          <span className="result-eyebrow">
            VERIFICATION RESULT
          </span>

          <h1>
            Verification Analysis
          </h1>

          <p>
            TruthLens analyzed the submitted
            content against available evidence
            and source signals.
          </p>

          <div className="result-completed">

            <CheckCircle2
              size={14}
            />

            Analysis completed

          </div>

        </motion.section>

        {/* =========================
            VERDICT
        ========================== */}

        <motion.section
          className="result-verdict-layout"
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
            duration: 0.45,
          }}
        >

          <VerdictCard
            verdict={
              verification.verdict
            }
            summary={
              verification.summary
            }
          />

          <ConfidenceScore
            confidence={
              verification.confidence
            }
          />

        </motion.section>

        {/* =========================
            SECTION 01
        ========================== */}

        <section className="result-section">

          <div className="result-section-heading">

            <span>
              01
            </span>

            <div>

              <h2>
                Why TruthLens reached this verdict
              </h2>

              <p>
                The result is based on
                multiple verification signals
                rather than a single AI prediction.
              </p>

            </div>

          </div>

          <AnalysisSummary
            items={analysis}
          />

        </section>

        {/* =========================
            SECTION 02
        ========================== */}

        <section className="result-section">

          <div className="result-section-heading">

            <span>
              02
            </span>

            <div>

              <h2>
                Evidence &amp; Sources
              </h2>

              <p>
                Review the evidence signals
                used to produce this
                verification result.
              </p>

            </div>

          </div>

          <div className="evidence-strength">

            <div>

              <span>
                Evidence Strength
              </span>

              <strong>
                {evidence.length > 0
                  ? "Available"
                  : "Pending"}
              </strong>

            </div>

            <div className="strength-bar">

              <span
                style={{
                  width:
                    evidence.length > 0
                      ? "75%"
                      : "15%",
                }}
              />

            </div>

            <div className="evidence-count">

              {verification.sourcesAnalyzed ||
                evidence.length}

              {" "}
              relevant sources analyzed

            </div>

          </div>

          {evidence.length > 0 ? (

            <EvidenceList
              evidence={evidence}
            />

          ) : (

            <div className="result-empty-evidence">

              <ShieldCheck
                size={22}
              />

              <div>

                <strong>
                  Evidence analysis is not available yet.
                </strong>

                <p>
                  The verification engine
                  did not return evidence
                  for this verification.
                </p>

              </div>

            </div>

          )}

        </section>

        {/* =========================
            SECTION 03
        ========================== */}

        <section className="result-section">

          <div className="result-section-heading">

            <span>
              03
            </span>

            <div>

              <h2>
                Submitted Content
              </h2>

              <p>
                The original content submitted
                for verification.
              </p>

            </div>

          </div>

          <SubmittedContent
            content={
              verification.content
            }
          />

        </section>

        {/* =========================
            SECTION 04
        ========================== */}

        <section className="result-section">

          <div className="result-section-heading">

            <span>
              04
            </span>

            <div>

              <h2>
                Verification Details
              </h2>

              <p>
                Technical information about
                this analysis.
              </p>

            </div>

          </div>

          <VerificationDetails
            type={
              verification.type
            }
            sources={
              verification.sourcesAnalyzed ||
              evidence.length
            }
            processingTime={
              verification.processingTime ||
              "N/A"
            }
            verificationId={
              verification.verificationId
            }
          />

        </section>

        {/* =========================
            DISCLAIMER
        ========================== */}

        <section className="result-disclaimer">

          <ShieldCheck
            size={18}
          />

          <div>

            <strong>
              Evidence-based, not absolute.
            </strong>

            <p>
              TruthLens evaluates available
              evidence and source signals.
              Confidence indicates the strength
              of the available evidence, not a
              guarantee of absolute truth.
            </p>

          </div>

        </section>

        {/* =========================
            ACTIONS
        ========================== */}

        <section className="result-actions">

          <Link
            to="/verify"
            className="result-primary-action"
          >

            <FileCheck2
              size={17}
            />

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

      {/* =========================
          FOOTER
      ========================== */}

      <footer className="result-footer">

        <span>
          TruthLens — Digital trust &
          evidence verification
        </span>

        <div>

          <Link to="/">
            About
          </Link>

          <Link to="/">
            Privacy
          </Link>

          <Link to="/">
            Terms
          </Link>

        </div>

      </footer>

    </div>
  );
}