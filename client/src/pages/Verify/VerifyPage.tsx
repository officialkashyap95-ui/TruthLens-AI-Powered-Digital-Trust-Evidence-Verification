import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldCheck, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import VerificationTabs, {
  type VerificationType,
} from "../../components/verification/VerificationTabs";

import TextVerifier from "../../components/verification/TextVerifier";
import FileUploader from "../../components/verification/FileUploader";
import AnalysisProgress from "../../components/verification/AnalysisProgress";
import VerificationInfo from "../../components/verification/VerificationInfo";

import "./Verify.css";

export default function VerifyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [type, setType] =
    useState<VerificationType>("text");

  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryType =
      searchParams.get("type") as VerificationType | null;

    if (
      queryType &&
      ["text", "image", "video", "document"].includes(queryType)
    ) {
      setType(queryType);
    }
  }, [searchParams]);

  const handleTypeChange = (
    nextType: VerificationType
  ) => {
    setType(nextType);
    setFile(null);
    setError("");
  };

  const handleSubmit = () => {
    if (type === "text" && !text.trim()) {
      setError(
        "Enter content before starting the analysis."
      );
      return;
    }

    if (type !== "text" && !file) {
      setError(
        `Select a ${type} before starting the analysis.`
      );
      return;
    }

    setError("");
    setLoading(true);

    /*
     * Temporary frontend flow.
     *
     * Later this will call the Python/FastAPI backend.
     */
    setTimeout(() => {
      navigate("/result");
    }, 1100);
  };

  return (
    <div className="verify-shell">

      {/* Header */}
      <header className="verify-nav">
        <div className="verify-nav-inner">

          <a href="/" className="verify-brand">
            <span className="verify-mark">
              <span />
            </span>

            TruthLens
          </a>

          <nav className="verify-links">
            <a href="/#how-it-works">
              How It Works
            </a>

            <a href="/#capabilities">
              Capabilities
            </a>

            <a href="/#evidence">
              Evidence
            </a>

            <a href="/#about">
              About
            </a>
          </nav>

          <div className="verify-nav-actions">
            <a href="/dashboard">
              Dashboard
            </a>

            <a
              href="/verify"
              className="verify-nav-cta"
            >
              Verify Content
            </a>
          </div>

        </div>
      </header>

      <main className="verify-main">

        {/* Page heading */}
        <motion.div
          className="verify-heading"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="verify-eyebrow">
            TRUST & EVIDENCE VERIFICATION
          </span>

          <h1>
            Verify Digital Content
          </h1>

          <p>
            Analyze claims, images, videos, and
            documents using multiple evidence signals
            to assess their credibility and authenticity.
          </p>
        </motion.div>

        {/* Verification workspace */}
        <section
          className="verify-workspace"
          aria-label="Verification workspace"
        >

          <VerificationTabs
            selected={type}
            onChange={handleTypeChange}
          />

          <AnimatePresence mode="wait">

            {loading ? (
              <AnalysisProgress
                key="progress"
                type={
                  type.charAt(0).toUpperCase() +
                  type.slice(1)
                }
              />
            ) : (
              <motion.div
                key={type}
                className="input-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >

                {type === "text" ? (
                  <TextVerifier
                    text={text}
                    source={source}
                    onTextChange={setText}
                    onSourceChange={setSource}
                  />
                ) : (
                  <>
                    <div className="file-area">

                      {file ? (
                        <div className="file-selected">

                          <div className="file-symbol">
                            <ShieldCheck size={22} />
                          </div>

                          <div>
                            <strong>
                              {file.name}
                            </strong>

                            <small>
                              {file.type ||
                                "Uploaded file"}{" "}
                              ·{" "}
                              {(
                                file.size /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </small>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setFile(null)
                            }
                            aria-label="Remove file"
                          >
                            <X size={17} />
                          </button>

                        </div>
                      ) : (
                        <FileUploader
                          type={type}
                          file={file}
                          onFileChange={setFile}
                        />
                      )}

                    </div>
                  </>
                )}

                {error && (
                  <p
                    className="verify-error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  className="analyze-button"
                  disabled={
                    type === "text"
                      ? !text.trim()
                      : !file
                  }
                  onClick={handleSubmit}
                >
                  Analyze{" "}
                  {type.charAt(0).toUpperCase() +
                    type.slice(1)}

                  <ArrowRight size={16} />
                </button>

              </motion.div>
            )}

          </AnimatePresence>

        </section>

        {/* Information */}
        <VerificationInfo />

      </main>
    </div>
  );
}