import React from 'react';
import { Link } from 'react-router-dom';
import DriverDashboardHeader from '../components/DriverDashboardHeader';

function DeliverySuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <DriverDashboardHeader driver={null} onLogout={() => {}} />
      
      <div className="flex items-center justify-center px-4 py-8" style={{ paddingTop: '120px' }}>
        <div className="max-w-lg w-full bg-white/80 backdrop-blur shadow-xl rounded-2xl p-8 text-center border border-emerald-200">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-700 mb-3">Delivery Confirmed Successfully!</h1>
          <p className="text-gray-700 mb-8 text-lg">
            Your delivery has been confirmed and recorded in the system. The customer has been notified.
          </p>
          
          {/* Success Details */}
          <div className="mb-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-center space-x-2 text-emerald-700 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Delivery Status Updated</span>
            </div>
            <p className="text-sm text-emerald-600">
              The order status has been changed to "delivered" in the system.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/driver/dashboard" 
              className="inline-block px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                <span>Back to Dashboard</span>
              </div>
            </Link>
            
            <Link 
              to="/deliveries/confirm" 
              className="inline-block px-6 py-3 rounded-full bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 font-semibold shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Confirm Another</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliverySuccess;
