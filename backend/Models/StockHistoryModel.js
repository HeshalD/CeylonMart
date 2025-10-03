const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productCode: { type: String, required: true },
  productImage: { type: String },
  category: { type: String, required: true },
  type: { type: String, required: true }, // sale, restock, expiry, etc.
  previousQuantity: { type: Number, required: true },
  quantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  reason: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StockHistory", stockHistorySchema);
