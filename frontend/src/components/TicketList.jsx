import { useEffect, useState } from "react";

function TicketList({ refreshTrigger }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, [refreshTrigger]);

  async function fetchTickets() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/tickets");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load tickets");
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return (
    <div className="card section">
      <p className="card-title">Recent Tickets ({tickets.length})</p>

      {loading && <p className="loading-text">loading...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && tickets.length === 0 && (
        <p className="ticket-list-empty">no tickets yet — submit one above</p>
      )}

      {!loading && tickets.length > 0 && (
        <div className="ticket-table-wrap">
          <table className="ticket-table">
            <colgroup>
              <col className="ticket-col-message" />
              <col className="ticket-col-category" />
              <col className="ticket-col-priority" />
              <col className="ticket-col-confidence" />
              <col className="ticket-col-time" />
            </colgroup>
            <thead>
              <tr>
                <th>Message</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Confidence</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id}>
                  <td>
                    <span className="ticket-message-preview" title={t.message}>
                      {t.message}
                    </span>
                  </td>
                  <td>
                    <span className="ticket-category">{t.category}</span>
                  </td>
                  <td>
                    <span className={`priority-badge priority-${t.priority}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span className="ticket-confidence mono">
                      {Math.round(t.confidence * 100)}%
                    </span>
                  </td>
                  <td>
                    <span className="ticket-time">{formatTime(t.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TicketList;
