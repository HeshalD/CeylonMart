const mongoose = require('mongoose');
const Product = require('./Models/ProductModel');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ceylonmart', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testStockUpdate() {
  try {
    console.log('Testing stock update functionality...');
    
    // Find a sample product
    const product = await Product.findOne({});
    if (!product) {
      console.log('No products found in database');
      return;
    }
    
    console.log('Found product:', product.productName);
    console.log('Current stock:', product.currentStock);
    
    // Decrease stock by 1
    const quantityToDecrease = 1;
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { $inc: { currentStock: -quantityToDecrease } },
      { new: true }
    );
    
    console.log('Updated product:', updatedProduct.productName);
    console.log('New stock:', updatedProduct.currentStock);
    console.log('Stock decreased by:', quantityToDecrease);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testStockUpdate();