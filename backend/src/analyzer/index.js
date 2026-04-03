const { classify, CATEGORY_KEYWORDS } = require("./classifier");
const { detectUrgency, URGENCY_WORDS } = require("./urgencyDetector");
const { getPriority } = require("./priorityEngine");

// Total possible matches - used to calculate confidence
// Rough estimate: all keywords across all categories + urgency words
const TOTAL_POSSIBLE = Object.values(CATEGORY_KEYWORDS).flat().length + URGENCY_WORDS.length;

function analyzeTicket(message) {
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  const lower = message.toLowerCase();

  // Run all three analysis steps
  const { category, keywords, totalMatches } = classify(message);
  const { isUrgent, signals: urgencySignals } = detectUrgency(message);
  let priority = getPriority(category, urgencySignals, message);

  // ===== CUSTOM RULE =====
  // If someone mentions "refund" AND "not received", they're probably really frustrated
  // about a missing payment. Force it to Billing P1 regardless of what classifier said.
  if (lower.includes("refund") && lower.includes("not received")) {
    return {
      category: "billing",
      priority: "P1",
      keywords: [...new Set([...keywords, "refund", "not received"])],
      urgencySignals,
      confidence: calculateConfidence(totalMatches + urgencySignals.length),
      customRuleApplied: true // handy for debugging
    };
  }
  // ===== END CUSTOM RULE =====

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
  // Simple formula - more matches = more confident we are in the classification
  // Caps at 1.0 obviously
  const raw = totalMatches / TOTAL_POSSIBLE;
  const confidence = Math.min(1, raw * 10); // scaling up since most tickets only hit a few keywords
  return Math.round(confidence * 100) / 100; // round to 2 decimal places
}

module.exports = { analyzeTicket };
