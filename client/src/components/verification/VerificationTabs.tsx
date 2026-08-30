import {
  FileSearch,
  FileText,
  Image as ImageIcon,
  Video,
} from "lucide-react";

export type VerificationType = "text" | "image" | "video" | "document";

interface VerificationTabsProps {
  selected: VerificationType;
  onChange: (type: VerificationType) => void;
}

const types = [
  {
    id: "text" as const,
    label: "Text",
    description: "Written claims and statements",
    icon: FileText,
  },
  {
    id: "image" as const,
    label: "Image",
    description: "Visual and contextual evidence",
    icon: ImageIcon,
  },
  {
    id: "video" as const,
    label: "Video",
    description: "Frames, speech, and metadata",
    icon: Video,
  },
  {
    id: "document" as const,
    label: "Document",
    description: "Extracted and source content",
    icon: FileSearch,
  },
];

export default function VerificationTabs({
  selected,
  onChange,
}: VerificationTabsProps) {
  return (
    <div className="type-selector" role="tablist">
      {types.map(({ id, label, description, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={selected === id}
          className={selected === id ? "selected" : ""}
          onClick={() => onChange(id)}
        >
          <Icon size={18} />

          <span>
            <strong>{label}</strong>
            <small>{description}</small>
          </span>
        </button>
      ))}
    </div>
  );
}