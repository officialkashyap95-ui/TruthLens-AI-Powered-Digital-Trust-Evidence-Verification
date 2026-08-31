import { AlertTriangle } from "lucide-react";

interface VerdictCardProps {
  verdict: string;
  summary: string;
}

export default function VerdictCard({
  verdict,
  summary,
}: VerdictCardProps) {
  return (
    <div className="verdict-card">
      <div className="verdict-icon">
        <AlertTriangle size={22} />
      </div>

      <div className="verdict-content">
        <span className="verdict-label">VERDICT</span>

        <h2>{verdict}</h2>

        <p>{summary}</p>
      </div>
    </div>
  );
}