// Priority levels:
// P0 = drop everything, system is down or completely blocked
// P1 = urgent, needs same-day attention
// P2 = normal issue, resolve within SLA
// P3 = low priority, feature requests etc.

const CRITICAL_WORDS = [
  "system down", "completely down", "not working at all",
  "blocked", "critical", "outage", "data loss", "can't access"
];

function getPriority(category, urgencySignals, message) {
  const lower = message.toLowerCase();

  // P0 check - some phrases are so bad they jump straight to P0
  for (const phrase of CRITICAL_WORDS) {
    if (lower.includes(phrase)) {
      return "P0";
    }
  }

  // If multiple urgency signals + technical issue → P0
  if (urgencySignals.length >= 2 && category === "technical") {
    return "P0";
  }

  // Any urgency signals → P1
  if (urgencySignals.length > 0) {
    return "P1";
  }

  // Feature requests are always low priority (P3)
  if (category === "feature") {
    return "P3";
  }

  // Everything else is P2 (normal)
  return "P2";
}

module.exports = { getPriority, CRITICAL_WORDS };
