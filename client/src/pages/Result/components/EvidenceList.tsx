import {
  CheckCircle2,
  ExternalLink,
  Info,
  XCircle,
} from "lucide-react";

type Evidence = {
  type: "supporting" | "contradicting" | "context";
  title: string;
  domain: string;
  description: string;
};

interface EvidenceListProps {
  evidence: Evidence[];
}

export default function EvidenceList({
  evidence,
}: EvidenceListProps) {
  return (
    <div className="evidence-list">
      {evidence.map((item, index) => {
        const isSupporting = item.type === "supporting";
        const isContradicting = item.type === "contradicting";

        return (
          <article className="evidence-card" key={index}>
            <div
              className={`evidence-status ${item.type}`}
              aria-label={item.type}
            >
              {isSupporting ? (
                <CheckCircle2 size={18} />
              ) : isContradicting ? (
                <XCircle size={18} />
              ) : (
                <Info size={18} />
              )}
            </div>

            <div className="evidence-content">
              <div className="evidence-meta">
                <span>{item.type}</span>
                <small>{item.domain}</small>
              </div>

              <h3>{item.title}</h3>

              <p>{item.description}</p>

              <a
                href={`https://${item.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="evidence-source"
              >
                View source
                <ExternalLink size={12} />
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}