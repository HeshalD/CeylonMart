const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

// Import Routes
const userRoutes = require('./Routes/UserRoutes'); // we will create this

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
})
.catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use('/api/users', userRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Grocery Management System API is running...');
});
