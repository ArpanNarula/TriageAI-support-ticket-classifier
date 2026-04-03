const { createTicket, getAllTickets } = require("../services/ticketService");

async function analyzeAndSave(req, res) {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const ticket = await createTicket(message.trim());
    return res.status(201).json(ticket);
  } catch (err) {
    console.error("Error in analyzeAndSave:", err.message);
    return res.status(500).json({ error: err.message || "Something went wrong" });
  }
}

async function getAll(req, res) {
  try {
    const tickets = await getAllTickets();
    return res.status(200).json(tickets);
  } catch (err) {
    console.error("Error in getAll:", err.message);
    return res.status(500).json({ error: "Failed to fetch tickets" });
  }
}

module.exports = { analyzeAndSave, getAll };
