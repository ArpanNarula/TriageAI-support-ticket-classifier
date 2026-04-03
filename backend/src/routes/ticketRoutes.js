const express = require("express");
const router = express.Router();
const { analyzeAndSave, getAll } = require("../controllers/ticketController");

router.post("/analyze", analyzeAndSave);
router.get("/", getAll);

module.exports = router;
