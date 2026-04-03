# TriageAI - AI-Powered Support Ticket Triage System

A full-stack web application that accepts support tickets, classifies them using local keyword-based NLP (no external APIs), assigns priority levels, and stores results in MongoDB. Built with React, Node.js/Express, and Docker.

---

## Quick Start (Docker)
 
```bash
git clone <repo-url>
cd ticket-triage
docker-compose up --build
```

- Frontend → http://localhost:3000
- Backend → http://localhost:5000
- Health check → http://localhost:5000/health

All three services (mongo, backend, frontend) start together. MongoDB data persists in a Docker volume across restarts.

### Manual Setup (without Docker)

**Prerequisites:** Node 18+, MongoDB running locally

```bash
# Terminal 1 - Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Update `MONGO_URI` in `.env` if your MongoDB is on a different port.

---

## API Reference

### POST /tickets/analyze
```bash
curl -X POST http://localhost:5000/tickets/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "I cannot login, my account is locked"}'
```

Response:
```json
{
  "_id": "abc123",
  "message": "I cannot login, my account is locked",
  "category": "account",
  "priority": "P2",
  "keywords": ["login", "account"],
  "urgencySignals": [],
  "confidence": 0.15,
  "customRuleApplied": false,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### GET /tickets
Returns all tickets sorted by newest first.

### GET /health
Returns `{ status: "ok" }` - useful for verifying the backend is up.

---

## Project Structure

```
ticket-triage/
├── backend/
│   ├── src/
│   │   ├── analyzer/
│   │   │   ├── classifier.js        # keyword matching → category + matched keywords
│   │   │   ├── urgencyDetector.js   # scans for urgency signal words
│   │   │   ├── priorityEngine.js    # maps category + signals → P0/P1/P2/P3
│   │   │   └── index.js             # orchestrates all steps + applies custom rule
│   │   ├── controllers/
│   │   │   └── ticketController.js
│   │   ├── services/
│   │   │   └── ticketService.js     # DB operations
│   │   ├── models/
│   │   │   └── Ticket.js            # Mongoose schema
│   │   ├── routes/
│   │   │   └── ticketRoutes.js
│   │   └── app.js
│   ├── tests/
│   │   └── analyzer.test.js         # 15 unit tests, no external dependencies
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TicketForm.jsx       # textarea + submit, Ctrl+Enter shortcut
│   │   │   ├── ResultPanel.jsx      # category, priority, tags, confidence bar
│   │   │   └── TicketList.jsx       # live table of all submitted tickets
│   │   ├── App.jsx
│   │   └── App.css
│   ├── nginx.conf                   # proxies /tickets → backend in Docker
│   └── Dockerfile
└── docker-compose.yml
```

---

## How the NLP Works

No external AI APIs are used. Everything runs locally. Here is the pipeline:

### Step 1 - Keyword Classification

Each incoming message is lowercased and matched against a config-driven keyword map:

```js
const CATEGORY_KEYWORDS = {
  billing:   ["refund", "payment", "charged", "invoice", ...],
  technical: ["error", "bug", "crash", "not working", ...],
  account:   ["login", "password", "account", "signup", ...],
  feature:   ["feature", "request", "add", "improve", ...]
};
```

The category with the most keyword hits wins. Falls back to `"other"` if nothing matches.

### Step 2 - Urgency Detection

Separately scans for words like `urgent`, `asap`, `blocked`, `down`, `immediately`, `critical`. These are returned as `urgencySignals[]`.

### Step 3 - Priority Assignment

| Condition | Priority |
|---|---|
| "system down", "completely blocked", "outage" in message | P0 |
| 2+ urgency signals AND technical category | P0 |
| Any urgency signals present | P1 |
| Feature request category | P3 |
| Everything else | P2 |

### Step 4 - Confidence Score

```
confidence = min(1.0, (totalKeywordHits + urgencyHits) / totalPossible * 10)
```

This is a heuristic. Most tickets only hit 2-3 keywords, so the 10x scaling factor prevents the score from always sitting near zero. Caps at 1.0, rounded to 2 decimal places.

---

## Custom Rule

**Rule:** If a message contains both `"refund"` AND `"not received"` → force `category = billing`, `priority = P1`.

**Rationale:** A user who asked for a refund and hasn't received it is frustrated and has a time-sensitive financial issue. The normal classifier might deprioritize this if the message also mentions other things. Hard-coding this pattern ensures these tickets always get routed correctly.

**Where it lives:** `backend/src/analyzer/index.js`, after all standard analysis steps so it can override any result.

**Demo curl:**
```bash
curl -X POST http://localhost:5000/tickets/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "I requested a refund 2 weeks ago but it has not received yet"}'
```

Expected: `category: "billing"`, `priority: "P1"`, `customRuleApplied: true`

---

## Test Results

```bash
cd backend && npm test
```

```
--- Classification Tests ---
  ✓ billing ticket: detects 'payment' and 'invoice'
  ✓ technical ticket: detects 'bug' and 'crash'
  ✓ account ticket: detects 'login' and 'password'
  ✓ feature request: detects 'feature' and 'add'
  ✓ unknown ticket: falls back to 'other'

--- Priority Tests ---
  ✓ P0: system down scenario
  ✓ P1: urgent billing issue
  ✓ P2: normal technical issue
  ✓ P3: feature request always low priority

--- Custom Rule Tests ---
  ✓ custom rule: 'refund' + 'not received' → billing P1
  ✓ only 'refund' without 'not received' → normal flow

--- Urgency Detection Tests ---
  ✓ detects 'asap' as urgency signal
  ✓ no urgency signals in normal ticket

--- Confidence Score Tests ---
  ✓ confidence should be between 0 and 1
  ✓ empty message should throw an error

--- Results: 15 passed, 0 failed ---
```

Tests use a minimal `test()` / `expect()` wrapper written from scratch - no Jest, no Mocha, no external dependencies. This was intentional: keeps the test runner lightweight and easy to read in an interview context.

---

## Design Decisions

**Why keyword matching over a real ML model?**

For support tickets with well-defined categories, keyword matching gets you surprisingly far and has a major advantage: every classification decision is fully explainable. If a ticket is miscategorized, you can immediately see why and fix the keyword list. With an ML model you'd need labeled training data, retraining cycles, and you still can't always explain a prediction. The trade-off is it won't understand context - "I don't have a bug" would still score a hit on "bug". I documented this as a known limitation.

**Why is the analyzer in its own folder with no external imports?**

The NLP logic has zero dependency on Express or MongoDB. This was intentional - the analyzer folder can be required and tested without any server running. It also means the classification logic can be swapped out later (say, replaced with an ML model) without touching any routes or controllers.

**Why no Redux or Zustand?**

The app has two real pieces of shared state: the latest result and a refresh counter for the ticket list. Lifting these to `App.jsx` covers everything. Adding a state management library for two components would have been over-engineering.

**Why a refresh counter pattern instead of a refetch callback?**

`TicketForm` and `TicketList` are siblings - they can't talk to each other directly. Rather than building a shared context or passing a refetch function down and back up, I increment a counter in `App.jsx` after each submission. `TicketList` watches this counter in a `useEffect` dep array and refetches when it changes. Simple, no extra abstractions.

**Why nginx for the frontend Docker container?**

Vite's dev server is not for production. The frontend Dockerfile does a two-stage build: Vite compiles the React app, then nginx serves the static output. The nginx config also proxies `/tickets/*` to the backend container - this is why the two services can communicate inside Docker without CORS issues or hardcoded IPs.

---

## Known Limitations

- Keyword matching does not understand negation ("this is not a bug" still matches "bug")
- No pagination - large datasets will slow down the ticket list
- Confidence score is a heuristic scaling formula, not statistically meaningful
- Category tie-breaking is arbitrary when two categories have equal hits
- No authentication on any endpoint
- English-only

---

## Future Improvements

- Train a lightweight Naive Bayes classifier using the `natural` npm package on real ticket data - handles context and negation much better
- Pagination and filtering on the ticket list
- P0 Slack/webhook alert when a critical ticket comes in
- Basic API key auth for the POST endpoint
- Category + priority distribution charts on a dashboard view
