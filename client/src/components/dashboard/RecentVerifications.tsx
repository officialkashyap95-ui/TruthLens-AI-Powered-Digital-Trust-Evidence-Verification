import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
  PlaySquare,
} from "lucide-react";

const recentVerifications = [
  {
    content: "Government policy article",
    type: "Text",
    verdict: "Likely Authentic",
    confidence: "92%",
    date: "Today",
    tone: "trusted",
    icon: FileText,
  },
  {
    content: "Social media image",
    type: "Image",
    verdict: "Needs Review",
    confidence: "61%",
    date: "Yesterday",
    tone: "review",
    icon: ImageIcon,
  },
  {
    content: "Uploaded report",
    type: "Document",
    verdict: "Likely Authentic",
    confidence: "89%",
    date: "2 days ago",
    tone: "trusted",
    icon: FileText,
  },
  {
    content: "Short video",
    type: "Video",
    verdict: "Potentially Manipulated",
    confidence: "34%",
    date: "3 days ago",
    tone: "flagged",
    icon: PlaySquare,
  },
];

function Verdict({
  tone,
  children,
}: {
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`verdict ${tone}`}>
      <i />
      {children}
    </span>
  );
}

export default function RecentVerifications() {
  return (
    <section className="workspace-section recent-section">
      <div className="section-intro">
        <div>
          <span className="section-overline">
            ACTIVITY LOG
          </span>

          <h2>Recent verifications</h2>

          <p>
            Your latest content analysis activity.
          </p>
        </div>

        <a
          className="quiet-link"
          href="/history"
        >
          View all history
          <ArrowRight size={14} />
        </a>
      </div>

      <div className="verification-table">
        <div className="table-row table-head">
          <span>CONTENT</span>
          <span>TYPE</span>
          <span>VERDICT</span>
          <span>CONFIDENCE</span>
          <span>DATE</span>
        </div>

        {recentVerifications.map(
          ({
            content,
            type,
            verdict,
            confidence,
            date,
            tone,
            icon: Icon,
          }) => (
            <a
              className="table-row"
              href="/history"
              key={content}
            >
              <span className="content-cell">
                <span className="row-icon">
                  <Icon size={15} />
                </span>

                <strong>{content}</strong>
              </span>

              <span className="type-cell">
                {type}
              </span>

              <span>
                <Verdict tone={tone}>
                  {verdict}
                </Verdict>
              </span>

              <span className="confidence-cell">
                {confidence}
              </span>

              <span className="date-cell">
                {date}
              </span>
            </a>
          )
        )}
      </div>
    </section>
  );
}