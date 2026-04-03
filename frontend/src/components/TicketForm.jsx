import { useState } from "react";

function TicketForm({ onResult, onError }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const MAX_CHARS = 1000;

  async function handleSubmit() {
    if (!message.trim()) return;

    setLoading(true);
    onError(null);

    try {
      const res = await fetch("/tickets/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      onResult(data);
      setMessage(""); // clear after submit
    } catch (err) {
      onError(err.message || "Something went wrong, try again");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    // Ctrl+Enter to submit - small QoL thing
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <div className="card ticket-form section">
      <p className="card-title">New Ticket</p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
        onKeyDown={handleKeyDown}
        placeholder="Describe your issue... (Ctrl+Enter to submit)"
        disabled={loading}
      />
      <div className="form-footer">
        <span className="char-count">
          {message.length} / {MAX_CHARS}
        </span>
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || !message.trim()}
        >
          {loading ? "Analyzing..." : "Analyze →"}
        </button>
      </div>
    </div>
  );
}

export default TicketForm;
