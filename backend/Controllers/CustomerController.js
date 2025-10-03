const { validationResult } = require("express-validator");
const Customer = require("../Models/CustomerModel");

// Create a new customer
exports.createCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, phone, address } = req.body;
    
    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.json(existingCustomer);
    }
    
    const customer = await Customer.create({
      name: name || "Guest Customer",
      email: email || "guest@example.com",
      phone: phone || "",
      address: address || ""
    });
    
    res.status(201).json(customer);
  } catch (e) {
    console.error("[createCustomer] Error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.json(customer);
  } catch (e) {
    console.error("[getCustomerById] Error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};
