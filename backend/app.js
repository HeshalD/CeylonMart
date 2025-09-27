require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const supplierRoutes = require('./Routes/SupplierRoutes');
const authRoutes = require('./Routes/AuthRoutes');
const { verifyEmailTransport } = require('./utils/sendEmail');
const otpRoutes = require('./Routes/OtpRoutes');
const adminRoutes = require('./Routes/admin');
const supplierMsgRoutes = require('./Routes/supplier');

const app = express();

// Enable CORS
app.use(cors());

app.use(express.json()); 

// Routes
app.use('/api/suppliers', supplierRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', otpRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/supplier', supplierMsgRoutes);

// Simple health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

//Database Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://kawya:12345@ceylonmart.evnlriy.mongodb.net/")

.then(() =>console.log("Connected to MongoDB"))
.then(() => {
    const port = process.env.PORT || 5000;
    verifyEmailTransport();
    app.listen(port, () => console.log(`API listening on port ${port}`));
})

.catch((err) => console.log((err)))
