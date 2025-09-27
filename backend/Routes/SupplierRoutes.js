const express = require('express');
const {
  registerSupplier,
  verifyOtp,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  updateSupplierStatus,
  approveSupplier,
  rejectSupplier,
  getCurrentSupplier,
  deleteSupplier,
} = require('../Controllers/SupplierController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/suppliers/register
router.post('/register', registerSupplier);

// POST /api/suppliers/verify-otp
router.post('/verify-otp', verifyOtp);

// GET /api/suppliers (admin only)
router.get('/', adminAuth, getSuppliers);

// GET /api/suppliers/me (get current supplier profile)
router.get('/me', auth, getCurrentSupplier);

// GET /api/suppliers/:id (admin only or self when approved/pending approval)
router.get('/:id', getSupplierById);

// PUT /api/suppliers/:id (admin only - approve/reject/profile edit)
router.put('/:id', adminAuth, updateSupplier);

// PUT /api/suppliers/:id/status (admin only)
router.put('/:id/status', adminAuth, updateSupplierStatus);

// PATCH /api/suppliers/:id/approve (admin only)
router.patch('/:id/approve', adminAuth, approveSupplier);

// PATCH /api/suppliers/:id/reject (admin only)
router.patch('/:id/reject', adminAuth, rejectSupplier);

// DELETE /api/suppliers/:id (admin only)
router.delete('/:id', adminAuth, deleteSupplier);

module.exports = router;


