import { ShieldCheck } from "lucide-react";

const items = [
  {
    title: "Evidence Signals",
    description: "Cross-reference available evidence and sources.",
  },
  {
    title: "Content Consistency",
    description: "Look for inconsistencies within the submitted content.",
  },
  {
    title: "Source Context",
    description: "Consider source information and contextual signals.",
  },
  {
    title: "Confidence Assessment",
    description:
      "Combine available signals into a transparent confidence assessment.",
  },
];

export default function VerificationInfo() {
  return (
    <section className="analyzes">
      <div>
        <span className="verify-eyebrow">
          TRANSPARENT ASSESSMENT
        </span>

        <h2>What TruthLens Analyzes</h2>
      </div>

      <div className="analyze-grid">
        {items.map((item) => (
          <div key={item.title}>
            <ShieldCheck size={17} />

            <strong>{item.title}</strong>

            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}