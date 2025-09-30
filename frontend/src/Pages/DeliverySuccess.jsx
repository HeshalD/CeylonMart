import React from 'react';
import { Link } from 'react-router-dom';

function DeliverySuccess() {
  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">Delivery Confirmed Successfully!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your delivery has been confirmed and recorded in the system.
        </p>
      </div>
      
      <div className="space-y-4">
        <Link 
          to="/driver/dashboard" 
          className="btn-primary inline-block"
        >
          Back to Driver Dashboard
        </Link>
        <br />
        <Link 
          to="/deliveries/status" 
          className="btn-secondary inline-block"
        >
          Check Delivery Status
        </Link>
      </div>
    </div>
  );
}

export default DeliverySuccess;
