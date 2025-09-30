import React, { useEffect, useState } from 'react';
import client from '../api/client';

function DriversSearch() {
  const [filters, setFilters] = useState({ name: '', vehicleType: '', capacity: '', district: '' });
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const fetchDrivers = async () => {
    setLoading(true);
    setError('');
    setFormErrors({});
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      if (filters.capacity && Number(filters.capacity) < 0) {
        setFormErrors({ capacity: 'Capacity cannot be negative' });
        setLoading(false);
        return;
      }
      const res = await client.get('/drivers/search/filter', { params });
      console.log('Search results:', res.data);
      setDrivers(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const vehicleOptions = ['', 'car', 'van', 'bike', 'lorry'];
  const districtOptions = ['', 'Colombo', 'Gampaha', 'Kalutara'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Search Drivers by District</h2>
          <p className="page-subtitle">Find drivers in specific districts for delivery assignments</p>
        </div>
      </div>

      <div className="filter-grid">
        <input name="name" value={filters.name} onChange={onChange} placeholder="Search by name" className="input" />
        <select name="district" value={filters.district} onChange={onChange} className="input">
          {districtOptions.map(v => <option key={v} value={v}>{v || 'Select District'}</option>)}
        </select>
        <select name="vehicleType" value={filters.vehicleType} onChange={onChange} className="input">
          {vehicleOptions.map(v => <option key={v} value={v}>{v || 'Vehicle Type'}</option>)}
        </select>
        <div className="field">
          <input name="capacity" value={filters.capacity} onChange={onChange} type="number" min="0" placeholder="Min Capacity" className={`input ${formErrors.capacity ? 'error' : ''}`} />
          {formErrors.capacity && <div className="error">{formErrors.capacity}</div>}
        </div>
        <button onClick={fetchDrivers} className="btn-primary">Search Drivers</button>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}
      {loading ? <div className="loading">Loading drivers...</div> : (
        <div>
          {drivers.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                Found {drivers.length} driver{drivers.length !== 1 ? 's' : ''} 
                {filters.district && ` in ${filters.district} district`}
              </p>
            </div>
          )}
          <div className="cards-grid">
            {drivers.map(d => (
            <div key={d._id} className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">{d.firstName} {d.lastName}</div>
                  <div className="muted">{(d.vehicleType || '').toUpperCase()} • {d.capacity || 0} cap</div>
                  <div className="muted">📍 {d.district || 'District not set'}</div>
                </div>
                <div className="availability-info">
                  <span className={`badge ${d.status}`}>{d.status}</span>
                  <div className="district-badge">{d.district || 'Not set'}</div>
                </div>
              </div>
              <div className="mt-3 muted">{d.email} • {d.phone}</div>
            </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DriversSearch;


