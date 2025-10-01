import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CeylonMartLogo from '../CMlogo.jpg';
import CartIcon from '../cart4.svg';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin':
        return '/dashboard/admin';
      case 'customer':
        return '/dashboard/customer';
      case 'shop_owner':
        return '/dashboard/shop';
      case 'supplier_admin':
        return '/dashboard/supplier';
      case 'inventory_manager':
        return '/dashboard/inventory';
      case 'delivery_admin':
        return '/drivers/management';
      default:
        return '/dashboard/customer';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'customer':
        return 'Customer';
      case 'shop_owner':
        return 'Shop Owner';
      case 'supplier_admin':
        return 'Supplier';
      case 'inventory_manager':
        return 'Inventory Manager';
      case 'delivery_admin':
        return 'Delivery Manager';
      default:
        return 'User';
    }
  };

  const getProfileButtonColor = () => {
    const path = location.pathname;
    
    if (path.includes('/dashboard/admin')) {
      return 'from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800';
    } else if (path.includes('/dashboard/customer')) {
      return 'from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800';
    } else if (path.includes('/dashboard/shop')) {
      return 'from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800';
    } else if (path.includes('/dashboard/supplier')) {
      return 'from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800';
    } else if (path.includes('/dashboard/inventory')) {
      return 'from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800';
    } else if (path.includes('/dashboard/delivery')) {
      return 'from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800';
    } else {
      return 'from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'customer':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'shop_owner':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'supplier_admin':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'inventory_manager':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'delivery_admin':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-emerald-600 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center p-1">
              {/* CeylonMart Logo */}
              <img 
                src={CeylonMartLogo} 
                alt="CeylonMart Logo" 
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                CeylonMart
              </h1>
              <p className="text-emerald-100 font-medium">
                {user ? `Welcome back, ${user.name}!` : 'Smart shopping • Happy living'}
              </p>
            </div>
          </div>

          {/* Navigation Bar - Middle - Hidden on home page */}
          {location.pathname !== '/' && (
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/')}
                className={`relative text-white hover:text-emerald-100 font-medium text-lg transition-colors duration-200 group ${
                  location.pathname === '/' ? 'text-emerald-100' : ''
                }`}
              >
                Home
                <span className={`absolute bottom-0 left-0 h-0.5 bg-emerald-100 transition-all duration-300 ${
                  location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>
              <button
                onClick={() => navigate('/products')}
                className={`relative text-white hover:text-emerald-100 font-medium text-lg transition-colors duration-200 group ${
                  location.pathname === '/products' ? 'text-emerald-100' : ''
                }`}
              >
                Products
                <span className={`absolute bottom-0 left-0 h-0.5 bg-emerald-100 transition-all duration-300 ${
                  location.pathname === '/products' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>
              <button
                onClick={() => navigate('/about')}
                className={`relative text-white hover:text-emerald-100 font-medium text-lg transition-colors duration-200 group ${
                  location.pathname === '/about' ? 'text-emerald-100' : ''
                }`}
              >
                About Us
                <span className={`absolute bottom-0 left-0 h-0.5 bg-emerald-100 transition-all duration-300 ${
                  location.pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </button>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Cart Button - Hidden on home page, payment success and orders pages */}
            {location.pathname !== '/' && location.pathname !== '/payment-success' && location.pathname !== '/orders' && (
              <button
                onClick={() => navigate('/cart')}
                className="relative bg-gradient-to-r from-white/20 to-white/30 text-white p-1.5 rounded-lg hover:from-white/30 hover:to-white/40 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center border border-white/30 hover:border-white/50"
                title="View Cart"
              >
                <div className="relative w-full h-full flex items-center justify-center p-0.5">
                  <img 
                    src={CartIcon} 
                    alt="Cart" 
                    className="w-7 h-7 object-contain rounded-md"
                  />
                </div>
              </button>
            )}
            
            {user ? (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className={`bg-gradient-to-r ${getProfileButtonColor()} text-white px-6 py-2.5 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 border border-white/20`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/driver/dashboard')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Driver Login</span>
                </button>
                <button
                  onClick={() => navigate('/manager/login')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Manager Login</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-emerald-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="space-y-4">
              {/* Navigation Links for Mobile - Hidden on home page */}
              {location.pathname !== '/' && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      navigate('/');
                      setIsMenuOpen(false);
                    }}
                    className={`relative w-full text-left text-white hover:text-emerald-100 font-medium text-lg py-2 transition-colors duration-200 group ${
                      location.pathname === '/' ? 'text-emerald-100' : ''
                    }`}
                  >
                    Home
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-emerald-100 transition-all duration-300 ${
                      location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/products');
                      setIsMenuOpen(false);
                    }}
                    className={`relative w-full text-left text-white hover:text-emerald-100 font-medium text-lg py-2 transition-colors duration-200 group ${
                      location.pathname === '/products' ? 'text-emerald-100' : ''
                    }`}
                  >
                    Products
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-emerald-100 transition-all duration-300 ${
                      location.pathname === '/products' ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/about');
                      setIsMenuOpen(false);
                    }}
                    className={`relative w-full text-left text-white hover:text-emerald-100 font-medium text-lg py-2 transition-colors duration-200 group ${
                      location.pathname === '/about' ? 'text-emerald-100' : ''
                    }`}
                  >
                    About Us
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-emerald-100 transition-all duration-300 ${
                      location.pathname === '/about' ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  </button>
                </div>
              )}
              
              {/* Cart Button for Mobile - Hidden on home page, payment success and orders pages */}
              {location.pathname !== '/' && location.pathname !== '/payment-success' && location.pathname !== '/orders' && (
                <button
                  onClick={() => {
                    navigate('/cart');
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-white/20 to-white/30 text-white px-3 py-1.5 rounded-lg hover:from-white/30 hover:to-white/40 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 border border-white/30 hover:border-white/50"
                >
                  <div className="relative w-full h-full flex items-center justify-center p-0.5">
                    <img 
                      src={CartIcon} 
                      alt="Cart" 
                      className="w-6 h-6 object-contain rounded-md"
                    />
                  </div>
                  <span className="font-semibold">View Cart</span>
                </button>
              )}
              
              {user ? (
                <>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className={`w-full bg-gradient-to-r ${getProfileButtonColor()} text-white px-6 py-2.5 rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 border border-white/20`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/driver/dashboard');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span>Driver Login</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/manager/login');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Manager Login</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
