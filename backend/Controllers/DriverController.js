const mongoose = require("mongoose");
const Driver = require("../Models/DriverModel");
const Delivery = require("../Models/DeliveryModel");

// Create driver
const createDriver = async (req, res) => {
  try {
    console.log('Creating driver with data:', req.body);
    const driver = new Driver(req.body);
    await driver.save();
    console.log('Driver created successfully:', driver);
    res.status(201).json(driver);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all drivers
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ isDeleted: { $ne: true } })
      .select('firstName lastName email phone licenseNumber vehicleType vehicleNumber capacity status availability district totalDeliveries completedDeliveries rating createdAt')
      .sort({ createdAt: -1 });
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
    }).select('firstName lastName email phone licenseNumber vehicleType vehicleNumber capacity status availability district totalDeliveries completedDeliveries rating createdAt');
    
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
    console.log('Updating driver with data:', req.body);
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    console.log('Driver updated successfully:', driver);
    res.json(driver);
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(400).json({ error: error.message });
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

// Search and filter drivers
const searchDrivers = async (req, res) => {
  try {
    const { name, vehicleType, capacity, availability, status, district } = req.query;
    const query = { isDeleted: { $ne: true } };

    // Search by name (first name or last name)
    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ];
    }

    // Filter by vehicle type
    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    // Filter by capacity (greater than or equal to specified capacity)
    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    // Filter by availability
    if (availability) {
      query.availability = availability;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by district
    if (district) {
      query.district = district;
    }

    // Show all drivers (active, inactive, etc.) when searching by district
    // No default availability filter applied

    const drivers = await Driver.find(query)
      .select('firstName lastName email phone licenseNumber vehicleType vehicleNumber capacity status availability district totalDeliveries completedDeliveries rating createdAt')
      .sort({ district: 1, status: 1, rating: -1, totalDeliveries: -1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle driver availability
const toggleAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const { id } = req.params;

    if (!['available', 'unavailable', 'busy'].includes(availability)) {
      return res.status(400).json({ error: 'Invalid availability status' });
    }

    const driver = await Driver.findByIdAndUpdate(
      id,
      { availability },
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({ 
      message: 'Availability updated successfully', 
      driver: {
        id: driver._id,
        name: `${driver.firstName} ${driver.lastName}`,
        availability: driver.availability
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available drivers for assignment
const getAvailableDrivers = async (req, res) => {
  try {
    const { vehicleType, minCapacity, district } = req.query;
    const query = { 
      isDeleted: { $ne: true },
      status: 'active',
      availability: 'available'
    };

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    if (minCapacity) {
      query.capacity = { $gte: parseInt(minCapacity) };
    }

    if (district) {
      query.district = district;
    }

    const drivers = await Driver.find(query)
      .select('firstName lastName vehicleType capacity rating totalDeliveries district availability')
      .sort({ rating: -1, totalDeliveries: -1 });

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver delivery history
const getDriverHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const query = { 
      driverId: id,
      isDeleted: { $ne: true }
    };

    if (status) {
      query.status = status;
    }

    const deliveries = await Delivery.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .select('-deliveryConfirmation.signature -deliveryConfirmation.fingerprint')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Delivery.countDocuments(query);

    res.json({
      deliveries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status, location, notes } = req.body;

    const validStatuses = ['pending', 'picked', 'in_transit', 'delivered', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid delivery status' });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Add status to history
    delivery.statusHistory.push({
      status,
      location,
      notes,
      timestamp: new Date()
    });

    delivery.status = status;

    // Update timestamps based on status
    if (status === 'picked') {
      delivery.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    } else if (status === 'delivered') {
      delivery.actualDeliveryTime = new Date();
    }

    await delivery.save();

    // Update driver availability if delivered
    if (status === 'delivered') {
      await Driver.findByIdAndUpdate(delivery.driverId, {
        availability: 'available',
        currentDelivery: null,
        $inc: { completedDeliveries: 1 }
      });
    } else if (status === 'picked' || status === 'in_transit') {
      await Driver.findByIdAndUpdate(delivery.driverId, {
        availability: 'busy'
      });
    }

    res.json({ 
      message: 'Delivery status updated successfully',
      delivery: {
        id: delivery._id,
        status: delivery.status,
        updatedAt: delivery.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Digital delivery confirmation
const confirmDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { signature, fingerprint, photo, customerName, deliveryNotes } = req.body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (delivery.status !== 'in_transit') {
      return res.status(400).json({ error: 'Delivery must be in transit to confirm' });
    }

    // Update delivery confirmation
    delivery.deliveryConfirmation = {
      signature,
      fingerprint,
      photo,
      customerName,
      deliveryNotes,
      confirmedAt: new Date()
    };

    delivery.status = 'delivered';
    delivery.actualDeliveryTime = new Date();

    // Add to status history
    delivery.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      notes: 'Delivery confirmed with digital signature'
    });

    await delivery.save();

    // Update driver stats and availability
    await Driver.findByIdAndUpdate(delivery.driverId, {
      availability: 'available',
      currentDelivery: null,
      $inc: { completedDeliveries: 1 }
    });

    res.json({ 
      message: 'Delivery confirmed successfully',
      delivery: {
        id: delivery._id,
        status: delivery.status,
        confirmedAt: delivery.deliveryConfirmation.confirmedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get driver statistics
const getDriverStats = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findById(id).select('firstName lastName totalDeliveries completedDeliveries rating');
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const deliveryStats = await Delivery.aggregate([
      { $match: { driverId: driver._id, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      driver: {
        name: `${driver.firstName} ${driver.lastName}`,
        totalDeliveries: driver.totalDeliveries,
        completedDeliveries: driver.completedDeliveries,
        rating: driver.rating
      },
      deliveryBreakdown: deliveryStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update drivers without district information
const updateDriversWithoutDistrict = async (req, res) => {
  try {
    const { defaultDistrict = 'Colombo' } = req.body;

    // Validate district is from Western Province
    if (!['Colombo', 'Gampaha', 'Kalutara'].includes(defaultDistrict)) {
      return res.status(400).json({ error: 'District must be one of: Colombo, Gampaha, Kalutara' });
    }

    const result = await Driver.updateMany(
      {
        isDeleted: { $ne: true },
        $or: [
          { district: { $exists: false } },
          { district: null },
          { district: '' }
        ]
      },
      { $set: { district: defaultDistrict } }
    );

    res.json({
      message: `Updated ${result.modifiedCount} drivers with district information`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Debug endpoint to check driver data
const debugDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ isDeleted: { $ne: true } });
    res.json({
      message: `Found ${drivers.length} drivers`,
      drivers: drivers.map(d => ({
        id: d._id,
        name: `${d.firstName} ${d.lastName}`,
        district: d.district,
        status: d.status,
        availability: d.availability,
        hasDistrict: !!d.district
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create sample drivers for testing
const createSampleDrivers = async (req, res) => {
  try {
    const sampleDrivers = [
      {
        firstName: 'John',
        lastName: 'Perera',
        email: 'john.perera@email.com',
        phone: '0712345678',
        licenseNumber: '123456789',
        vehicleType: 'van',
        vehicleNumber: 'ABC-1234',
        capacity: 500,
        district: 'Colombo',
        status: 'active',
        availability: 'available'
      },
      {
        firstName: 'Sarah',
        lastName: 'Fernando',
        email: 'sarah.fernando@email.com',
        phone: '0712345679',
        licenseNumber: '123456790',
        vehicleType: 'car',
        vehicleNumber: 'DEF-5678',
        capacity: 200,
        district: 'Gampaha',
        status: 'active',
        availability: 'available'
      },
      {
        firstName: 'Kamal',
        lastName: 'Silva',
        email: 'kamal.silva@email.com',
        phone: '0712345680',
        licenseNumber: '123456791',
        vehicleType: 'bike',
        vehicleNumber: 'GHI-9012',
        capacity: 50,
        district: 'Kalutara',
        status: 'active',
        availability: 'busy'
      },
      {
        firstName: 'Nimal',
        lastName: 'Jayawardena',
        email: 'nimal.jayawardena@email.com',
        phone: '0712345681',
        licenseNumber: '123456792',
        vehicleType: 'lorry',
        vehicleNumber: 'JKL-3456',
        capacity: 1000,
        district: 'Colombo',
        status: 'active',
        availability: 'unavailable'
      }
    ];

    const createdDrivers = await Driver.insertMany(sampleDrivers);
    res.json({
      message: `Created ${createdDrivers.length} sample drivers`,
      drivers: createdDrivers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create sample deliveries for testing
const createSampleDeliveries = async (req, res) => {
  try {
    // First, get a driver to assign deliveries to
    const driver = await Driver.findOne({ status: 'active' });
    if (!driver) {
      return res.status(404).json({ error: 'No active drivers found. Create drivers first.' });
    }

    const sampleDeliveries = [
      {
        orderId: 'ORD-001',
        customerId: new mongoose.Types.ObjectId(), // You might want to create a real customer
        driverId: driver._id,
        status: 'in_transit',
        pickupAddress: {
          street: '123 Main Street',
          city: 'Colombo',
          postalCode: '00100',
          coordinates: { lat: 6.9271, lng: 79.8612 }
        },
        deliveryAddress: {
          street: '456 Oak Avenue',
          city: 'Colombo',
          postalCode: '00200',
          coordinates: { lat: 6.9147, lng: 79.8730 }
        },
        items: [
          { name: 'Laptop', quantity: 1, weight: 2.5, price: 150000 },
          { name: 'Mouse', quantity: 1, weight: 0.1, price: 5000 }
        ],
        totalWeight: 2.6,
        deliveryFee: 500,
        statusHistory: [
          { status: 'pending', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
          { status: 'picked', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
          { status: 'in_transit', timestamp: new Date() }
        ]
      },
      {
        orderId: 'ORD-002',
        customerId: new mongoose.Types.ObjectId(),
        driverId: driver._id,
        status: 'in_transit',
        pickupAddress: {
          street: '789 Pine Road',
          city: 'Gampaha',
          postalCode: '11000',
          coordinates: { lat: 7.0873, lng: 79.9985 }
        },
        deliveryAddress: {
          street: '321 Maple Lane',
          city: 'Gampaha',
          postalCode: '11010',
          coordinates: { lat: 7.0920, lng: 80.0000 }
        },
        items: [
          { name: 'Books', quantity: 5, weight: 3.0, price: 25000 },
          { name: 'Stationery', quantity: 10, weight: 0.5, price: 15000 }
        ],
        totalWeight: 3.5,
        deliveryFee: 300,
        statusHistory: [
          { status: 'pending', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
          { status: 'picked', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
          { status: 'in_transit', timestamp: new Date(Date.now() - 30 * 60 * 1000) }
        ]
      }
    ];

    const createdDeliveries = await Delivery.insertMany(sampleDeliveries);
    
    res.json({
      message: `Created ${createdDeliveries.length} sample deliveries`,
      deliveries: createdDeliveries.map(delivery => ({
        id: delivery._id,
        orderId: delivery.orderId,
        status: delivery.status,
        driverId: delivery.driverId
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  searchDrivers,
  toggleAvailability,
  getAvailableDrivers,
  getDriverHistory,
  updateDeliveryStatus,
  confirmDelivery,
  getDriverStats,
  updateDriversWithoutDistrict,
  createSampleDrivers,
  createSampleDeliveries,
  debugDrivers
};

