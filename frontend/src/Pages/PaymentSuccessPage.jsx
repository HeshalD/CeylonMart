import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ReceiptPDF from "../components/ReceiptPDF";

export default function PaymentSuccessPage() {
  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Get data from location state if available
    if (location.state) {
      setOrderData(location.state.orderData);
      setPaymentData(location.state.paymentData);
    }
  }, [location.state]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 px-4">
      <div className="max-w-lg w-full bg-white/80 backdrop-blur shadow-xl rounded-2xl p-8 text-center border border-emerald-200">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-2">Payment Successful</h1>
        <p className="text-gray-700 mb-6">Thank you! Your payment has been received. A receipt has been sent to your email.</p>
        
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
  );
}


