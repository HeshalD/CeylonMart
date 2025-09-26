require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const TestRoutes = require("./Routes/OrderRoutes"); //Import Order Management routes
const PaymentRoutes = require("./Routes/PaymentRoutes"); //Import Payment Management routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes for order management
app.use("/orders", TestRoutes);

// Routes for payment management
app.use("/payments", PaymentRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "CeylonMart Customer Order Cart API is running" });
});

// Database connection
mongoose.connect(
  "mongodb+srv://kawya:12345@ceylonmart.evnlriy.mongodb.net/ceylonmart?retryWrites=true&w=majority"
)
.then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => console.log("Server running on port 5000"));
})
.catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
});
