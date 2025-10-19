require('dotenv').config();
const mongoose = require('mongoose');
const PaymentController = require('./Controllers/PaymentController');
const Payment = require('./Models/PaymentModel');
const Order = require('./Models/OrderModel');
const Product = require('./Models/ProductModel');

// MongoDB connection - use the same connection string as the app
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  autoIndex: true 
});

// Mock request and response objects for updatePaymentStatus
const createMockReq = (params, body) => ({
  params: params,
  body: body
});

const createMockRes = () => {
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.jsonData = data;
      console.log(`Response Status: ${this.statusCode}`);
      console.log('Response Data:', JSON.stringify(data, null, 2));
      return this;
    }
  };
  return res;
};

async function debugPaymentProcess() {
  try {
    console.log('=== Testing updatePaymentStatus Controller Function ===');
    
    // Find a pending COD payment
    const payment = await Payment.findOne({ status: "pending", paymentMethod: "cash_on_delivery" }).sort({ createdAt: -1 });
    if (!payment) {
      console.log('No pending COD payments found in database');
      return;
    }
    
    console.log('Found pending COD Payment:');
    console.log(JSON.stringify(payment, null, 2));
    
    // Get current product stocks
    const order = await Order.findById(payment.orderId);
    console.log('\nCurrent product stocks:');
    for (const [index, item] of order.items.entries()) {
      const product = await Product.findById(item.productId);
      if (product) {
        console.log(`  ${product.productName}: ${product.currentStock}`);
      }
    }
    
    // Test the updatePaymentStatus controller function
    console.log('\nTesting updatePaymentStatus controller function...');
    
    const req = createMockReq(
      { id: payment._id },
      { status: "successful" }
    );
    
    const res = createMockRes();
    
    // Call the controller function
    await PaymentController.updatePaymentStatus(req, res);
    
    console.log('Controller function executed');
    console.log('Response Status:', res.statusCode);
    
    // Check final product stocks
    console.log('\nFinal product stocks:');
    for (const [index, item] of order.items.entries()) {
      const product = await Product.findById(item.productId);
      if (product) {
        console.log(`  ${product.productName}: ${product.currentStock}`);
      }
    }
    
    console.log('\nTest completed!');
    
  } catch (error) {
    console.error('Debug Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugPaymentProcess();