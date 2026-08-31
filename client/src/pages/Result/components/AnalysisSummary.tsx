import {
  CheckCircle2,
  FileSearch,
  Globe2,
  Scale,
} from "lucide-react";

interface AnalysisItem {
  title: string;
  description: string;
}

interface AnalysisSummaryProps {
  items: AnalysisItem[];
}

const icons = [
  <Scale size={18} />,
  <Globe2 size={18} />,
  <CheckCircle2 size={18} />,
  <FileSearch size={18} />,
];

export default function AnalysisSummary({
  items,
}: AnalysisSummaryProps) {
  return (
    <div className="analysis-grid">
      {items.map((item, index) => (
        <article className="analysis-card" key={item.title}>
          <div className="analysis-icon">{icons[index]}</div>

          <h3>{item.title}</h3>

          <p>{item.description}</p>
        </article>
      ))}
    </div>
  );
}