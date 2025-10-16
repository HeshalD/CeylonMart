import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CeylonMartLogo from '../CMlogo.jpg';

const DriverDashboardHeader = ({ driver, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-emerald-600 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center p-1">
              <img 
                src={CeylonMartLogo} 
                alt="CeylonMart Logo" 
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                CeylonMart
              </h1>
              <p className="text-emerald-100 text-sm">
                Driver Dashboard
              </p>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/driver/dashboard')}
              className={`relative text-white hover:text-emerald-100 font-medium text-lg transition-colors duration-200 group ${
                location.pathname === '/driver/dashboard' ? 'text-emerald-100' : ''
              }`}
            >
              Driver Dashboard
              <span className={`absolute bottom-0 left-0 h-0.5 bg-emerald-100 transition-all duration-300 ${
                location.pathname === '/driver/dashboard' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </button>
            
            <button
              onClick={() => navigate('/deliveries/confirm')}
              className={`relative text-white hover:text-emerald-100 font-medium text-lg transition-colors duration-200 group ${
                location.pathname === '/deliveries/confirm' ? 'text-emerald-100' : ''
              }`}
            >
              Delivery Confirm
              <span className={`absolute bottom-0 left-0 h-0.5 bg-emerald-100 transition-all duration-300 ${
                location.pathname === '/deliveries/confirm' ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </button>
          </div>

          {/* Driver Info and Logout */}
          <div className="flex items-center space-x-4">
            {driver && (
              <div className="hidden md:flex items-center space-x-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-emerald-100 font-bold text-sm">
                    {driver.firstName?.[0]}{driver.lastName?.[0]}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {driver.firstName} {driver.lastName}
                  </p>
                  <p className="text-emerald-100 text-xs">
                    {driver.vehicleType?.toUpperCase()} • {driver.district}
                  </p>
                </div>
              </div>
            )}
            
            <button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DriverDashboardHeader;
