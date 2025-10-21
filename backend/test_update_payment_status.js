require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('./Models/PaymentModel');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser and useUnifiedTopology are deprecated in newer versions
});

async function testUpdatePaymentStatus() {
  try {
    console.log('Testing update payment status functionality...');
    
    // Find a sample payment with pending status
    const payment = await Payment.findOne({ status: 'pending' });
    if (!payment) {
      console.log('No pending payments found in database');
      return;
    }
    
    console.log('Found payment:', payment._id, 'Status:', payment.status);
    
    // Update status to successful
    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: payment._id, isDeleted: false },
      { $set: { status: 'successful' } },
      { new: true }
    );
    
    console.log('Updated payment:', updatedPayment._id);
    console.log('New status:', updatedPayment.status);
    console.log('Status updated successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testUpdatePaymentStatus();
