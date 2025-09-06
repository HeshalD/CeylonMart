const mongoose = require("mongoose");
const Driver = require("../Models/DriverModel");


//  Create Driver(s)

exports.createDriver = async (req, res) => {
  try {
    let result;

    if (Array.isArray(req.body)) {
      // Insert multiple drivers
      result = await Driver.insertMany(req.body, { ordered: true });
      return res.status(201).json({
        message: "Drivers created successfully",
        count: result.length,
        drivers: result,
      });
    } else {
      // Insert single driver
      result = await Driver.create(req.body);
      return res.status(201).json({
        message: "Driver created successfully",
        driver: result,
      });
    }
  } catch (e) {
    if (e.code === 11000) {
      // Duplicate key error 
      return res
        .status(409)
        .json({ message: "Duplicate email or licenseNumber" });
    }
    res.status(500).json({ message: "Server error", error: e.message });
  }
};


//  Get all drivers

exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ isDeleted: false });
    res.json(drivers);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};


//  Get driver by ID

exports.getDriverById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid driver ID" });
  }

  try {
    const driver = await Driver.findOne({ _id: id, isDeleted: false });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json(driver);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};


//  Update driver

exports.updateDriver = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid driver ID" });
  }

  try {
    const driver = await Driver.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json({
      message: "Driver updated successfully",
      driver,
    });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

//  Delete driver

exports.deleteDriver = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid driver ID" });
  }

  try {
    const driver = await Driver.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, status: "inactive" } },
      { new: true }
    );
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json({
      message: "Driver deleted successfully",
      driver,
    });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: e.message });
  }
};
