const express = require("express");
const { generateInventoryReport } = require("../Controllers/reportController");
const router = express.Router();

router.post("/generate", generateInventoryReport);

module.exports = router;
