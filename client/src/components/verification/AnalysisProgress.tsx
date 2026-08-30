import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface AnalysisProgressProps {
  type: string;
}

export default function AnalysisProgress({
  type,
}: AnalysisProgressProps) {
  return (
    <motion.div
      className="analysis-progress"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="analysis-header">
        <span className="spinner" />

        <div>
          <strong>Analyzing {type}</strong>

          <p>
            TruthLens is examining the submitted content
            and available evidence.
          </p>
        </div>
      </div>

      <div className="analysis-steps">
        <span>
          <Check size={14} />
          Content received
        </span>

        <span className="current">
          <i />
          Analyzing content
        </span>

        <span>
          <i />
          Gathering evidence
        </span>

        <span>
          <i />
          Preparing assessment
        </span>
      </div>
    </motion.div>
  );
}