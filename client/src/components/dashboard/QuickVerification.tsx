import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Video,
} from "lucide-react";

const verificationTypes = [
  {
    label: "Text",
    description:
      "Analyze claims, statements, and written content.",
    icon: FileText,
  },
  {
    label: "Image",
    description:
      "Inspect visual content for manipulation signals.",
    icon: ImageIcon,
  },
  {
    label: "Video",
    description:
      "Analyze video content for manipulation signals.",
    icon: Video,
  },
  {
    label: "Document",
    description:
      "Inspect documents for suspicious changes.",
    icon: FileText,
  },
];

export default function QuickVerification() {
  return (
    <section className="workspace-section verification-section">
      <div className="section-intro">
        <div>
          <span className="section-overline">
            QUICK ACTION
          </span>

          <h2>Start a verification</h2>

          <p>
            Choose the type of content you want TruthLens
            to analyze.
          </p>
        </div>
      </div>

      <motion.div
        className="verification-grid"
        initial="hidden"
        animate="show"
        variants={{
          show: {
            transition: {
              staggerChildren: 0.06,
            },
          },
        }}
      >
        {verificationTypes.map(
          ({ label, description, icon: Icon }) => (
            <motion.div
              key={label}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 6,
                },
                show: {
                  opacity: 1,
                  y: 0,
                },
              }}
            >
              <a
                className="verification-type"
                href={`/verify?type=${label.toLowerCase()}`}
              >
                <span className="type-icon">
                  <Icon size={18} />
                </span>

                <span className="type-copy">
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>

                <ArrowRight
                  className="type-arrow"
                  size={16}
                />
              </a>
            </motion.div>
          )
        )}
      </motion.div>
    </section>
  );
}