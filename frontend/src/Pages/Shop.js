      <Header />

      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CeylonMart Shop</h1>
              <p className="text-gray-600">Fresh products at your fingertips</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rotating Product Descriptions */}
      <div className="py-3 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-medium text-white transition-opacity duration-1000">
              {descriptions[currentDescriptionIndex]}
            </p>
          </div>
        </div>
      </div>