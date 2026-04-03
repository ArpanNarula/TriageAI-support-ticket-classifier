// Words that suggest something is time-sensitive or blocking the user
const URGENCY_WORDS = [
  "urgent", "urgently", "asap", "immediately", "critical",
  "blocked", "blocking", "down", "outage", "emergency",
  "right now", "can't work", "cannot work", "losing money",
  "deadline", "help", "please help", "as soon as possible"
];

function detectUrgency(message) {
  const lower = message.toLowerCase();
  const signals = [];

  for (const word of URGENCY_WORDS) {
    if (lower.includes(word)) {
      signals.push(word);
    }
  }

  return {
    isUrgent: signals.length > 0,
    signals
  };
}

module.exports = { detectUrgency, URGENCY_WORDS };
