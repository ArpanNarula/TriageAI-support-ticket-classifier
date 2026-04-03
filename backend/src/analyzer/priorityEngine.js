const CRITICAL_WORDS = [
  "system down", "completely down", "not working at all",
  "blocked", "critical", "outage", "data loss", "can't access"
];

function getPriority(category, urgencySignals, message) {
  const lower = message.toLowerCase();

  for (const phrase of CRITICAL_WORDS) {
    if (lower.includes(phrase)) {
      return "P0";
    }
  }

  if (urgencySignals.length >= 2 && category === "technical") {
    return "P0";
  }

  if (urgencySignals.length > 0) {
    return "P1";
  }

  if (category === "feature") {
    return "P3";
  }

  return "P2";
}

module.exports = { getPriority, CRITICAL_WORDS };
