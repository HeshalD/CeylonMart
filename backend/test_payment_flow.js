require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('./Models/PaymentModel');
const Order = require('./Models/OrderModel');
const Product = require('./Models/ProductModel');

// MongoDB connection - use the same connection string as the app
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  autoIndex: true 
});

async function testPaymentFlow() {
  try {
    console.log('=== Testing Payment Flow ===');
    
    // Create a test order first
    console.log('Creating test order...');
    const testProduct = await Product.findOne({});
    if (!testProduct) {
      console.log('No products found');
      return;
    }
    
    console.log('Using product:', testProduct.productName, 'Stock:', testProduct.currentStock);
    
    const testOrder = await Order.create({
      customerId: "68f0c86eeb353924b9bc6f6c", // Sample customer ID
      items: [{
        productId: testProduct._id,
        productName: testProduct.productName,
        quantity: 1,
        price: testProduct.price
      }],
      totalAmount: testProduct.price,
      status: "pending",
      paymentMethod: "credit_card",
      district: "Colombo",
      email: "test@example.com"
    });
    
    console.log('Test order created:', testOrder._id);
    
    // Create a test payment
    console.log('Creating test payment...');
    const testPayment = await Payment.create({
      orderId: testOrder._id,
      customerId: "68f0c86eeb353924b9bc6f6c",
      amount: testProduct.price,
      paymentMethod: "credit_card",
      email: "test@example.com",
      district: "Colombo",
      status: "successful" // This should trigger stock decrease
    });
    
    console.log('Test payment created:', testPayment._id);
    console.log('Payment status:', testPayment.status);
    
    // Now simulate what happens in the createPayment function
    if (testPayment.status === "successful") {
      console.log('Payment is successful, checking order update...');
      
      // Populate the order with item details
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: testPayment.orderId, isDeleted: false },
        { $set: { status: testPayment.paymentMethod === "cash_on_delivery" ? "pending" : "confirmed" } },
        { new: true }
      ).populate({
        path: 'items.productId',
        model: 'ProductModel'
      });
      
      console.log('Order updated:', updatedOrder._id);
      console.log('Order status:', updatedOrder.status);
      console.log('Order items:', JSON.stringify(updatedOrder.items, null, 2));
      
      // Check if stock decrease should happen
      console.log('Checking if stock decrease should happen...');
      if (testPayment.status === "successful" && updatedOrder) {
        console.log('Stock decrease condition met, processing items...');
        
        // Process each item
        for (const [index, item] of updatedOrder.items.entries()) {
          console.log(`Processing item ${index}:`, JSON.stringify(item, null, 2));
          
          // Extract product ID
          let productId = null;
          if (item.productId && item.productId._id) {
            productId = item.productId._id;
          } else if (item.productId) {
            productId = item.productId;
          }
          
          const purchasedQuantity = parseFloat(item.quantity);
          
          console.log(`Product ID: ${productId}, Quantity: ${purchasedQuantity}`);
          
          if (productId && purchasedQuantity > 0) {
            console.log('Updating product stock...');
            
            // Get current product stock
            const beforeProduct = await Product.findById(productId);
            console.log('Stock before update:', beforeProduct.currentStock);
            
            // Decrease the product's current stock
            const updatedProduct = await Product.findByIdAndUpdate(
              productId,
              { $inc: { currentStock: -purchasedQuantity } },
              { new: true }
            );
            
            console.log('Stock after update:', updatedProduct.currentStock);
            console.log('Stock decreased by:', purchasedQuantity);
          }
        }
      }
    }
    
    // Clean up test data
    console.log('Cleaning up test data...');
    await Order.findByIdAndDelete(testOrder._id);
    await Payment.findByIdAndDelete(testPayment._id);
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testPaymentFlow();
