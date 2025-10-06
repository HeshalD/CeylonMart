import React, { useMemo, useState, useEffect } from "react";
import { PaymentsAPI, OrdersAPI, CustomersAPI } from "../api/client";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage({ customerId }) {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [cardType, setCardType] = useState(null);

  // Load cart data from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const cartData = JSON.parse(localStorage.getItem("cart")) || [];
        setItems(cartData);
        
        // Create a mock cart object for compatibility
        const mockCart = {
          _id: `cart_${Date.now()}`,
          customerId: customerId,
          items: cartData,
          totalAmount: cartData.reduce(
            (sum, item) => sum + Number(item.price) * Number(item.qty || item.quantity || 0),
            0
          )
        };
        setCart(mockCart);
      } catch (err) {
        console.error("Failed to load cart", err);
        setItems([]);
        setCart(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadCart();
  }, [customerId]);

  // Calculate total from items
  const total = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.qty || item.quantity || 0),
      0
    );
  }, [items]);

  const emailValid = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const customerNameValid = useMemo(() => customerName.trim().length > 0, [customerName]);
  const customerPhoneValid = useMemo(() => customerPhone.trim().length > 0, [customerPhone]);
  const customerAddressValid = useMemo(() => customerAddress.trim().length > 0, [customerAddress]);
  const districtValid = useMemo(() => district !== "", [district]);

  // Helpers for card formatting/validation
  const digitsOnly = (v) => (v || "").replace(/\D/g, "");
  const formatCardNum = (v) => digitsOnly(v).slice(0,16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const cardDigits = useMemo(() => digitsOnly(cardNumber), [cardNumber]);
  const cardNumberValid = cardDigits.length === 16;

  // Card type detection
  const detectCardType = (number) => {
    const firstDigit = number.charAt(0);
    if (firstDigit === '4') return 'visa';
    if (firstDigit === '5') return 'mastercard';
    return null;
  };

  // Update card type when card number changes
  useEffect(() => {
    const type = detectCardType(cardDigits);
    setCardType(type);
    console.log('Card digits:', cardDigits, 'Card type:', type); // Debug log
  }, [cardDigits]);
  const cvvValid = /^\d{3}$/.test(cvv);
  const minMonth = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    return `${y}-${m}`;
  }, []);
  const expiryValid = useMemo(() => {
    if (!expiry) return false;
    return expiry >= minMonth;
  }, [expiry, minMonth]);
  const cardFieldsValid = paymentMethod === "credit_card" || paymentMethod === "debit_card" ? (cardNumberValid && cvvValid && expiryValid && cardName.trim().length>0) : true;

  // Clear cart function for localStorage
  const clearCart = () => {
    localStorage.removeItem("cart");
    setItems([]);
    setCart(null);
  };

  const canPay = useMemo(() => !!cart && total > 0 && emailValid && customerNameValid && customerPhoneValid && customerAddressValid && districtValid && cardFieldsValid, [cart, total, emailValid, customerNameValid, customerPhoneValid, customerAddressValid, districtValid, cardFieldsValid]);

  const pay = async () => {
    if (!canPay) return;
    setStatus("submitting"); setError(null);
    try {
      // Create or get customer first
      console.log('Creating customer...');
      const customer = await CustomersAPI.createCustomer({
        name: customerName.trim(),
        email: email || "guest@example.com",
        phone: customerPhone.trim(),
        address: customerAddress.trim()
      });
      console.log('Customer created:', customer);
      
      // Transform cart items to match the order API format
      const orderItems = items.map((item, index) => {
        const originalQty = item.qty || item.quantity || 1;
        const originalPrice = item.price || 0;
        const calculatedTotal = Number(originalQty) * Number(originalPrice);
        
        const transformedItem = {
          productId: item._id || `507f1f77bcf86cd7994390${String(index + 10).padStart(2, '0')}`, // Generate valid ObjectId
          productName: item.productName || item.name || "Unknown Product",
          quantity: Math.max(0.1, Number(originalQty)), // Allow fractional quantities (0.1 minimum)
          price: Math.max(0, Number(originalPrice)) // Ensure float >= 0
        };
        
        console.log(`Item ${index + 1}:`, {
          original: { qty: originalQty, price: originalPrice, total: calculatedTotal },
          transformed: { quantity: transformedItem.quantity, price: transformedItem.price, total: transformedItem.quantity * transformedItem.price }
        });
        
        return transformedItem;
      });
      console.log('Order items:', orderItems);

      // Create order first
      console.log('Creating order...');
      const order = await OrdersAPI.createOrder({
        customerId: customer._id,
        items: orderItems,
        paymentMethod,
        district,
        email
      });
      console.log('Order created:', order);

      // Create payment with the order ID
      const payment = await PaymentsAPI.createPayment({
        orderId: order._id,
        customerId: customer._id,
        amount: total,
        paymentMethod,
        email,
        district,
        status: paymentMethod === "cash_on_delivery" ? "pending" : "successful"
      });
      console.log('Payment created:', payment);
      
      // Store order and payment IDs in localStorage for persistence
      localStorage.setItem('lastOrderId', order._id);
      localStorage.setItem('lastPaymentId', payment._id);
      
      // Clear the cart after successful payment
      try {
        await clearCart();
      } catch (clearError) {
        console.error('Error clearing cart:', clearError);
        // Continue with payment success even if cart clearing fails
      }
      
      setStatus("success");
      
      // Pass order and payment data to success page
      const paymentInfo = {
        orderId: order._id,
        customerId: customer._id,
        amount: total,
        paymentMethod,
        email,
        district,
        status: paymentMethod === "cash_on_delivery" ? "pending" : "successful"
      };
      
      navigate('/payment-success', { 
        state: { 
          orderData: order, 
          paymentData: paymentInfo 
        } 
      });
    } catch (e) {
      console.error('Payment error:', e);
      console.error('Error response:', e.response?.data);
      
      // Handle validation errors specifically
      if (e.response?.status === 400) {
        const errors = e.response?.data?.errors || [];
        const errorMessages = errors.map(err => `${err.param}: ${err.msg}`).join(', ');
        setError(`Validation failed: ${errorMessages}`);
      } else {
        setError(e.response?.data?.message || e.message || 'Payment failed');
      }
      setStatus("error");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart message
  if (!cart || items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Back Button */}
          <div className="flex justify-start mb-4">
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Cart
            </button>
          </div>
          
          <h1 className="text-4xl font-bold text-emerald-700 mb-2"> CHECKOUT </h1>
          <p className="text-gray-600">Complete your purchase</p>
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
            <p className="text-yellow-800 font-bold">Thank you for shopping with us! Please review your items and total before confirming your order.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Order ID:</span>
                  <span className="font-mono">{cart?._id || "-"}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-emerald-700">
                  <span>Total Amount:</span>
                  <span>Rs. {Number(total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Cart Items Display */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                Items in Cart
              </h3>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={item._id || index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{item.productName || item.name}</div>
                      <div className="text-sm text-gray-600">
                        Qty: {item.qty || item.quantity || 0} × Rs. {Number(item.price).toFixed(2)}
                      </div>
                    </div>
                    <div className="font-semibold text-emerald-700">
                      Rs. {((item.qty || item.quantity || 0) * Number(item.price)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Customer Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input 
                    className={`w-full border-2 rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${customerName && !customerNameValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'}`} 
                    placeholder="Enter your full name" 
                    value={customerName} 
                    onChange={e=>setCustomerName(e.target.value)} 
                  />
                  {!customerNameValid && customerName && <div className="text-red-600 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Please enter your full name
                  </div>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input 
                    className={`w-full border-2 rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${customerPhone && !customerPhoneValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'}`} 
                    placeholder="Enter your phone number" 
                    value={customerPhone} 
                    onChange={e=>setCustomerPhone(e.target.value)} 
                  />
                  {!customerPhoneValid && customerPhone && <div className="text-red-600 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Please enter your phone number
                  </div>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
                  <textarea 
                    className={`w-full border-2 rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${customerAddress && !customerAddressValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'}`} 
                    placeholder="Enter your complete delivery address" 
                    value={customerAddress} 
                    onChange={e=>setCustomerAddress(e.target.value)}
                    rows={3}
                  />
                  {!customerAddressValid && customerAddress && <div className="text-red-600 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Please enter your delivery address
                  </div>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email for receipt</label>
                  <input 
                    className={`w-full border-2 rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${email && !emailValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'}`} 
                    placeholder="you@example.com" 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                  />
                  {!emailValid && email && <div className="text-red-600 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Enter a valid email
                  </div>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery District</label>
                  <select 
                    className={`w-full border-2 rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${district && !districtValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                  >
                    <option value="">Select your district</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Gampaha">Gampaha</option>
                    <option value="Kaluthara">Kaluthara</option>
                  </select>
                  {!districtValid && district && <div className="text-red-600 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Please select a district
                  </div>}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">

            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "credit_card", label: "Credit Card", icon: "💳" },
                  { value: "debit_card", label: "Debit Card", icon: "💳" },
                  { value: "paypal", label: "PayPal", icon: "🅿️" },
                  { value: "cash_on_delivery", label: "Cash on Delivery", icon: "💰" }
                ].map(opt => (
                  <label key={opt.value} className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${paymentMethod === opt.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}>
                    <input 
                      type="radio" 
                      name="pm" 
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center w-full">
                      <span className="text-2xl mr-3">{opt.icon}</span>
                      <span className="font-medium text-gray-700">{opt.label}</span>
                    </div>
                    {paymentMethod === opt.value && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Card Details Form */}
            {(paymentMethod === "credit_card" || paymentMethod === "debit_card") && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Card Details
                </h3>
                <div className="space-y-4">
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <div className="relative">
                      <input 
                        className={`w-full border-2 rounded-xl px-4 py-3 pr-16 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${cardNumber && !cardNumberValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={e=>setCardNumber(formatCardNum(e.target.value))} 
                      />
                      {cardType && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                          {cardType === 'visa' && (
                            <div className="w-12 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-xs">VISA</span>
                            </div>
                          )}
                          {cardType === 'mastercard' && (
                            <div className="w-12 h-7 bg-red-600 rounded-lg flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-xs">MC</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {!cardNumberValid && cardNumber && <div className="text-red-600 text-sm mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Card number must be 16 digits
                    </div>}
                  </div>

                  {/* Card Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name on Card</label>
                    <input 
                      className={`w-full border-2 rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${cardName && cardName.trim().length===0 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'}`} 
                      placeholder="John Doe" 
                      value={cardName} 
                      onChange={e=>setCardName(e.target.value)} 
                    />
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input 
                        type="month" 
                        min={minMonth} 
                        className={`w-full border-2 rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${expiry && !expiryValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'}`} 
                        value={expiry} 
                        onChange={e=>setExpiry(e.target.value)} 
                      />
                      {!expiryValid && expiry && <div className="text-red-600 text-sm mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Expiry must be in the future
                      </div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input 
                        className={`w-full border-2 rounded-xl px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${cvv && !cvvValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
                        placeholder="123"
                        value={cvv}
                        onChange={e=>setCvv(digitsOnly(e.target.value).slice(0,3))} 
                      />
                      {!cvvValid && cvv && <div className="text-red-600 text-sm mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        CVV must be 3 digits
                      </div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">{String(error)}</span>
              </div>
            )}
            
            {status === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium">Payment submitted. Receipt will be emailed.</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                canPay && status !== "submitting"
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!canPay || status === "submitting"}
              onClick={pay}
            >
              {status === "submitting" ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Pay
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


