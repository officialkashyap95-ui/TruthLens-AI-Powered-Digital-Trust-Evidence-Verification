const steps = [
  {
    number: "01",
    title: "Analyze",
    copy:
      "Examine the submitted content and identify relevant signals.",
  },
  {
    number: "02",
    title: "Cross-check",
    copy:
      "Compare findings against available evidence and sources.",
  },
  {
    number: "03",
    title: "Explain",
    copy:
      "Present the result with confidence and supporting evidence.",
  },
];

export default function TrustMethod() {
  return (
    <section className="how-section">
      <div className="section-intro">
        <div>
          <span className="section-overline">
            THE METHOD
          </span>

          <h2>
            How TruthLens evaluates content
          </h2>

          <p>
            TruthLens combines analysis, evidence, and
            supporting signals to provide an explainable
            verification result.
          </p>
        </div>
      </div>

      <div className="method-grid">
        {steps.map((step, index) => (
          <div
            className="method-step"
            key={step.number}
          >
            <span className="method-number">
              {step.number}
            </span>

            <div>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </div>

            {index < 2 && (
              <span className="method-line" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}