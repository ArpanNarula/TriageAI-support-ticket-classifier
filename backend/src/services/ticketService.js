const Ticket = require("../models/Ticket");
const { analyzeTicket } = require("../analyzer");

async function createTicket(message) {
  const analysis = analyzeTicket(message);

  const ticket = new Ticket({
    message,
    ...analysis
  });

  await ticket.save();
  return ticket;
}

async function getAllTickets() {
  const tickets = await Ticket.find().sort({ createdAt: -1 });
  return tickets;
}

module.exports = { createTicket, getAllTickets };
