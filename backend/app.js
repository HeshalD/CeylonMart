const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const driverRoutes = require("./Routes/DriverRoutes");
const customerRoutes = require("./Routes/CustomerRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/drivers", driverRoutes);
app.use("/customers", customerRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "CeylonMart Backend API is running" });
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
