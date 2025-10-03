const StockHistory = require("../Models/StockHistoryModel");

// Get all history
exports.getAllHistory = async (req, res) => {
  try {
    const history = await StockHistory.find().sort({ date: -1 });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching history", error });
  }
};

// Add new history entry
exports.addHistory = async (req, res) => {
  try {
    const newEntry = new StockHistory(req.body);
    await newEntry.save();
    res.json({ success: true, history: newEntry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving history", error });
  }
};
