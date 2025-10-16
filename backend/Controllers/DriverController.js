const Driver = require("../Models/Driver");
const Order = require("../Models/OrderModel");

// Create driver
const createDriver = async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all drivers
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ isDeleted: { $ne: true } });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available drivers
const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ 
      isDeleted: { $ne: true },
      availability: 'available'
    });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver by ID
const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findOne({ 
      _id: req.params.id, 
      isDeleted: { $ne: true } 
    });
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update driver
const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update driver availability
const updateDriverAvailability = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { availability: req.body.availability },
      { new: true, runValidators: true }
    );
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update driver district
const updateDriverDistrict = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { district: req.body.district },
      { new: true, runValidators: true }
    );
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get driver history (assigned orders)
const getDriverHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    // Check if driver exists
    const driver = await Driver.findOne({ 
      _id: id, 
      isDeleted: { $ne: true } 
    });
    
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Build query for orders assigned to this driver
    let query = { 
      driverId: id, 
      isDeleted: { $ne: true } 
    };

    // Filter by status if provided
    if (status) {
      const statusArray = status.split(',');
      query.status = { $in: statusArray };
    }

    // Fetch orders with populated customer details
    const orders = await Order.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      deliveries: orders,
      driver: {
        id: driver._id,
        name: `${driver.firstName} ${driver.lastName}`,
        email: driver.email
      }
    });
  } catch (error) {
    console.error('Error fetching driver history:', error);
    res.status(500).json({ error: error.message });
  }
};

// Soft delete driver
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDriver,
  getDrivers,
  getAvailableDrivers,
  getDriverById,
  updateDriver,
  updateDriverAvailability,
  updateDriverDistrict,
  getDriverHistory,
  deleteDriver
};

