require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require("path");

dotenv.config();

const app = express();

// Core middleware
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use("/uploads", express.static(path.join(__dirname, "backend/uploads"))); 

// Routes
const userRoutes = require('./Routes/UserRoutes');
const authRoutes = require('./Routes/authRoutes');
const TestRoutes = require("./Routes/OrderRoutes"); 
const PaymentRoutes = require("./Routes/PaymentRoutes"); 
const ProductRouter = require("./Routes/ProductRoutes");
const supplierRoutes = require('./Routes/SupplierRoutes');
const AuthRoutes = require('./Routes/AuthRoutes');
const { verifyEmailTransport } = require('./utils/sendEmail');
const otpRoutes = require('./Routes/OtpRoutes');
const adminRoutes = require('./Routes/admin');
const supplierMsgRoutes = require('./Routes/supplier');
const driverRoutes = require("./Routes/DriverRoutes");

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use("/payments", PaymentRoutes);
app.use("/orders", TestRoutes);
app.use("/products", ProductRouter);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/supplierAuth', AuthRoutes);
app.use('/api', otpRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/supplier', supplierMsgRoutes);
app.use("/drivers", driverRoutes);

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


































