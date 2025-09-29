import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CeylonMartLogo from '../../ceylonlogo2.jpeg';
import CartIcon from '../../cart4.png';

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


  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 to-teal-700 shadow-xl">
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

          {/* Navigation Bar - Middle - Hidden for Admin, Delivery, and Supplier Dashboards */}
          {!location.pathname.includes('/dashboard/admin') && !location.pathname.includes('/dashboard/delivery') && !location.pathname.includes('/dashboard/supplier') && (
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
            {/* Cart Button - Hidden on Payment Success, Orders Pages, and Management Dashboards */}
            {location.pathname !== '/payment-success' && location.pathname !== '/orders' && !location.pathname.includes('/dashboard/admin') && !location.pathname.includes('/dashboard/delivery') && !location.pathname.includes('/dashboard/supplier') && (
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
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Sign Up</span>
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
              {/* Navigation Links for Mobile - Hidden for Admin, Delivery, and Supplier Dashboards */}
              {!location.pathname.includes('/dashboard/admin') && !location.pathname.includes('/dashboard/delivery') && !location.pathname.includes('/dashboard/supplier') && (
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
              
              {/* Cart Button for Mobile - Hidden on Payment Success, Orders Pages, and Management Dashboards */}
              {location.pathname !== '/payment-success' && location.pathname !== '/orders' && !location.pathname.includes('/dashboard/admin') && !location.pathname.includes('/dashboard/delivery') && !location.pathname.includes('/dashboard/supplier') && (
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
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Sign Up</span>
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
