import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
  PlaySquare,
  X,
} from "lucide-react";

import {
  getVerificationHistory,
  type Verification,
  type VerificationType,
} from "../../services/verificationService";

function Verdict({
  tone,
  children,
}: {
  tone: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`verdict ${tone}`}
    >
      <i />
      {children}
    </span>
  );
}

/* =========================================================
   VERDICT TONE
========================================================= */

const getVerdictTone = (
  verdict: string
) => {
  const value =
    verdict.toLowerCase();

  if (
    value.includes("authentic") ||
    value.includes("verified") ||
    value.includes("safe") ||
    value.includes("likely authentic")
  ) {
    return "trusted";
  }

  if (
    value.includes("manipulated") ||
    value.includes("fake") ||
    value.includes("fraud") ||
    value.includes("high risk")
  ) {
    return "flagged";
  }

  return "review";
};

/* =========================================================
   ICON
========================================================= */

const getVerificationIcon = (
  type: VerificationType
) => {
  switch (type) {
    case "image":
      return ImageIcon;

    case "video":
      return PlaySquare;

    case "document":
      return FileText;

    case "text":
    default:
      return FileText;
  }
};

/* =========================================================
   DATE
========================================================= */

const formatDate = (
  date?: string
) => {
  if (!date) {
    return "—";
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "—";
  }

  const now =
    new Date();

  const diff =
    now.getTime() -
    parsedDate.getTime();

  const minutes =
    Math.floor(
      diff /
        (1000 * 60)
    );

  const hours =
    Math.floor(
      diff /
        (1000 * 60 * 60)
    );

  const days =
    Math.floor(
      diff /
        (1000 * 60 * 60 * 24)
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

/* =========================================================
   DISPLAY CONTENT
========================================================= */

const getDisplayContent = (
  verification: Verification
) => {
  if (
    verification.type ===
    "image"
  ) {
    return (
      verification.fileName ||
      verification.content ||
      "Image verification"
    );
  }

  if (
    verification.type ===
    "document"
  ) {
    return (
      verification.fileName ||
      verification.content ||
      "Document verification"
    );
  }

  if (
    verification.type ===
    "video"
  ) {
    return (
      verification.fileName ||
      verification.content ||
      "Video verification"
    );
  }

  const content =
    verification.content ||
    "";

  if (content.length > 60) {
    return (
      content.substring(
        0,
        60
      ) + "..."
    );
  }

  return (
    content ||
    "Text verification"
  );
};

/* =========================================================
   HISTORY ROW
========================================================= */

function HistoryRow({
  verification,
}: {
  verification: Verification;
}) {
  const Icon =
    getVerificationIcon(
      verification.type
    );

  return (
    <div className="table-row">
      <span className="content-cell">
        <span className="row-icon">
          <Icon size={15} />
        </span>

        <strong>
          {getDisplayContent(
            verification
          )}
        </strong>
      </span>

      <span className="type-cell">
        {verification.type}
      </span>

      <span>
        <Verdict
          tone={getVerdictTone(
            verification.verdict
          )}
        >
          {verification.verdict}
        </Verdict>
      </span>

      <span className="confidence-cell">
        {verification.confidence}%
      </span>

      <span className="date-cell">
        {formatDate(
          verification.createdAt
        )}
      </span>
    </div>
  );
}

/* =========================================================
   TABLE HEADER
========================================================= */

function HistoryTableHeader() {
  return (
    <div className="table-row table-head">
      <span>
        CONTENT
      </span>

      <span>
        TYPE
      </span>

      <span>
        VERDICT
      </span>

      <span>
        CONFIDENCE
      </span>

      <span>
        DATE
      </span>
    </div>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function RecentVerifications() {
  const [
    history,
    setHistory,
  ] = useState<
    Verification[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    showHistory,
    setShowHistory,
  ] = useState(false);

  /* =======================================================
     LOAD REAL HISTORY
  ======================================================= */

  const loadHistory =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getVerificationHistory();

        setHistory(data);
      } catch (error) {
        console.error(
          "[TruthLens] Failed to load history:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load verification history."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadHistory();
  }, []);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (!showHistory) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        setShowHistory(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [showHistory]);

  /* =======================================================
     LOCK BODY SCROLL WHEN MODAL IS OPEN
  ======================================================= */

  useEffect(() => {
    if (showHistory) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [showHistory]);

  /* =======================================================
     RECENT FOUR
  ======================================================= */

  const recentHistory =
    history.slice(
      0,
      4
    );

  return (
    <>
      {/* =====================================================
          RECENT VERIFICATIONS
      ===================================================== */}

      <section
        id="recent-verifications"
        className="workspace-section recent-section"
      >
        <div className="section-intro">
          <div>
            <span className="section-overline">
              ACTIVITY LOG
            </span>

            <h2>
              Recent verifications
            </h2>

            <p>
              Your latest content
              analysis activity.
            </p>
          </div>

          <button
            type="button"
            className="quiet-link"
            onClick={() =>
              setShowHistory(true)
            }
          >
            View all history

            <ArrowRight
              size={14}
            />
          </button>
        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="history-state">
            Loading verification
            history...
          </div>
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading &&
          error && (
            <div className="history-state history-error">
              {error}
            </div>
          )}

        {/* ===================================================
            EMPTY
        =================================================== */}

        {!loading &&
          !error &&
          history.length === 0 && (
            <div className="history-state">
              No verifications yet.
            </div>
          )}

        {/* ===================================================
            RECENT TABLE
        =================================================== */}

        {!loading &&
          !error &&
          recentHistory.length > 0 && (
            <div className="verification-table">
              <HistoryTableHeader />

              {recentHistory.map(
                (
                  verification
                ) => (
                  <HistoryRow
                    key={
                      verification.verificationId
                    }
                    verification={
                      verification
                    }
                  />
                )
              )}
            </div>
          )}
      </section>

      {/* =====================================================
          HISTORY MODAL
      ===================================================== */}

      {showHistory && (
        <div
          className="history-overlay"
          role="presentation"
          onClick={() =>
            setShowHistory(false)
          }
        >
          <div
            className="history-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-title"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="history-modal-header">
              <div>
                <span className="section-overline">
                  ACTIVITY LOG
                </span>

                <h2 id="history-title">
                  Verification history
                </h2>

                <p>
                  Your complete
                  verification history
                  stored by TruthLens.
                </p>
              </div>

              <button
                type="button"
                className="history-close"
                onClick={() =>
                  setShowHistory(
                    false
                  )
                }
                aria-label="Close history"
              >
                <X size={20} />
              </button>
            </div>

            {/* =================================================
                MODAL BODY
            ================================================= */}

            <div className="history-modal-body">
              {loading && (
                <div className="history-state">
                  Loading verification
                  history...
                </div>
              )}

              {!loading &&
                error && (
                  <div className="history-state history-error">
                    {error}
                  </div>
                )}

              {!loading &&
                !error &&
                history.length ===
                  0 && (
                  <div className="history-state">
                    No verification
                    history found.
                  </div>
                )}

              {!loading &&
                !error &&
                history.length > 0 && (
                  <div className="verification-table">
                    <HistoryTableHeader />

                    {history.map(
                      (
                        verification
                      ) => (
                        <HistoryRow
                          key={
                            `history-${verification.verificationId}`
                          }
                          verification={
                            verification
                          }
                        />
                      )
                    )}
                  </div>
                )}
            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="history-modal-footer">
              <span>
                {history.length}{" "}
                {history.length === 1
                  ? "verification"
                  : "verifications"}{" "}
                found
              </span>

              <button
                type="button"
                className="history-footer-close"
                onClick={() =>
                  setShowHistory(
                    false
                  )
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}