import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ReceiptPDF from "../components/ReceiptPDF";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { OrdersAPI, PaymentsAPI } from "../api/client";

export default function PaymentSuccessPage() {
  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  const fetchOrderAndPaymentData = async (orderId, paymentId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching order and payment data...', { orderId, paymentId });
      
      const [order, payment] = await Promise.all([
        OrdersAPI.getOrderById(orderId),
        PaymentsAPI.getPaymentById(paymentId)
      ]);
      
      console.log('Fetched order data:', order);
      console.log('Fetched payment data:', payment);
      
      setOrderData(order);
      setPaymentData(payment);
      
      // Clear localStorage after successful fetch
      localStorage.removeItem('lastOrderId');
      localStorage.removeItem('lastPaymentId');
    } catch (err) {
      console.error('Error fetching order/payment data:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update payment status to successful
  const updatePaymentStatusToSuccessful = async (paymentId) => {
    try {
      console.log('Updating payment status to successful for payment ID:', paymentId);
      // First get the current payment status
      const currentPayment = await PaymentsAPI.getPaymentById(paymentId);
      console.log('Current payment status:', currentPayment.status);
      
      // Only update if the payment is not already successful
      if (currentPayment.status !== 'successful') {
        const updatedPayment = await PaymentsAPI.updatePaymentStatus(paymentId, 'successful');
        console.log('Payment status updated:', updatedPayment);
        return updatedPayment;
      } else {
        console.log('Payment is already successful, skipping update');
        return currentPayment;
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      throw err;
    }
  };

  useEffect(() => {
    // Get data from location state if available
    if (location.state?.orderData && location.state?.paymentData) {
      console.log('Payment Success - Order Data from state:', location.state.orderData);
      console.log('Payment Success - Payment Data from state:', location.state.paymentData);
      setOrderData(location.state.orderData);
      setPaymentData(location.state.paymentData);
      
      // Update payment status to successful
      const paymentId = location.state.paymentData._id;
      if (paymentId) {
        // Only update if the payment is not already successful
        if (location.state.paymentData.status !== 'successful') {
          updatePaymentStatusToSuccessful(paymentId)
            .catch(err => {
              console.error('Failed to update payment status:', err);
              setError('Payment processed but status update failed.');
            });
        } else {
          console.log('Payment is already successful, skipping update');
        }
      }
    } else {
      // Try to fetch from localStorage and backend
      const orderId = localStorage.getItem('lastOrderId');
      const paymentId = localStorage.getItem('lastPaymentId');
      
      if (orderId && paymentId) {
        console.log('No location state, fetching from backend...', { orderId, paymentId });
        fetchOrderAndPaymentData(orderId, paymentId);
        
        // Update payment status to successful
        // First get the payment data to check current status
        PaymentsAPI.getPaymentById(paymentId)
          .then(payment => {
            // Only update if the payment is not already successful
            if (payment.status !== 'successful') {
              updatePaymentStatusToSuccessful(paymentId)
                .catch(err => {
                  console.error('Failed to update payment status:', err);
                  setError('Payment processed but status update failed.');
                });
            } else {
              console.log('Payment is already successful, skipping update');
            }
          })
          .catch(err => {
            console.error('Failed to fetch payment data:', err);
            setError('Payment processed but status update failed.');
          });
      } else {
        console.log('No order/payment data available');
        setError('No order data available. Please complete a purchase first.');
      }
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <Header />
        <div className="flex items-center justify-center px-4 py-8">
          <div className="max-w-lg w-full bg-white/80 backdrop-blur shadow-xl rounded-2xl p-8 text-center border border-emerald-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Order Details...</h2>
            <p className="text-gray-600">Please wait while we fetch your order information.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <Header />
        <div className="flex items-center justify-center px-4 py-8">
          <div className="max-w-lg w-full bg-white/80 backdrop-blur shadow-xl rounded-2xl p-8 text-center border border-red-200">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-700 mb-2">Error Loading Order</h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/" className="inline-block px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md">
                Back to Home
              </Link>
              <button 
                onClick={() => window.location.reload()} 
                className="inline-block px-6 py-3 rounded-full bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 font-semibold shadow-md"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <Header />
      <div className="flex items-center justify-center px-4 py-8">
        <div className="max-w-lg w-full bg-white/80 backdrop-blur shadow-xl rounded-2xl p-8 text-center border border-emerald-200">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-2">Payment Successful</h1>
          <p className="text-gray-700 mb-6">Thank you! Your payment has been received. A receipt has been sent to your email.</p>
          
          {/* Debug Info - Remove in production */}
          {orderData && (
            <div className="mb-4 p-3 bg-gray-100 rounded text-sm text-left">
              <p><strong>Order ID:</strong> {orderData._id || 'N/A'}</p>
              <p><strong>Total:</strong> Rs. {orderData.totalAmount || paymentData?.amount || 0}</p>
              <p><strong>District:</strong> {paymentData?.district || 'N/A'}</p>
              <p><strong>Items:</strong> {orderData.items?.length || 0}</p>
              {orderData.items && orderData.items.length > 0 && (
                <div className="mt-2">
                  <p><strong>Items:</strong></p>
                  {orderData.items.map((item, index) => (
                    <p key={index} className="ml-2 text-xs">
                      • {item.productName || item.name} (Qty: {item.quantity || item.qty}, Price: Rs. {item.price})
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* PDF Download Button */}
          <div className="mb-6">
            <ReceiptPDF 
              orderData={orderData} 
              paymentData={paymentData} 
              isVisible={true}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="inline-block px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md">
              Back to Home
            </Link>
            <Link to="/orders" className="inline-block px-6 py-3 rounded-full bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 font-semibold shadow-md">
              View Order History
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


