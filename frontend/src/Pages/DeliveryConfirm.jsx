import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import SignaturePad from '../components/SignaturePad';

function DeliveryConfirm() {
  const navigate = useNavigate();
  const [deliveryId, setDeliveryId] = useState('');
  const [signature, setSignature] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [photo, setPhoto] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const nextErrors = {};
      if (!deliveryId || deliveryId.trim().length < 10) nextErrors.deliveryId = 'Enter a valid Delivery ID';
      if (!customerName.trim()) nextErrors.customerName = 'Customer name is required';
      if (!signature && !photo) nextErrors.proof = 'Provide signature or a photo as proof';
      setFormErrors(nextErrors);
      if (Object.keys(nextErrors).length) return;
      await client.post(`/drivers/delivery/${deliveryId}/confirm`, {
        signature,
        customerName,
        deliveryNotes,
        photo
      });
      // Redirect to delivery success page
      console.log('Delivery confirmed successfully, redirecting...');
      navigate('/delivery/success');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to confirm delivery');
    }
  };

  return (
    <div>
      <h2 className="page-title">Digital Delivery Confirmation</h2>
      <form onSubmit={submit} className="form-grid large">
        <div className="field">
          <input className={`input ${formErrors.deliveryId ? 'error' : ''}`} placeholder="Delivery ID" value={deliveryId} onChange={(e) => setDeliveryId(e.target.value)} required />
          {formErrors.deliveryId && <div className="error">{formErrors.deliveryId}</div>}
        </div>
        <div className="field">
          <input className={`input ${formErrors.customerName ? 'error' : ''}`} placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          {formErrors.customerName && <div className="error">{formErrors.customerName}</div>}
        </div>
        <textarea className="input" placeholder="Delivery Notes" value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} />
        <div>
          <div className="muted mb-2">Customer Signature</div>
          <SignaturePad onChange={setSignature} />
        </div>
        <div>
          <div className="muted mb-2">Optional Photo</div>
          <input type="file" accept="image/*" onChange={onPhotoChange} />
          {photo && <img alt="preview" src={photo} className="preview" />}
        </div>
        {formErrors.proof && <div className="error">{formErrors.proof}</div>}
        <button type="submit" className="btn-primary">Confirm Delivery</button>
        {message && <div className="alert-success">{message}</div>}
        {error && <div className="alert-error">{error}</div>}
      </form>
    </div>
  );
}

export default DeliveryConfirm;


