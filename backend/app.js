const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

const app = express();

// Core middleware
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Routes
const userRoutes = require('./Routes/UserRoutes');
const authRoutes = require('./Routes/authRoutes');
const TestRoutes = require("./Routes/OrderRoutes"); 
const PaymentRoutes = require("./Routes/PaymentRoutes"); 
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use("/payments", PaymentRoutes);
app.use("/orders", TestRoutes);

// Health check (optional)
app.get('/', (req, res) => {
  res.send('CeylonMart API is running');
});

// DB connect + start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { autoIndex: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    // Ensure indexes (e.g., unique email) are built
    const User = require('./Models/UserModel');
    await User.init();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });








