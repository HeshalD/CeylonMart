import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LankaImage from '../lanka.jpg';

function AboutUsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-emerald-800 mb-6">
            About <span className="text-teal-600">CeylonMart</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
            Your trusted gateway to authentic Sri Lankan products, connecting the world with the finest treasures from the Pearl of the Indian Ocean.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded with a passion for sharing Sri Lanka's rich heritage, CeylonMart began as a small initiative to bring authentic Sri Lankan products to the global market. Our journey started when we realized that many people around the world were missing out on the incredible quality and unique flavors that Sri Lanka has to offer.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Today, we work directly with local farmers, artisans, and producers across Sri Lanka to ensure that every product we offer meets the highest standards of quality and authenticity. From the misty hills of Nuwara Eliya to the coastal regions of Galle, we source our products from the very heart of Sri Lanka.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:from-emerald-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Explore Our Products
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-white text-emerald-700 px-8 py-3 rounded-xl text-lg font-semibold border-2 border-emerald-600 hover:bg-emerald-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Back to Home
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={LankaImage} 
                alt="Sri Lanka - The Pearl of the Indian Ocean" 
                className="w-full h-96 object-cover object-bottom rounded-3xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>




      {/* Contact Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">Get in Touch</h2>
          <p className="text-xl text-gray-600 mb-8">
            Have questions about our products or services? We'd love to hear from you!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Email Us</h3>
              <p className="text-gray-600">info@ceylonmart.com</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Call Us</h3>
              <p className="text-gray-600">+94 11 234 5678</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Visit Us</h3>
              <p className="text-gray-600">Kadawatha, Sri Lanka</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-emerald-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Shopping Today
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutUsPage;
