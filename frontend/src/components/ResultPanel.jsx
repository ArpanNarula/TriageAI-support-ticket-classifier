function ResultPanel({ result }) {
  if (!result) return null;

  const confidencePct = Math.round(result.confidence * 100);

  return (
    <div className="card result-panel section">
      <p className="card-title">Analysis Result</p>

      <div className="result-grid">
        <div className="result-field">
          <span className="result-label">Category</span>
          <span className="result-value highlight" style={{ textTransform: "capitalize" }}>
            {result.category}
          </span>
        </div>

        <div className="result-field">
          <span className="result-label">Priority</span>
          <span className={`priority-badge priority-${result.priority}`}>
            {result.priority}
          </span>
        </div>

        <div className="result-field" style={{ gridColumn: "1 / -1" }}>
          <span className="result-label">Matched Keywords</span>
          {result.keywords.length > 0 ? (
            <div className="tag-list">
              {result.keywords.map((kw) => (
                <span key={kw} className="tag">{kw}</span>
              ))}
            </div>
          ) : (
            <span className="result-value" style={{ color: "var(--text-muted)" }}>none</span>
          )}
        </div>

        <div className="result-field" style={{ gridColumn: "1 / -1" }}>
          <span className="result-label">Urgency Signals</span>
          {result.urgencySignals.length > 0 ? (
            <div className="tag-list">
              {result.urgencySignals.map((s) => (
                <span key={s} className="tag urgency">{s}</span>
              ))}
            </div>
          ) : (
            <span className="result-value" style={{ color: "var(--text-muted)" }}>none</span>
          )}
        </div>

        <div className="result-field" style={{ gridColumn: "1 / -1" }}>
          <span className="result-label">Confidence — {confidencePct}%</span>
          <div className="confidence-bar-wrap">
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {result.customRuleApplied && (
        <div className="custom-rule-badge">
          ⚡ Custom rule applied: "refund + not received" → Billing P1
        </div>
      )}
    </div>
  );
}

export default ResultPanel;
