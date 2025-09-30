import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Navigation = () => {
  const { isAuthenticated, logout, isDriver, isManager } = useUser();

  const handleLogout = () => {
    logout();
    // Redirect to home page after logout
    window.location.href = '/';
  };

  return (
    <header className="px-6 py-4 shadow bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-gilroyHeavy text-emerald-600">CeylonMart</Link>
        
        <nav className="flex gap-4 text-sm items-center">
          {isAuthenticated ? (
            <>
              {/* Driver Navigation - Only show Driver Portal */}
              {isDriver && (
                <>
                  <Link className="hover:underline" to="/driver/dashboard">Driver Portal</Link>
                  <Link className="hover:underline" to="/deliveries/status">Delivery Status</Link>
                  <Link className="hover:underline" to="/deliveries/confirm">Confirm Delivery</Link>
                  <button 
                    onClick={handleLogout}
                    className="text-emerald-600 hover:text-emerald-800 hover:underline"
                  >
                    Logout
                  </button>
                </>
              )}
              
              {/* Manager Navigation - Show all management features */}
              {isManager && (
                <>
                  <Link className="hover:underline" to="/drivers/management">Driver Management</Link>
                  <Link className="hover:underline" to="/drivers/search">Search Drivers</Link>
                  <Link className="hover:underline" to="/drivers/availability">Driver Availability</Link>
                  <button 
                    onClick={handleLogout}
                    className="text-emerald-600 hover:text-emerald-800 hover:underline"
                  >
                    Logout
                  </button>
                </>
              )}
            </>
          ) : (
            /* Not logged in - Show login options */
            <>
              <Link className="hover:underline" to="/driver/dashboard">Driver Login</Link>
              <span className="text-gray-400">|</span>
              <Link className="hover:underline" to="/manager/login">Manager Login</Link>
            </>
          )}
          
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
