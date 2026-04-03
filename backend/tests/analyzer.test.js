// Simple test runner - no external libraries needed
// Run with: node tests/analyzer.test.js

const { analyzeTicket } = require("../src/analyzer");

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${description}`);
    console.log(`    → ${err.message}`);
    failed++;
  }
}

function expect(value) {
  return {
    toBe(expected) {
      if (value !== expected) {
        throw new Error(`Expected "${expected}", got "${value}"`);
      }
    },
    toContain(item) {
      if (!value.includes(item)) {
        throw new Error(`Expected array/string to contain "${item}"`);
      }
    },
    toBeGreaterThan(n) {
      if (value <= n) {
        throw new Error(`Expected ${value} to be greater than ${n}`);
      }
    },
    toBeLessThanOrEqual(n) {
      if (value > n) {
        throw new Error(`Expected ${value} to be <= ${n}`);
      }
    }
  };
}

// ==============================
// Classification tests
// ==============================
console.log("\n--- Classification Tests ---");

test("billing ticket: detects 'payment' and 'invoice'", () => {
  const result = analyzeTicket("I have a problem with my payment and the invoice is wrong");
  expect(result.category).toBe("billing");
});

test("technical ticket: detects 'bug' and 'crash'", () => {
  const result = analyzeTicket("The app crashes every time I open it, there's a bug");
  expect(result.category).toBe("technical");
});

test("account ticket: detects 'login' and 'password'", () => {
  const result = analyzeTicket("I forgot my password and can't login to my account");
  expect(result.category).toBe("account");
});

test("feature request: detects 'feature' and 'add'", () => {
  const result = analyzeTicket("Can you please add a dark mode feature to the app?");
  expect(result.category).toBe("feature");
});

test("unknown ticket: falls back to 'other'", () => {
  const result = analyzeTicket("Hello, I have a general question about your service");
  expect(result.category).toBe("other");
});

// ==============================
// Priority tests
// ==============================
console.log("\n--- Priority Tests ---");

test("P0: system down scenario", () => {
  const result = analyzeTicket("System is completely down, we cannot access anything. This is blocked.");
  expect(result.priority).toBe("P0");
});

test("P1: urgent billing issue", () => {
  const result = analyzeTicket("URGENT: I was charged twice on my invoice, need help immediately");
  expect(result.priority).toBe("P1");
});

test("P2: normal technical issue", () => {
  const result = analyzeTicket("There seems to be a bug on the settings page");
  expect(result.priority).toBe("P2");
});

test("P3: feature request always low priority", () => {
  const result = analyzeTicket("It would be nice to add an export feature");
  expect(result.priority).toBe("P3");
});

// ==============================
// Custom rule test
// ==============================
console.log("\n--- Custom Rule Tests ---");

test("custom rule: 'refund' + 'not received' → billing P1", () => {
  const result = analyzeTicket("I requested a refund 2 weeks ago but it has not received yet");
  expect(result.category).toBe("billing");
  expect(result.priority).toBe("P1");
  expect(result.customRuleApplied).toBe(true);
});

test("only 'refund' without 'not received' → normal flow", () => {
  const result = analyzeTicket("I want a refund for my subscription");
  expect(result.customRuleApplied).toBe(false);
});

// ==============================
// Urgency detection tests
// ==============================
console.log("\n--- Urgency Detection Tests ---");

test("detects 'asap' as urgency signal", () => {
  const result = analyzeTicket("Please fix this asap, we are blocked");
  expect(result.urgencySignals).toContain("asap");
});

test("no urgency signals in normal ticket", () => {
  const result = analyzeTicket("I have a small question about billing");
  expect(result.urgencySignals.length).toBe(0);
});

// ==============================
// Confidence score tests
// ==============================
console.log("\n--- Confidence Score Tests ---");

test("confidence should be between 0 and 1", () => {
  const result = analyzeTicket("There is a bug and crash and error in the system");
  expect(result.confidence).toBeGreaterThan(0);
  expect(result.confidence).toBeLessThanOrEqual(1);
});

test("empty message should throw an error", () => {
  let threw = false;
  try {
    analyzeTicket("");
  } catch {
    threw = true;
  }
  if (!threw) throw new Error("Expected an error but none was thrown");
});

// ==============================
// Results
// ==============================
console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
if (failed > 0) process.exit(1);
