const Driver = require("../Models/Driver");
const Order = require("../Models/OrderModel");
const puppeteer = require('puppeteer');

// Create driver
const createDriver = async (req, res) => {
  try {
    console.log('Creating driver with data:', req.body);
    const driver = new Driver(req.body);
    console.log('Driver model created:', driver);
    await driver.save();
    console.log('Driver saved successfully:', driver);
    res.status(201).json(driver);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all drivers
const getDrivers = async (req, res) => {
  try {
    console.log('Fetching all drivers...');
    const drivers = await Driver.find({ isDeleted: { $ne: true } });
    console.log('Found drivers:', drivers.length);
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
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

// Download drivers PDF
const downloadDriversPDF = async (req, res) => {
  try {
    // Get all drivers and sort alphabetically by first name
    const drivers = await Driver.find({ isDeleted: { $ne: true } })
      .sort({ firstName: 1, lastName: 1 });

    if (drivers.length === 0) {
      return res.status(404).json({ error: "No drivers found" });
    }

    // Generate HTML content for the PDF
    const htmlContent = generateDriversHTML(drivers);

    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '5mm',
        bottom: '10mm',
        left: '5mm'
      }
    });

    await browser.close();

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="drivers-report.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

// Helper function to generate HTML content
const generateDriversHTML = (drivers) => {
  const now = new Date();
  const currentDate = now.toLocaleDateString();
  const currentTime = now.toLocaleTimeString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Drivers Report - Ceylon Mart</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          color: #1f2937;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
        }
        .container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 30px;
          margin: 0 auto;
          max-width: 1200px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3);
        }
        .company-logo {
          font-size: 36px;
          font-weight: bold;
          margin: 0 0 10px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .company-tagline {
          font-size: 14px;
          opacity: 0.9;
          margin: 0 0 20px 0;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 300;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .summary {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3);
        }
        .summary h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 300;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        .summary-item {
          background: rgba(255,255,255,0.2);
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .summary-item strong {
          display: block;
          font-size: 24px;
          margin-bottom: 5px;
        }
        .table-container {
          display: flex;
          justify-content: center;
          margin: 20px 0;
          overflow-x: auto;
        }
        .drivers-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          table-layout: fixed;
        }
        .drivers-table th,
        .drivers-table td {
          padding: 8px 6px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
          font-size: 12px;
          word-wrap: break-word;
        }
        .drivers-table th {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 10px 6px;
        }
        .name-col { width: 15%; }
        .email-col { width: 20%; }
        .phone-col { width: 10%; }
        .license-col { width: 12%; }
        .vehicle-type-col { width: 10%; }
        .vehicle-number-col { width: 12%; }
        .capacity-col { width: 8%; }
        .district-col { width: 13%; }
        .drivers-table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .drivers-table tr:hover {
          background-color: #ecfdf5;
          transition: background-color 0.3s ease;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 14px;
          color: #6c757d;
          border-top: 2px solid #e9ecef;
          padding-top: 20px;
        }
        .footer p {
          margin: 0;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-logo">Ceylon Mart</div>
          <div class="company-tagline">Your Trusted Grocery Partner</div>
          <h1>Drivers Report</h1>
          <p>Generated on ${currentDate} at ${currentTime}</p>
        </div>

        <div class="summary">
          <h3>Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <strong>${drivers.length}</strong>
              Total Drivers
            </div>
            <div class="summary-item">
              <strong>${drivers.filter(d => d.availability === 'available').length}</strong>
              Available
            </div>
            <div class="summary-item">
              <strong>${drivers.filter(d => d.availability === 'busy').length}</strong>
              Busy
            </div>
            <div class="summary-item">
              <strong>${drivers.filter(d => d.availability === 'unavailable').length}</strong>
              Unavailable
            </div>
          </div>
        </div>

        <div class="table-container">
          <table class="drivers-table">
            <thead>
              <tr>
                <th class="name-col">Name</th>
                <th class="email-col">Email</th>
                <th class="phone-col">Phone</th>
                <th class="license-col">License</th>
                <th class="vehicle-type-col">Type</th>
                <th class="vehicle-number-col">Vehicle #</th>
                <th class="capacity-col">Capacity</th>
                <th class="district-col">District</th>
              </tr>
            </thead>
            <tbody>
              ${drivers.map(driver => `
                <tr>
                  <td class="name-col">${driver.firstName} ${driver.lastName}</td>
                  <td class="email-col">${driver.email}</td>
                  <td class="phone-col">${driver.phone}</td>
                  <td class="license-col">${driver.licenseNumber}</td>
                  <td class="vehicle-type-col">${driver.vehicleType.toUpperCase()}</td>
                  <td class="vehicle-number-col">${driver.vehicleNumber}</td>
                  <td class="capacity-col">${driver.capacity}</td>
                  <td class="district-col">${driver.district || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This report was generated automatically by CeylonMart Driver Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;
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
  deleteDriver,
  downloadDriversPDF
};

