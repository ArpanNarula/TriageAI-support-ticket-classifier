const { classify, CATEGORY_KEYWORDS } = require("./classifier");
const { detectUrgency, URGENCY_WORDS } = require("./urgencyDetector");
const { getPriority } = require("./priorityEngine");

const TOTAL_POSSIBLE = Object.values(CATEGORY_KEYWORDS).flat().length + URGENCY_WORDS.length;

function analyzeTicket(message) {
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  const lower = message.toLowerCase();
  const { category, keywords, totalMatches } = classify(message);
  const { signals: urgencySignals } = detectUrgency(message);
  const priority = getPriority(category, urgencySignals, message);

  if (lower.includes("refund") && lower.includes("not received")) {
    return {
      category: "billing",
      priority: "P1",
      keywords: [...new Set([...keywords, "refund", "not received"])],
      urgencySignals,
      confidence: calculateConfidence(totalMatches + urgencySignals.length),
      customRuleApplied: true
    };
  }

  const confidence = calculateConfidence(totalMatches + urgencySignals.length);

  return {
    category,
    priority,
    keywords,
    urgencySignals,
    confidence,
    customRuleApplied: false
  };
}

function calculateConfidence(totalMatches) {
  const raw = totalMatches / TOTAL_POSSIBLE;
  const confidence = Math.min(1, raw * 10);
  return Math.round(confidence * 100) / 100;
}

module.exports = { analyzeTicket };
