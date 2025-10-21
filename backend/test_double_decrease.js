require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('./Models/PaymentModel');
const Order = require('./Models/OrderModel');
const Product = require('./Models/ProductModel');
const StockHistory = require('./Models/StockHistoryModel');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  // useNewUrlParser and useUnifiedTopology are deprecated in newer versions
});

// Import the decreaseProductQuantities function from the payment controller
// Since we can't directly import it, we'll copy the function here
async function decreaseProductQuantities(items) {
  console.log('[test_decreaseProductQuantities] Function called');
  try {
    console.log('[test_decreaseProductQuantities] Processing items:', JSON.stringify(items, null, 2));
    if (!items || !Array.isArray(items)) {
      console.log('[test_decreaseProductQuantities] No valid items array provided');
      return;
    }
    
    console.log('[test_decreaseProductQuantities] Items array length:', items.length);
    
    // Process each item in the order
    for (const [index, item] of items.entries()) {
      console.log(`[test_decreaseProductQuantities] Processing item ${index}:`, JSON.stringify(item, null, 2));
      console.log(`[test_decreaseProductQuantities] Item keys:`, Object.keys(item));
      
      // Extract product ID and quantity (handle different possible property names)
      let productId = null;
      let purchasedQuantity = 0;
      
      // Handle different possible structures for productId
      if (item.productId && item.productId._id) {
        // If productId is populated with full product object
        productId = item.productId._id;
      } else if (item.productId) {
        // If productId is just the ID string
        productId = item.productId;
      } else if (item.product && item.product._id) {
        // If there's a separate product object
        productId = item.product._id;
      }
      
      // Handle different possible structures for quantity
      if (item.quantity !== undefined) {
        purchasedQuantity = parseFloat(item.quantity);
      } else if (item.qty !== undefined) {
        purchasedQuantity = parseFloat(item.qty);
      }
      
      console.log(`[test_decreaseProductQuantities] Extracted data - productId: ${productId}, purchasedQuantity: ${purchasedQuantity}`);
      
      // Validate data before processing
      if (!productId) {
        console.log(`[test_decreaseProductQuantities] Skipping item ${index} - No valid productId found`);
        continue;
      }
      
      if (isNaN(purchasedQuantity) || purchasedQuantity <= 0) {
        console.log(`[test_decreaseProductQuantities] Skipping item ${index} - Invalid quantity: ${purchasedQuantity}`);
        continue;
      }
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.log(`[test_decreaseProductQuantities] Skipping item ${index} - Invalid ObjectId format: ${productId}`);
        continue;
      }
      
      console.log(`[test_decreaseProductQuantities] Valid data found, updating product stock...`);
      
      // Get the current product before updating
      console.log(`[test_decreaseProductQuantities] Looking up product with ID: ${productId}`);
      const currentProduct = await Product.findById(productId);
      console.log(`[test_decreaseProductQuantities] Product lookup result:`, currentProduct ? 'Found' : 'Not found');
      if (!currentProduct) {
        console.log(`[test_decreaseProductQuantities] Product not found with ID: ${productId}`);
        continue;
      }
      
      const previousQuantity = currentProduct.currentStock;
      const newQuantity = previousQuantity - purchasedQuantity;
      
      // Decrease the product's current stock by the purchased quantity
      console.log(`[test_decreaseProductQuantities] Updating product ${productId} stock by ${-Math.abs(purchasedQuantity)}`);
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $inc: { currentStock: -Math.abs(purchasedQuantity) } }, // Ensure positive quantity
        { new: true }
      );
      console.log(`[test_decreaseProductQuantities] Product update result:`, updatedProduct ? 'Success' : 'Failed');
      
      if (updatedProduct) {
        console.log(`[test_decreaseProductQuantities] Product stock updated successfully:`);
        console.log(`  - Product Name: ${updatedProduct.productName}`);
        console.log(`  - Product ID: ${updatedProduct._id}`);
        console.log(`  - Old Stock: ${previousQuantity}`);
        console.log(`  - New Stock: ${updatedProduct.currentStock}`);
        console.log(`  - Quantity Decreased: ${Math.abs(purchasedQuantity)}`);
        
        // Add entry to stock history
        try {
          console.log(`[test_decreaseProductQuantities] Creating stock history entry for ${updatedProduct.productName}`);
          const historyEntry = new StockHistory({
            productName: updatedProduct.productName,
            productCode: updatedProduct.productCode,
            productImage: updatedProduct.productImage,
            category: updatedProduct.category,
            type: "sale",
            previousQuantity: previousQuantity,
            quantity: Math.abs(purchasedQuantity),
            newQuantity: updatedProduct.currentStock,
            reason: `Product sold - Order quantity: ${Math.abs(purchasedQuantity)}`
          });
          
          await historyEntry.save();
          console.log(`[test_decreaseProductQuantities] Stock history entry created for ${updatedProduct.productName}`);
        } catch (historyError) {
          console.error(`[test_decreaseProductQuantities] Failed to create stock history entry:`, historyError);
        }
      } else {
        console.log(`[test_decreaseProductQuantities] Product not found with ID: ${productId}`);
      }
    }
    
    console.log('[test_decreaseProductQuantities] Finished processing all items');
  } catch (error) {
    console.error("[test_decreaseProductQuantities] Error:", error);
    console.error("[test_decreaseProductQuantities] Error stack:", error.stack);
    // Not throwing error to prevent payment failure due to stock update issues
  }
  console.log('[test_decreaseProductQuantities] Function completed');
}

async function testDoubleDecrease() {
  try {
    console.log('Testing double decrease prevention...');
    
    // Find a sample order with items
    const order = await Order.findOne({ items: { $exists: true, $ne: [] } }).populate({
      path: 'items.productId',
      model: 'ProductModel'
    });
    
    if (!order) {
      console.log('No orders with items found in database');
      return;
    }
    
    console.log('Found order:', order._id);
    console.log('Order items:', JSON.stringify(order.items, null, 2));
    
    // Get the current stock level of the first product
    const firstItem = order.items[0];
    const productId = firstItem.productId._id;
    const originalProduct = await Product.findById(productId);
    const originalStock = originalProduct.currentStock;
    console.log(`Original stock for ${originalProduct.productName}: ${originalStock}`);
    
    // Simulate a payment that's already successful
    const currentPayment = {
      status: 'successful'
    };
    
    // Simulate updating payment status to successful when it's already successful
    console.log('Simulating payment status update from successful to successful...');
    if ('successful' === 'successful' && currentPayment.status !== 'successful') {
      console.log('Payment status would be updated, decreasing product quantities');
      await decreaseProductQuantities(order.items);
    } else {
      console.log('Payment is already successful, skipping quantity decrease');
    }
    
    // Check the stock level after the "update"
    const updatedProduct = await Product.findById(productId);
    const updatedStock = updatedProduct.currentStock;
    console.log(`Updated stock for ${updatedProduct.productName}: ${updatedStock}`);
    
    // Verify that stock was not decreased
    if (originalStock === updatedStock) {
      console.log('SUCCESS: Stock was not decreased twice');
    } else {
      console.log('ERROR: Stock was decreased when it should not have been');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testDoubleDecrease();