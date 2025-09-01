const Supplier = require('../Models/Supplier');

// Create Supplier
const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    return res.status(201).json(supplier);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    return res.status(400).json({ message: error.message });
  }
};

// Get all Suppliers
const getSuppliers = async (_req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    return res.status(200).json(suppliers);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch suppliers' });
  }
};

// Get single Supplier by ID
const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    return res.status(200).json(supplier);
  } catch (_error) {
    return res.status(400).json({ message: 'Invalid supplier id' });
  }
};

// Update Supplier by ID
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Supplier.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Supplier not found' });
    return res.status(200).json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    return res.status(400).json({ message: error.message });
  }
};

// Delete Supplier by ID
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Supplier.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Supplier not found' });
    return res.status(200).json({ message: 'Supplier deleted' });
  } catch (_error) {
    return res.status(400).json({ message: 'Invalid supplier id' });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};


