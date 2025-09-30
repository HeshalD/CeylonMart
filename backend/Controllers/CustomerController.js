const Customer = require("../Models/CustomerModel");

// Create customer
const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ isDeleted: { $ne: true } })
      .select('firstName lastName email phone address status totalOrders totalSpent createdAt')
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ 
      _id: req.params.id, 
      isDeleted: { $ne: true } 
    });
    
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Soft delete customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search and filter customers
const searchCustomers = async (req, res) => {
  try {
    const { name, district, status, email } = req.query;
    const query = { isDeleted: { $ne: true } };

    // Search by name (first name or last name)
    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ];
    }

    // Filter by district
    if (district) {
      query['address.district'] = district;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by email
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    const customers = await Customer.find(query)
      .select('firstName lastName email phone address status totalOrders totalSpent createdAt')
      .sort({ createdAt: -1 });
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get customers by district
const getCustomersByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    const customers = await Customer.find({ 
      isDeleted: { $ne: true },
      'address.district': district,
      status: 'active'
    })
    .select('firstName lastName email phone address totalOrders')
    .sort({ totalOrders: -1 });
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get customer statistics
const getCustomerStats = async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalOrders: { $sum: '$totalOrders' },
          totalRevenue: { $sum: '$totalSpent' }
        }
      }
    ]);

    const districtStats = await Customer.aggregate([
      { $match: { isDeleted: { $ne: true }, status: 'active' } },
      {
        $group: {
          _id: '$address.district',
          customerCount: { $sum: 1 },
          totalOrders: { $sum: '$totalOrders' }
        }
      },
      { $sort: { customerCount: -1 } }
    ]);

    res.json({
      overview: stats[0] || { totalCustomers: 0, activeCustomers: 0, totalOrders: 0, totalRevenue: 0 },
      byDistrict: districtStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomersByDistrict,
  getCustomerStats
};
