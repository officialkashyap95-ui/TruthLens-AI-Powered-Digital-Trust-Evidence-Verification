const stats = [
  ["Total Verifications", "24"],
  ["Likely Authentic", "16"],
  ["Needs Review", "5"],
  ["Potentially Manipulated", "3"],
];

export default function VerificationOverview() {
  return (
    <section className="overview-section">
      <div className="section-intro compact">
        <div>
          <span className="section-overline">
            ACTIVITY
          </span>

          <h2>Verification overview</h2>
        </div>

        <small className="data-note">
          Demo data
        </small>
      </div>

      <div className="stats-grid">
        {stats.map(([label, value]) => (
          <div
            className="stat-card"
            key={label}
          >
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}