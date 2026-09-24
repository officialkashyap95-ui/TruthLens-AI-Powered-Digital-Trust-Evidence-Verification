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
  Video,
  AlertTriangle,
  Clock3,
  Activity,
  ScanSearch,
  Layers3,
} from "lucide-react";

import {
  Link,
  useLocation,
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


/*
 * ============================================================
 * VIDEO ANALYSIS TYPES
 * ============================================================
 */

type VideoFrame = {
  frameIndex?: number;
  fileName?: string;
  timestampSeconds?: number;
  timestamp?: string;
  frameRisk?: number;
  suspicious?: boolean;
  highRisk?: boolean;
  frameConfidence?: number;
  isSceneChange?: boolean;
};

type SuspiciousFrame = {
  frameIndex?: number;
  fileName?: string;
  timestampSeconds?: number;
  timestamp?: string;
  frameRisk?: number;
  manipulationScore?: number;
  aiGeneratedScore?: number;
  confidence?: number;
  isSceneChange?: boolean;
};

type SuspiciousSegmentFrame = {
  frameIndex?: number;
  timestamp?: string;
  timestampSeconds?: number;
  frameRisk?: number;
  confidence?: number;
  isSceneChange?: boolean;
};

type SuspiciousSegment = {
  segmentIndex?: number;
  startTimeSeconds?: number;
  endTimeSeconds?: number;
  startTimestamp?: string;
  endTimestamp?: string;
  durationSeconds?: number;
  framesCount?: number;
  averageRisk?: number;
  peakRisk?: number;
  averageConfidence?: number;
  severity?: "Moderate" | "Elevated" | "High";
  frames?: SuspiciousSegmentFrame[];
};

type VideoAnalysis = {
  averageRisk?: number;
  peakRisk?: number;
  fusedRisk?: number;

  suspiciousFrameRatio?: number;
  suspiciousFramePercentage?: number;
  suspiciousFrameCount?: number;
  suspiciousSegmentCount?: number;

  evidenceQuality?: string;

  frames?: VideoFrame[];
  suspiciousFrames?: SuspiciousFrame[];
  suspiciousSegments?: SuspiciousSegment[];
};


/*
 * ============================================================
 * EXTENDED VERIFICATION TYPE
 * ============================================================
 *
 * Keeps the existing Verification type while allowing the
 * newer video-analysis fields returned by the backend.
 */

type ResultVerification = Verification & {
  evidenceQuality?: number | string;

  fusion?: {
    evidenceQuality?: number | string;
    forensicRisk?: number;
    visualRisk?: number | null;
    independentSignals?: number;
  };

  visualAnalysis?: {
    available?: boolean;
    manipulationScore?: number | null;
    confidence?: number;
    verdict?: string;
    findings?: string[];
    evidenceQuality?: number | string;
  };

  riskScore?: number;

  videoAnalysis?: VideoAnalysis;

  metadata?: {
    filename?: string;
    mimeType?: string;
    sizeBytes?: number;
    sizeMB?: number;

    duration?: number;
    width?: number;
    height?: number;
    fps?: number;
    codec?: string;
    format?: string;

    framesAnalyzed?: number;
    totalFrames?: number;
    sceneChanges?: number;
  };
};


export default function ResultPage() {

  /*
   * ========================================================
   * VERIFICATION ID
   * ========================================================
   */

  const {
    verificationId,
  } = useParams<{
    verificationId: string;
  }>();


  /*
   * ========================================================
   * VERIFICATION PASSED FROM VERIFY PAGE
   * ========================================================
   */

  const location =
    useLocation();

  const stateVerification =
    (
      location.state as {
        verification?: Verification;
        savedToHistory?: boolean;
      } | null
    )?.verification;

  const savedToHistory =
    (
      location.state as {
        savedToHistory?: boolean;
      } | null
    )?.savedToHistory;


  /*
   * ========================================================
   * STATE
   * ========================================================
   */

  const [
    verification,
    setVerification,
  ] =
    useState<ResultVerification | null>(
      (stateVerification as ResultVerification) || null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(!stateVerification);

  const [
    error,
    setError,
  ] =
    useState("");


  /*
   * ========================================================
   * FETCH VERIFICATION
   * ========================================================
   */

  useEffect(() => {

    if (stateVerification) {
      return;
    }

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

          setLoading(true);
          setError("");

          const result =
            await getVerification(
              verificationId
            );

          console.log(
            "TruthLens verification result:",
            result
          );

          setVerification(
            result as ResultVerification
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

  }, [verificationId, stateVerification]);


  /*
   * ========================================================
   * LOADING STATE
   * ========================================================
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
   * ========================================================
   * ERROR STATE
   * ========================================================
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
   * ========================================================
   * SAFE DATA EXTRACTION
   * ========================================================
   */

  const evidence =
    verification.evidence || [];

  const analysis =
    verification.analysis || [];

  const videoAnalysis =
    verification.videoAnalysis;

  const isVideo =
    verification.type?.toLowerCase() === "video";


  /*
   * ========================================================
   * EVIDENCE QUALITY
   * ========================================================
   *
   * New video backend returns:
   *
   * "Limited"
   * "Good"
   * "Strong"
   *
   * Older image/text flows may still return a number.
   */

  const backendEvidenceQuality =
    verification.fusion
      ?.evidenceQuality ??
    verification.evidenceQuality ??
    verification.visualAnalysis
      ?.evidenceQuality;


  const getEvidenceQualityNumber =
    (
      quality: number | string | undefined
    ): number => {

      if (
        typeof quality === "number"
      ) {

        return Math.max(
          0,
          Math.min(
            100,
            Math.round(quality)
          )
        );
      }


      if (
        typeof quality === "string"
      ) {

        const normalized =
          quality.toLowerCase();

        if (
          normalized === "strong"
        ) {
          return 90;
        }

        if (
          normalized === "good"
        ) {
          return 75;
        }

        if (
          normalized === "moderate"
        ) {
          return 55;
        }

        if (
          normalized === "limited"
        ) {
          return 35;
        }

        if (
          normalized === "unavailable"
        ) {
          return 0;
        }

        const numeric =
          Number(quality);

        if (
          !Number.isNaN(numeric)
        ) {

          return Math.max(
            0,
            Math.min(
              100,
              Math.round(numeric)
            )
          );
        }
      }


      return evidence.length > 0
        ? Math.min(
            100,
            evidence.length * 10
          )
        : 0;
    };


  const evidenceQuality =
    getEvidenceQualityNumber(
      backendEvidenceQuality
    );


  /*
   * ========================================================
   * EVIDENCE STRENGTH LABEL
   * ========================================================
   */

  const getEvidenceStrength =
    (
      quality: number,
      backendQuality?: number | string
    ) => {

      if (
        typeof backendQuality === "string"
      ) {

        const normalized =
          backendQuality.toLowerCase();

        if (
          normalized === "strong"
        ) {
          return "Strong";
        }

        if (
          normalized === "good"
        ) {
          return "Good";
        }

        if (
          normalized === "moderate"
        ) {
          return "Moderate";
        }

        if (
          normalized === "limited"
        ) {
          return "Limited";
        }
      }


      if (quality >= 70) {
        return "Strong";
      }

      if (quality >= 45) {
        return "Moderate";
      }

      if (quality > 0) {
        return "Limited";
      }

      return "Unavailable";
    };


  const evidenceStrength =
    getEvidenceStrength(
      evidenceQuality,
      backendEvidenceQuality
    );


  /*
   * ========================================================
   * SOURCE COUNT
   * ========================================================
   */

  const sourcesAnalyzed =
    verification.sourcesAnalyzed ??
    (
      isVideo
        ? verification.metadata?.framesAnalyzed
        : undefined
    ) ??
    evidence.length;


  /*
   * ========================================================
   * VIDEO METRICS
   * ========================================================
   */

  const videoFramesAnalyzed =
    videoAnalysis?.frames?.length ??
    verification.metadata?.framesAnalyzed ??
    0;

  const suspiciousFrameCount =
    videoAnalysis?.suspiciousFrameCount ??
    videoAnalysis?.suspiciousFrames?.length ??
    0;

  const suspiciousSegmentCount =
    videoAnalysis?.suspiciousSegmentCount ??
    videoAnalysis?.suspiciousSegments?.length ??
    0;

  const averageRisk =
    typeof videoAnalysis?.averageRisk === "number"
      ? Math.round(videoAnalysis.averageRisk)
      : null;

  const peakRisk =
    typeof videoAnalysis?.peakRisk === "number"
      ? Math.round(videoAnalysis.peakRisk)
      : null;

  const fusedRisk =
    typeof videoAnalysis?.fusedRisk === "number"
      ? Math.round(videoAnalysis.fusedRisk)
      : null;

  const suspiciousFramePercentage =
    typeof videoAnalysis?.suspiciousFramePercentage === "number"
      ? Math.round(videoAnalysis.suspiciousFramePercentage)
      : typeof videoAnalysis?.suspiciousFrameRatio === "number"
      ? Math.round(
          videoAnalysis.suspiciousFrameRatio * 100
        )
      : videoFramesAnalyzed > 0
      ? Math.round(
          (suspiciousFrameCount /
            videoFramesAnalyzed) *
            100
        )
      : 0;


  /*
   * ========================================================
   * RENDER
   * ========================================================
   */

  return (
    <div className="result-page">

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

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


      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="result-main">


        {/* ===================================================
            HISTORY SAVING DISABLED BANNER
        ==================================================== */}

        {savedToHistory === false && (
          <div className="history-disabled-banner">

            <strong>
              This result wasn't saved to your history.
            </strong>

            <span>
              "Save History" is turned off in Settings, so
              this verification only exists on this page —
              it won't appear in Recent Verifications and
              this link won't work again after you leave.
            </span>

            <Link to="/settings">
              Turn it on in Settings
            </Link>

          </div>
        )}


        {/* ===================================================
            BACK
        ==================================================== */}

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


        {/* ===================================================
            HEADER
        ==================================================== */}

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


        {/* ===================================================
            VERDICT
        ==================================================== */}

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


        {/* ===================================================
            SECTION 01
        ==================================================== */}

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


        {/* ===================================================
            SECTION 02
        ==================================================== */}

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


          {/* =================================================
              VIDEO ANALYSIS
          ================================================== */}

          {isVideo && videoAnalysis && (

            <div className="video-analysis-panel">

              <div className="video-analysis-header">

                <div className="video-analysis-title">

                  <div className="video-analysis-icon">
                    <Video size={18} />
                  </div>

                  <div>

                    <strong>
                      Video Evidence Analysis
                    </strong>

                    <span>
                      Frame-level visual evidence
                      extracted from the submitted video.
                    </span>

                  </div>

                </div>

                <span
                  className={`video-quality-badge ${
                    evidenceStrength
                      .toLowerCase()
                      .replace(
                        /\s+/g,
                        "-"
                      )
                  }`}
                >
                  {videoAnalysis.evidenceQuality ||
                    evidenceStrength}
                </span>

              </div>


              {/* =================================================
                  VIDEO METRICS
              ================================================== */}

              <div className="video-metrics-grid">

                <div className="video-metric-card">

                  <Activity size={17} />

                  <span>
                    Average Risk
                  </span>

                  <strong>
                    {averageRisk !== null
                      ? `${averageRisk}/100`
                      : "N/A"}
                  </strong>

                </div>


                <div className="video-metric-card">

                  <AlertTriangle size={17} />

                  <span>
                    Peak Risk
                  </span>

                  <strong>
                    {peakRisk !== null
                      ? `${peakRisk}/100`
                      : "N/A"}
                  </strong>

                </div>


                <div className="video-metric-card">

                  <Layers3 size={17} />

                  <span>
                    Fused Risk
                  </span>

                  <strong>
                    {fusedRisk !== null
                      ? `${fusedRisk}/100`
                      : "N/A"}
                  </strong>

                </div>


                <div className="video-metric-card">

                  <ScanSearch size={17} />

                  <span>
                    Frames Analyzed
                  </span>

                  <strong>
                    {videoFramesAnalyzed}
                  </strong>

                </div>


                <div className="video-metric-card">

                  <AlertTriangle size={17} />

                  <span>
                    Suspicious Frames
                  </span>

                  <strong>
                    {suspiciousFrameCount}
                    {" / "}
                    {videoFramesAnalyzed}
                  </strong>

                </div>


                <div className="video-metric-card">

                  <Clock3 size={17} />

                  <span>
                    Suspicious Coverage
                  </span>

                  <strong>
                    {suspiciousFramePercentage}%
                  </strong>

                </div>

              </div>


              {/* =================================================
                  SUSPICIOUS SEGMENTS
              ================================================== */}

              {suspiciousSegmentCount > 0 &&
                videoAnalysis.suspiciousSegments &&
                videoAnalysis.suspiciousSegments.length > 0 && (

                <div className="video-segments">

                  <div className="video-subsection-heading">

                    <div>

                      <strong>
                        Suspicious Segments
                      </strong>

                      <span>
                        Consecutive frames showing elevated
                        visual risk.
                      </span>

                    </div>

                    <span>
                      {suspiciousSegmentCount}
                      {" "}
                      {suspiciousSegmentCount === 1
                        ? "segment"
                        : "segments"}
                    </span>

                  </div>


                  <div className="video-segment-list">

                    {videoAnalysis.suspiciousSegments.map(
                      (
                        segment,
                        index
                      ) => (

                        <div
                          className="video-segment-card"
                          key={
                            segment.segmentIndex ??
                            index
                          }
                        >

                          <div className="video-segment-main">

                            <div className="video-segment-number">
                              {String(
                                segment.segmentIndex ??
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </div>

                            <div>

                              <strong>
                                {segment.startTimestamp ||
                                  formatSeconds(
                                    segment.startTimeSeconds
                                  )}

                                {" — "}

                                {segment.endTimestamp ||
                                  formatSeconds(
                                    segment.endTimeSeconds
                                  )}
                              </strong>

                              <span>
                                {segment.framesCount ?? 0}
                                {" "}
                                frames
                                {" · "}
                                {segment.durationSeconds !== undefined
                                  ? `${segment.durationSeconds.toFixed(2)}s`
                                  : "duration unavailable"}
                              </span>

                            </div>

                          </div>


                          <div className="video-segment-risk">

                            <span
                              className={
                                `segment-severity ${
                                  (
                                    segment.severity ||
                                    "Moderate"
                                  ).toLowerCase()
                                }`
                              }
                            >
                              {segment.severity ||
                                "Moderate"}
                            </span>

                            <strong>
                              {typeof segment.peakRisk === "number"
                                ? `${Math.round(
                                    segment.peakRisk
                                  )}/100`
                                : "N/A"}
                            </strong>

                            <small>
                              Peak risk
                            </small>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>
              )}


              {/* =================================================
                  SUSPICIOUS FRAME DETAILS
              ================================================== */}

              {suspiciousFrameCount > 0 &&
                videoAnalysis.suspiciousFrames &&
                videoAnalysis.suspiciousFrames.length > 0 && (

                <div className="video-suspicious-frames">

                  <div className="video-subsection-heading">

                    <div>

                      <strong>
                        Suspicious Frames
                      </strong>

                      <span>
                        Individual frames that crossed
                        the configured risk threshold.
                      </span>

                    </div>

                  </div>


                  <div className="video-frame-list">

                    {videoAnalysis.suspiciousFrames.map(
                      (
                        frame,
                        index
                      ) => (

                        <div
                          className="video-frame-row"
                          key={
                            `${frame.frameIndex ?? index}-${frame.timestampSeconds ?? index}`
                          }
                        >

                          <div>

                            <strong>
                              Frame{" "}
                              {frame.frameIndex ??
                                index + 1}
                            </strong>

                            <span>
                              {frame.timestamp ||
                                formatSeconds(
                                  frame.timestampSeconds
                                )}
                            </span>

                          </div>


                          <div className="video-frame-risk">

                            <span>
                              Risk
                            </span>

                            <strong>
                              {typeof frame.frameRisk === "number"
                                ? `${Math.round(
                                    frame.frameRisk
                                  )}/100`
                                : "N/A"}
                            </strong>

                          </div>


                          <div className="video-frame-confidence">

                            <span>
                              Confidence
                            </span>

                            <strong>
                              {typeof frame.confidence === "number"
                                ? `${Math.round(
                                    frame.confidence
                                  )}%`
                                : "N/A"}
                            </strong>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>
              )}


              {/* =================================================
                  NO SUSPICIOUS SEGMENTS
              ================================================== */}

              {suspiciousFrameCount === 0 && (

                <div className="video-no-suspicious">

                  <CheckCircle2
                    size={18}
                  />

                  <div>

                    <strong>
                      No suspicious frames detected
                    </strong>

                    <span>
                      None of the analyzed frames crossed
                      the configured suspicious-risk threshold.
                    </span>

                  </div>

                </div>
              )}

            </div>
          )}


          {/* =================================================
              EVIDENCE STRENGTH
          ================================================== */}

          <div className="evidence-strength">

            <div>

              <span>
                Evidence Strength
              </span>


              <strong>
                {evidenceStrength}
              </strong>

            </div>


            <div className="strength-bar">

              <span
                style={{
                  width:
                    `${evidenceQuality}%`,
                }}
              />

            </div>


            <div className="evidence-count">

              {sourcesAnalyzed}

              {" "}

              relevant sources analyzed

            </div>

          </div>


          {/* =================================================
              EVIDENCE LIST
          ================================================== */}

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
                  did not return external
                  evidence for this verification.
                </p>

              </div>

            </div>

          )}

        </section>


        {/* ===================================================
            SECTION 03
        ==================================================== */}

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


        {/* ===================================================
            SECTION 04
        ==================================================== */}

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
              sourcesAnalyzed
            }

            processingTime={
              verification.processingTime ||
              "N/A"
            }

            verificationId={
              verification.verificationId
            }
          />


          {/* =================================================
              VIDEO METADATA
          ================================================== */}

          {isVideo &&
            verification.metadata && (

            <div className="video-metadata">

              <div className="video-metadata-heading">

                <Video size={17} />

                <strong>
                  Video Metadata
                </strong>

              </div>


              <div className="video-metadata-grid">

                <div>
                  <span>
                    Duration
                  </span>

                  <strong>
                    {formatDuration(
                      verification.metadata.duration
                    )}
                  </strong>
                </div>


                <div>
                  <span>
                    Resolution
                  </span>

                  <strong>
                    {verification.metadata.width &&
                    verification.metadata.height
                      ? `${verification.metadata.width} × ${verification.metadata.height}`
                      : "N/A"}
                  </strong>
                </div>


                <div>
                  <span>
                    Frame Rate
                  </span>

                  <strong>
                    {verification.metadata.fps
                      ? `${verification.metadata.fps} FPS`
                      : "N/A"}
                  </strong>
                </div>


                <div>
                  <span>
                    Codec
                  </span>

                  <strong>
                    {verification.metadata.codec ||
                      "N/A"}
                  </strong>
                </div>


                <div>
                  <span>
                    Format
                  </span>

                  <strong>
                    {verification.metadata.format ||
                      "N/A"}
                  </strong>
                </div>


                <div>
                  <span>
                    Scene Changes
                  </span>

                  <strong>
                    {verification.metadata.sceneChanges ??
                      0}
                  </strong>
                </div>

              </div>

            </div>
          )}

        </section>


        {/* ===================================================
            DISCLAIMER
        ==================================================== */}

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


        {/* ===================================================
            ACTIONS
        ==================================================== */}

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


      {/* =====================================================
          FOOTER
      ====================================================== */}

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


/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function formatSeconds(
  seconds?: number
): string {

  if (
    typeof seconds !== "number" ||
    !Number.isFinite(seconds)
  ) {
    return "Unknown time";
  }

  const totalSeconds =
    Math.max(
      0,
      Math.round(seconds)
    );

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const remainingSeconds =
    totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}


function formatDuration(
  duration?: number
): string {

  if (
    typeof duration !== "number" ||
    !Number.isFinite(duration)
  ) {
    return "N/A";
  }

  const totalSeconds =
    Math.round(duration);

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const seconds =
    totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}