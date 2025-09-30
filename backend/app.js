const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
const productRouter = require("./Routes/ProductRoutes");
const categoryRouter = require("./Routes/CategoryRoutes");
const reportRoutes = require("./Routes/reportRoutes");




const app = express();
const cors = require("cors");

//Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve images
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/api/reports", reportRoutes);

//Database Connection
mongoose.connect("mongodb+srv://kawya:12345@ceylonmart.evnlriy.mongodb.net/")
.then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => {
        console.log("Server is running on port 5000");
    });
})
.catch((err) => {
    console.log("MongoDB connection error:", err);
    process.exit(1);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});
