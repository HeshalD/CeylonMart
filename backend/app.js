const express = require('express');
const mongoose = require('mongoose');
const supplierRoutes = require('./Routes/SupplierRoutes');

const app = express();

app.use(express.json()); 

// Routes
app.use('/api/suppliers', supplierRoutes);

//Database Connection
mongoose.connect("mongodb+srv://kawya:12345@ceylonmart.evnlriy.mongodb.net/")

.then(() =>console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000);
})

.catch((err) => console.log((err)))
