import { useState } from "react";
import TicketForm from "./components/TicketForm";
import ResultPanel from "./components/ResultPanel";
import TicketList from "./components/TicketList";

function App() {
  const [latestResult, setLatestResult] = useState(null);
  const [error, setError] = useState(null);
  // This counter bumps whenever a ticket is saved, which triggers TicketList to refetch
  const [refreshCount, setRefreshCount] = useState(0);

  function handleResult(data) {
    setLatestResult(data);
    setRefreshCount((c) => c + 1);
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1>TriageAI</h1>
        <span>support ticket classifier // local NLP</span>
      </header>

      {error && (
        <div className="error-msg">{error}</div>
      )}

      <TicketForm onResult={handleResult} onError={setError} />

      <ResultPanel result={latestResult} />

      <TicketList refreshTrigger={refreshCount} />
    </div>
  );
}

export default App;
