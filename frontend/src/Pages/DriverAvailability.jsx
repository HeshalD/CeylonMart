import React, { useEffect, useState } from 'react';
import client from '../api/client';
import Header from '../components/Header';

function DriverAvailability() {
  const [drivers, setDrivers] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchActive = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Fetch all active drivers
      const res = await client.get('/drivers');
      console.log('Fetched drivers:', res.data); // Debug log
      const allDrivers = res.data;
      
      // Filter for available drivers only
      const available = allDrivers.filter(driver => 
        driver.status === 'active' && driver.availability === 'available'
      );
      
      setDrivers(allDrivers);
      setAvailableDrivers(available);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActive(); }, []);

  // Filter available drivers based on district and search term
  const filteredAvailableDrivers = availableDrivers.filter(driver => {
    const matchesDistrict = !selectedDistrict || driver.district === selectedDistrict;
    const matchesSearch = !searchTerm || 
      driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (driver.district && driver.district.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesDistrict && matchesSearch;
  });



  const districts = [
    'Colombo', 'Gampaha', 'Kalutara'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20 p-8 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Available Drivers Search
                </h2>
                <p className="text-gray-600 mt-2">Search and manage available drivers by district</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">{filteredAvailableDrivers.length}</div>
                <div className="text-sm text-gray-600">Available Drivers</div>
              </div>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Drivers</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">All Districts</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button 
                  onClick={() => { setSelectedDistrict(''); setSearchTerm(''); }} 
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading available drivers...</p>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Available Drivers ({filteredAvailableDrivers.length})
              </h3>
              
              {filteredAvailableDrivers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🚛</div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No Available Drivers Found</h4>
                  <p className="text-gray-500">
                    {searchTerm || selectedDistrict 
                      ? 'Try adjusting your search criteria or filters.' 
                      : 'No drivers are currently available.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAvailableDrivers.map(driver => (
                    <div key={driver._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {driver.firstName} {driver.lastName}
                          </h4>
                          <p className="text-gray-600 text-sm">{driver.email}</p>
                          <p className="text-gray-500 text-sm">📞 {driver.phone}</p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Available
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Vehicle:</span>
                          <span className="font-medium">{(driver.vehicleType || '').toUpperCase()} - {driver.vehicleNumber}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Capacity:</span>
                          <span className="font-medium">{driver.capacity} kg/items</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">District:</span>
                          <span className="font-medium">📍 {driver.district || 'Not assigned'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">License:</span>
                          <span className="font-medium">{driver.licenseNumber}</span>
                        </div>
                      </div>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DriverAvailability;


