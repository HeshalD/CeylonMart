import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TextPressure from '../components/TextPressure';
import RotatingText from '../components/RotatingText';
import GroceryPic1 from '../grocerypic4.jpg';
import GroceryPic2 from '../grocerypic2.jpg';
import GroceryPic3 from '../grocerypic3.jpg';

function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    { id: 1, image: GroceryPic1, alt: "Fresh Sri Lankan Groceries" },
    { id: 2, image: GroceryPic2, alt: "Premium Quality Products" },
    { id: 3, image: GroceryPic3, alt: "Authentic Sri Lankan Goods" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Header />
      
      {/* Hero Section with Background Slideshow */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Slideshow */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
            </div>
          ))}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="mb-6" style={{position: 'relative', height: '200px'}}>
            <TextPressure
              text="Welcome To CeylonMart"
              flex={true}
              alpha={false}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor="#ffffff"
              strokeColor="#10b981"
              minFontSize={48}
              className="drop-shadow-2xl"
              colorMap={{
                0: '#ffffff',   // W
                1: '#ffffff',   // e
                2: '#ffffff',   // l
                3: '#ffffff',   // c
                4: '#ffffff',   // o
                5: '#ffffff',   // m
                6: '#ffffff',   // e
                7: '#ffffff',   // (space)
                8: '#ffffff',   // T
                9: '#ffffff',   // o
                10: '#ffffff',  // (space)
                11: '#6ee7b7',  // C
                12: '#6ee7b7',  // e
                13: '#6ee7b7',  // y
                14: '#6ee7b7',  // l
                15: '#6ee7b7',  // o
                16: '#6ee7b7',  // n
                17: '#6ee7b7',  // M
                18: '#6ee7b7',  // a
                19: '#6ee7b7',  // r
                20: '#6ee7b7'   // t
              }}
            />
          </div>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-4xl mx-auto drop-shadow-lg">
            Discover authentic Sri Lankan products at your fingertips. 
            From premium Ceylon tea to exotic spices, we bring the best of Sri Lanka to your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-emerald-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Shop Now
            </button>
            <button
              onClick={() => navigate('/about')}
              className="bg-white/90 text-emerald-700 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-white hover:bg-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white scale-125 shadow-lg'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Rotating Text Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex justify-center items-center">
              <span className="text-3xl md:text-4xl font-bold text-emerald-600 mr-2">Smart</span>
              <div className="inline-block">
                <RotatingText
                  texts={['Shopping', 'Picks', 'Deals']}
                  mainClassName="px-4 sm:px-6 md:px-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white overflow-hidden py-2 sm:py-3 md:py-4 justify-center rounded-xl shadow-lg text-3xl md:text-4xl font-bold"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-1 sm:pb-2 md:pb-2"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
              </div>
            </div>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            From the lush hills of Sri Lanka to your doorstep, we bring you the finest selection of authentic products that capture the essence of the island nation.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-teal-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience Authentic Sri Lankan Products?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of satisfied customers who trust CeylonMart for their Sri Lankan product needs.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-white text-emerald-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Shopping Today
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
