interface VerificationDetailsProps {
  type: string;
  sources: number;
  processingTime: string;
  verificationId: string;
}

export default function VerificationDetails({
  type,
  sources,
  processingTime,
  verificationId,
}: VerificationDetailsProps) {
  const details = [
    ["Verification Type", type],
    ["Analysis Method", "Evidence-based analysis"],
    ["Sources Checked", `${sources}`],
    ["Processing Time", processingTime],
    ["Verification ID", verificationId],
  ];

  return (
    <div className="verification-details">
      {details.map(([label, value]) => (
        <div className="detail-item" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}