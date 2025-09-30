import React, { useEffect, useState } from 'react';
import client from '../api/client';

function DriverAvailability() {
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchActive = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const params = { status: 'active' };
      if (selectedDistrict) {
        params.district = selectedDistrict;
      }
      const res = await client.get('/drivers/search/filter', { params });
      console.log('Fetched drivers:', res.data); // Debug log
      setDrivers(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActive(); }, [selectedDistrict]);

  const updateAvailability = async (id, availability) => {
    try {
      await client.patch(`/drivers/${id}/availability`, { availability });
      await fetchActive();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update availability');
    }
  };

  const migrateDrivers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await client.post('/drivers/migrate/districts', { defaultDistrict: 'Colombo' });
      setSuccess(res.data.message);
      await fetchActive();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to migrate drivers');
    } finally {
      setLoading(false);
    }
  };

  const districts = [
    'Colombo', 'Gampaha', 'Kalutara'
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Driver Availability Management</h2>
          <p className="page-subtitle">Manage driver availability status and view drivers by district</p>
        </div>
      </div>
      
      {/* District Filter */}
      <div className="section">
        <div className="filter-controls">
          <div className="field">
            <label className="label">Filter by District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="input"
            >
              <option value="">All Districts</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
          <button onClick={() => setSelectedDistrict('')} className="btn-secondary">
            Clear Filter
          </button>
          <button onClick={migrateDrivers} className="btn-primary" disabled={loading}>
            {loading ? 'Migrating...' : 'Fix Missing Districts'}
          </button>
        </div>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}
      {success && <div className="alert-success mb-4">{success}</div>}
      {loading ? (
        <div className="loading">Loading drivers...</div>
      ) : (
        <div className="cards-grid">
        {drivers.map(d => (
          <div key={d._id} className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{d.firstName} {d.lastName}</div>
                <div className="muted">{(d.vehicleType || '').toUpperCase()} • {d.capacity || 0} cap</div>
                <div className="muted">📍 {d.district || 'No district assigned'}</div>
              </div>
              <div className="availability-info">
                <span className={`badge ${d.availability}`}>{d.availability}</span>
                <div className="district-badge">{d.district || 'No district'}</div>
              </div>
            </div>
            <div className="mt-3 btn-row">
              <button onClick={() => updateAvailability(d._id, 'available')} className="btn-secondary">Available</button>
              <button onClick={() => updateAvailability(d._id, 'busy')} className="btn-secondary">Busy</button>
              <button onClick={() => updateAvailability(d._id, 'unavailable')} className="btn-secondary">Unavailable</button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}

export default DriverAvailability;


