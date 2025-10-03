const express = require("express");
const router = express.Router();
const { getAllHistory, addHistory } = require("../Controllers/StockHistoryController");

router.get("/", getAllHistory);
router.post("/", addHistory);

module.exports = router;
