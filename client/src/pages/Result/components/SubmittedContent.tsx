import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SubmittedContentProps {
  content: string;
}

export default function SubmittedContent({
  content,
}: SubmittedContentProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`submitted-content ${expanded ? "expanded" : ""}`}>
      <p>{content}</p>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Show less" : "Show more"}
        <ChevronDown
          size={15}
          className={expanded ? "rotate" : ""}
        />
      </button>
    </div>
  );
}