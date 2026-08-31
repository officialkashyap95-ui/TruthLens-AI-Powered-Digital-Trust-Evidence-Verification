import { motion } from "framer-motion";

interface ConfidenceScoreProps {
  confidence: number;
}

export default function ConfidenceScore({
  confidence,
}: ConfidenceScoreProps) {
  return (
    <div className="confidence-card">
      <div className="confidence-header">
        <span>Confidence</span>
        <strong>{confidence}%</strong>
      </div>

      <div className="confidence-track">
        <motion.div
          className="confidence-fill"
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <p>
        Confidence reflects the strength and consistency of the available
        evidence.
      </p>
    </div>
  );
}