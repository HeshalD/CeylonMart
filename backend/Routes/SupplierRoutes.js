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
router.get('/', getSuppliers);

// GET /api/suppliers/me (get current supplier profile)
router.get('/me', auth, getCurrentSupplier);

// GET /api/suppliers/:id (admin only or self when approved/pending approval)
router.get('/:id', getSupplierById);

// PUT /api/suppliers/:id (admin only - approve/reject/profile edit)
router.put('/:id', updateSupplier);

// PUT /api/suppliers/:id/status (admin only)
router.put('/:id/status',  updateSupplierStatus);

// PATCH /api/suppliers/:id/approve (admin only)
router.patch('/:id/approve',  approveSupplier);

// PATCH /api/suppliers/:id/reject (admin only)
router.patch('/:id/reject', rejectSupplier);

// DELETE /api/suppliers/:id (admin only)
router.delete('/:id', deleteSupplier);

module.exports = router;


