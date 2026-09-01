import {
  CheckCircle2,
  ExternalLink,
  Info,
  XCircle,
} from "lucide-react";

import type {
  Evidence,
} from "../../../services/verificationService";

interface EvidenceListProps {
  evidence: Evidence[];
}

export default function EvidenceList({
  evidence,
}: EvidenceListProps) {

  /*
   * Create a safe source URL.
   */
  const getSourceUrl = (
    item: Evidence
  ) => {

    if (
      item.url &&
      item.url.trim()
    ) {
      return item.url;
    }

    if (
      item.domain &&
      item.domain.trim()
    ) {
      return `https://${item.domain}`;
    }

    return "";
  };

  return (
    <div className="evidence-list">

      {evidence.map(
        (item, index) => {

          const isSupporting =
            item.type ===
            "supporting";

          const isContradicting =
            item.type ===
            "contradicting";

          const sourceUrl =
            getSourceUrl(item);

          return (
            <article
              className="evidence-card"
              key={`${item.title}-${index}`}
            >

              {/* Status */}
              <div
                className={`evidence-status ${item.type}`}
                aria-label={
                  item.type
                }
              >

                {isSupporting ? (

                  <CheckCircle2
                    size={18}
                  />

                ) : isContradicting ? (

                  <XCircle
                    size={18}
                  />

                ) : (

                  <Info
                    size={18}
                  />

                )}

              </div>

              {/* Content */}
              <div className="evidence-content">

                <div className="evidence-meta">

                  <span>
                    {item.type}
                  </span>

                  <small>
                    {item.domain ||
                      "Unknown source"}
                  </small>

                </div>

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.description}
                </p>

                {sourceUrl && (

                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="evidence-source"
                  >

                    View source

                    <ExternalLink
                      size={12}
                    />

                  </a>

                )}

              </div>

            </article>
          );
        }
      )}

    </div>
  );
}