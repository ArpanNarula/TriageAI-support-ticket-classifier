# TriageAI

TriageAI is a small full-stack app that analyzes support tickets using local heuristic logic, stores them in MongoDB, and shows the results in a simple UI.

This project was built for a full-stack assignment with the constraint that no external AI or LLM APIs could be used.

## Features

- Submit a support ticket from the frontend
- Classify tickets into Billing, Technical, Account, Feature Request, or Other
- Assign priority levels from P0 to P3
- Detect urgency terms and extract matched keywords
- Store analyzed tickets in MongoDB
- View previously analyzed tickets sorted latest first
- Run the full stack locally with Docker

## Tech Stack

- Frontend: React 18 + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Containers: Docker + docker-compose

## Quick Start (Docker)

```bash
docker-compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

If port `3000` or `5000` is already in use on your machine, an alternate local override file is also included:

```bash
docker compose -p triageai-local -f docker-compose.mac.yml up --build -d
```

That runs the frontend on `3000` and the backend on `5001`.

## Manual Setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Make sure MongoDB is running locally before starting the backend.

## API

### `POST /tickets/analyze`

Request body:

```json
{
  "message": "I can't login to my account"
}
```

Example response:

```json
{
  "_id": "abc123",
  "message": "I can't login to my account",
  "category": "account",
  "priority": "P2",
  "keywords": ["login", "account"],
  "urgencySignals": [],
  "confidence": 0.15,
  "customRuleApplied": false,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### `GET /tickets`

Returns all saved tickets sorted by newest first.

### `GET /health`

Returns a simple health response for the backend.

## Project Structure

```text
ticket-triage/
├── backend/
│   ├── src/
│   │   ├── analyzer/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   ├── tests/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Testing

```bash
cd backend
npm test
```

Current result: `15 passed, 0 failed`

The test suite covers:

- category classification
- priority assignment
- custom rule behavior
- urgency detection
- confidence score bounds
- empty input validation

## Custom Rule

A custom rule was added for refund-related tickets.

If a message contains both `refund` and `not received`, the ticket is forced to:

- Category: `billing`
- Priority: `P1`

Rationale: if a refund has not been received, it is usually a time-sensitive billing issue and should not be treated like a low-priority request.

## Reflection

I kept the backend split into controller, service, analyzer, model, and route layers so the ticket analysis logic could stay independent from Express and MongoDB. That made the analyzer easier to test in isolation and kept the request flow straightforward.

For the data model, I stored both the original message and the derived fields such as category, priority, keywords, urgency signals, confidence, and whether the custom rule was applied. That gives enough information for the UI and also makes it easier to inspect how a ticket was classified.

I used keyword-based classification instead of a trained model because the categories in this assignment are limited and the rules are easy to understand and adjust. The trade-off is that this approach does not understand context well, especially negation or more ambiguous wording.

With more time, I would improve the project by adding pagination/filtering to the ticket list, moving keyword rules into a cleaner config structure, adding authentication, and experimenting with a lightweight trained classifier for better accuracy.
