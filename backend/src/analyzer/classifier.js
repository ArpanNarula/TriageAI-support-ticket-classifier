// Category keyword config - adding more words makes this more accurate
// Keeping this as a separate config so it's easy to update later
const CATEGORY_KEYWORDS = {
  billing: [
    "refund", "payment", "charged", "invoice", "billing",
    "subscription", "price", "cost", "fee", "money", "paid", "charge"
  ],
  technical: [
    "error", "bug", "crash", "not working", "broken", "issue",
    "500", "404", "failed", "fail", "slow", "timeout", "loading",
    "down", "outage", "fix"
  ],
  account: [
    "login", "password", "account", "signup", "sign in",
    "register", "email", "username", "profile", "access", "locked"
  ],
  feature: [
    "feature", "request", "add", "improve", "enhancement",
    "suggestion", "would be nice", "can you add", "please add",
    "wish", "want", "idea"
  ]
};

// Returns the best category + how many keyword matches we got
function classify(message) {
  const lower = message.toLowerCase();
  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let hits = 0;
    const matched = [];

    for (const kw of keywords) {
      if (lower.includes(kw)) {
        hits++;
        matched.push(kw);
      }
    }

    scores[category] = { hits, matched };
  }

  // Find the category with the most hits
  let bestCategory = "other";
  let maxHits = 0;
  let allMatched = [];

  for (const [cat, data] of Object.entries(scores)) {
    if (data.hits > maxHits) {
      maxHits = data.hits;
      bestCategory = cat;
    }
    allMatched = allMatched.concat(data.matched);
  }

  // Remove duplicates in keywords list
  const uniqueKeywords = [...new Set(allMatched)];

  return {
    category: bestCategory,
    keywords: uniqueKeywords,
    totalMatches: maxHits,
    categoryScores: scores // keeping this for debugging if needed
  };
}

module.exports = { classify, CATEGORY_KEYWORDS };
