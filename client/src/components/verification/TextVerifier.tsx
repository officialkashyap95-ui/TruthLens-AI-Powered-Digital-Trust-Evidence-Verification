interface TextVerifierProps {
  text: string;
  source: string;
  onTextChange: (value: string) => void;
  onSourceChange: (value: string) => void;
}

export default function TextVerifier({
  text,
  source,
  onTextChange,
  onSourceChange,
}: TextVerifierProps) {
  return (
    <>
      <label htmlFor="content">Enter Content to Verify</label>

      <textarea
        id="content"
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        placeholder="Paste the claim, statement, article excerpt, or text you want TruthLens to analyze..."
      />

      <div className="field-meta">
        <span>{text.length.toLocaleString()} characters</span>
        <span>Plain text analysis</span>
      </div>

      <label htmlFor="source">
        Source URL <small>(optional)</small>
      </label>

      <input
        id="source"
        type="url"
        value={source}
        onChange={(event) => onSourceChange(event.target.value)}
        placeholder="https://example.com/source"
      />
    </>
  );
}