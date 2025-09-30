import React from 'react';
import { useNavigate } from 'react-router-dom'; // ⬅️ Import for navigation

const MainHeader = () => {
  const navigate = useNavigate(); // ⬅️ Hook for navigation

  return (
    <header className="bg-white border-b-2 border-blue-200 shadow-lg">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">CeylonMart</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:block">
            <div className="flex items-baseline ml-10 space-x-4">
              {/* ✅ Update: Add navigation on click */}
              <button 
                onClick={() => navigate('/shop')}  
                className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 rounded-md hover:text-blue-600"
              >
                Home
              </button>

              <button 
                onClick={() => navigate('/inventory')}  
                className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
              >
                Manage Inventory
              </button>

              <button 
                onClick={() => navigate('/reports')}  
                className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 rounded-md hover:text-blue-600"
              >
                Reports
              </button>

              <button 
                onClick={() => navigate('/settings')}  
                className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 rounded-md hover:text-blue-600"
              >
                Settings
              </button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-gray-400 bg-gray-800 rounded-md hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
