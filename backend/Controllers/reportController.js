const Product = require("../Models/ProductModel");
const Category = require("../Models/CategoryModel");

const generateInventoryReport = async (req, res) => {
  try {
    const { days } = req.body;

    // Basic data
    const totalProducts = await Product.countDocuments({ isActive: true });
    const categories = await Category.countDocuments({ isActive: true });

    // Total stock value
    const products = await Product.find({ isActive: true });
    const totalStockValue = products.reduce(
      (sum, p) => sum + (p.price || 0) * (p.quantity || 0),
      0
    );

    // Low stock items
    const lowStockItems = await Product.countDocuments({ quantity: { $lt: 5 }, isActive: true });

    // Expiring items
    const today = new Date();
    const nextDays = new Date();
    nextDays.setDate(today.getDate() + Number(days || 30));
    const expiringItems = await Product.countDocuments({
      expiryDate: { $gte: today, $lte: nextDays },
      isActive: true,
    });

    return res.status(200).json({
      id: Date.now().toString(),
      type: "inventory",
      title: "Inventory Summary Report",
      generatedAt: new Date(),
      data: {
        totalProducts,
        categories,
        totalStockValue,
        lowStockItems,
        expiringItems,
      },
    });
  } catch (err) {
    console.error("Error generating inventory report:", err);
    return res.status(500).json({ message: "Error generating report" });
  }
};

module.exports = { generateInventoryReport };
