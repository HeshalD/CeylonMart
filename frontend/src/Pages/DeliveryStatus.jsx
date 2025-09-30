import React, { useState } from 'react';
import client from '../api/client';

function DeliveryStatus() {
  const [deliveryId, setDeliveryId] = useState('');
  const [status, setStatus] = useState('picked');
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [photo, setPhoto] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const nextErrors = {};
      if (!deliveryId || deliveryId.trim().length < 10) nextErrors.deliveryId = 'Enter a valid Delivery ID';
      setFormErrors(nextErrors);
      if (Object.keys(nextErrors).length) return;
      await client.patch(`/drivers/delivery/${deliveryId}/status`, {
        status,
        notes: [notes, reason].filter(Boolean).join(' • ')
      });
      setMessage('Status updated successfully');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update status');
    }
  };

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h2 className="page-title">Update Delivery Status</h2>
      <form onSubmit={submit} className="form-grid">
        <div className="field">
          <input className={`input ${formErrors.deliveryId ? 'error' : ''}`} placeholder="Delivery ID" value={deliveryId} onChange={(e) => setDeliveryId(e.target.value)} required hidden />
          {formErrors.deliveryId && <div className="error">{formErrors.deliveryId}</div>}
        </div>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {['picked','in_transit','delivered','failed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
          {['','Traffic delay','Customer not available','Address clarification','Weather condition','Security checkpoint'].map(r => <option key={r} value={r}>{r || 'Optional reason'}</option>)}
        </select>
        <textarea className="input" placeholder="Additional notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="field">
          <div className="muted">Optional status photo</div>
          <input type="file" accept="image/*" onChange={onPhotoChange} />
          {photo && <img alt="preview" src={photo} className="preview" />}
        </div>
        <button type="submit" className="btn-primary">Update</button>
        {message && <div className="alert-success">{message}</div>}
        {error && <div className="alert-error">{error}</div>}
      </form>
    </div>
  );
}

export default DeliveryStatus;


