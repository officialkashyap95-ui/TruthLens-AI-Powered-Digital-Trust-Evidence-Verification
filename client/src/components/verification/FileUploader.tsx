import { useRef } from "react";
import { UploadCloud } from "lucide-react";
import type { VerificationType } from "./VerificationTabs";

interface FileUploaderProps {
  type: Exclude<VerificationType, "text">;
  file: File | null;
  onFileChange: (file: File) => void;
}

export default function FileUploader({
  type,
  file,
  onFileChange,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const config = {
    image: {
      label: "image",
      formats: "JPG, PNG, WEBP",
      accept: ".jpg,.jpeg,.png,.webp",
      limit: "10 MB",
    },
    video: {
      label: "video",
      formats: "MP4, MOV, WEBM",
      accept: ".mp4,.mov,.webm",
      limit: "100 MB",
    },
    document: {
      label: "document",
      formats: "PDF, DOCX, TXT",
      accept: ".pdf,.docx,.txt",
      limit: "10 MB",
    },
  }[type];

  const handleFile = (selectedFile: File) => {
    const maxSize =
      type === "video"
        ? 100 * 1024 * 1024
        : 10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      alert(`This file exceeds the ${config.limit} limit.`);
      return;
    }

    onFileChange(selectedFile);
  };

  if (file) {
    return (
      <div className="file-selected">
        <div className="file-symbol">
          <UploadCloud size={22} />
        </div>

        <div>
          <strong>{file.name}</strong>

          <small>
            {file.type || "Uploaded file"} ·{" "}
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </small>
        </div>
      </div>
    );
  }

  return (
    <div
      className="upload-box"
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();

        const droppedFile = event.dataTransfer.files[0];

        if (droppedFile) {
          handleFile(droppedFile);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        hidden
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];

          if (selectedFile) {
            handleFile(selectedFile);
          }
        }}
      />

      <span className="upload-icon">
        <UploadCloud size={22} />
      </span>

      <strong>Upload a {config.label}</strong>

      <p>
        Drag and drop your {config.label} here, or{" "}
        <u>browse from your device</u>
      </p>

      <small>
        Supported: {config.formats}
        <span>Maximum {config.limit}</span>
      </small>
    </div>
  );
}