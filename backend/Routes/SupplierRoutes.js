const express = require('express');
const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require('../Controllers/SupplierController');

const router = express.Router();

// POST /api/suppliers
router.post('/', createSupplier);

// GET /api/suppliers
router.get('/', getSuppliers);

// GET /api/suppliers/:id
router.get('/:id', getSupplierById);

// PUT /api/suppliers/:id
router.put('/:id', updateSupplier);

// DELETE /api/suppliers/:id
router.delete('/:id', deleteSupplier);

module.exports = router;


