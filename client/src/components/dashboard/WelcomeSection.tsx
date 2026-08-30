import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomeSection() {
  return (
    <motion.section
      className="welcome-section"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <span className="section-overline">
          TRUST WORKSPACE
        </span>

        <h1>Verify what you can trust.</h1>

        <p>
          Analyze digital content with evidence-based
          verification and understand the signals behind
          every result.
        </p>
      </div>

      <div className="welcome-actions">
        <a
          className="dash-primary-button"
          href="/verify"
        >
          Start Verification
          <ArrowRight size={15} />
        </a>

        <a
          className="quiet-link"
          href="/history"
        >
          View History
        </a>
      </div>
    </motion.section>
  );
}