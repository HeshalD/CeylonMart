const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
const router = require("./Routes/ProductRoutes");

const app = express();

//Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "backend/uploads"))); // serve images
app.use("/products", router);

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
