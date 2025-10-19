const mongoose = require('mongoose');
const Order = require('./Models/OrderModel');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ceylonmart', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugOrder() {
  try {
    // Find a sample order
    const order = await Order.findOne({ isDeleted: false });
    console.log('Sample order:', JSON.stringify(order, null, 2));
    
    if (order && order.items) {
      console.log('Order items:', order.items);
      console.log('Items structure:');
      order.items.forEach((item, index) => {
        console.log(`Item ${index}:`, {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        });
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugOrder();
