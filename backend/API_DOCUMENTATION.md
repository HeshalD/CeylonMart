# Driver Management API Documentation

## Overview
This API provides comprehensive driver management functionality including search, availability management, delivery tracking, and digital confirmation features.

## Models

### Driver Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  phone: Number (required),
  licenseNumber: Number (required, unique),
  vehicleType: String (enum: ["car", "van", "bike", "lorry"], required),
  vehicleNumber: String (required),
  capacity: Number (required, min: 1), // Vehicle capacity in kg
  status: String (enum: ["active", "inactive", "on_leave"], default: "active"),
  availability: String (enum: ["available", "unavailable", "busy"], default: "available"),
  currentDelivery: ObjectId (ref: "Delivery"),
  totalDeliveries: Number (default: 0),
  completedDeliveries: Number (default: 0),
  rating: Number (default: 0, min: 0, max: 5),
  isDeleted: Boolean (default: false)
}
```

### Delivery Model
```javascript
{
  orderId: String (required),
  customerId: ObjectId (ref: "Customer", required),
  driverId: ObjectId (ref: "Driver", required),
  status: String (enum: ["pending", "picked", "in_transit", "delivered", "failed"], default: "pending"),
  pickupAddress: Object (required),
  deliveryAddress: Object (required),
  items: Array (required),
  totalWeight: Number (required),
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  deliveryConfirmation: Object,
  statusHistory: Array,
  customerRating: Number (min: 1, max: 5),
  customerFeedback: String,
  deliveryFee: Number (required),
  isDeleted: Boolean (default: false)
}
```

## API Endpoints

### 1. Search & Filter Drivers
**GET** `/api/drivers/search/filter`

Query Parameters:
- `name` - Search by driver name (first or last name)
- `vehicleType` - Filter by vehicle type (car, van, bike, lorry)
- `capacity` - Filter by minimum capacity
- `availability` - Filter by availability status
- `status` - Filter by driver status

Example:
```
GET /api/drivers/search/filter?name=john&vehicleType=van&capacity=50&availability=available
```

### 2. Driver Availability Toggle
**PATCH** `/api/drivers/:id/availability`

Request Body:
```json
{
  "availability": "available" // or "unavailable" or "busy"
}
```

### 3. Get Available Drivers for Assignment
**GET** `/api/drivers/available/list`

Query Parameters:
- `vehicleType` - Filter by vehicle type
- `minCapacity` - Filter by minimum capacity

Example:
```
GET /api/drivers/available/list?vehicleType=van&minCapacity=100
```

### 4. Driver History View
**GET** `/api/drivers/:id/history`

Query Parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by delivery status

Example:
```
GET /api/drivers/123/history?page=1&limit=20&status=delivered
```

### 5. Driver Statistics
**GET** `/api/drivers/:id/stats`

Returns driver performance statistics and delivery breakdown.

### 6. Update Delivery Status
**PATCH** `/api/drivers/delivery/:deliveryId/status`

Request Body:
```json
{
  "status": "picked", // or "in_transit", "delivered", "failed"
  "location": {
    "lat": 6.9271,
    "lng": 79.8612
  },
  "notes": "Package picked up from warehouse"
}
```

### 7. Digital Delivery Confirmation
**POST** `/api/drivers/delivery/:deliveryId/confirm`

Request Body:
```json
{
  "signature": "base64_encoded_signature_image",
  "fingerprint": "base64_encoded_fingerprint_data",
  "photo": "base64_encoded_delivery_photo",
  "customerName": "John Doe",
  "deliveryNotes": "Delivered to front door"
}
```

## Usage Examples

### 1. Search for Available Van Drivers
```javascript
// Search for available van drivers with capacity >= 100kg
const response = await fetch('/api/drivers/search/filter?vehicleType=van&capacity=100&availability=available');
const drivers = await response.json();
```

### 2. Toggle Driver Availability
```javascript
// Mark driver as busy
const response = await fetch('/api/drivers/123/availability', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ availability: 'busy' })
});
```

### 3. Update Delivery Status
```javascript
// Update delivery to "in_transit"
const response = await fetch('/api/drivers/delivery/456/status', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'in_transit',
    location: { lat: 6.9271, lng: 79.8612 },
    notes: 'Driver en route to customer'
  })
});
```

### 4. Confirm Delivery with Digital Signature
```javascript
// Confirm delivery with signature
const response = await fetch('/api/drivers/delivery/456/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    customerName: 'John Doe',
    deliveryNotes: 'Delivered successfully'
  })
});
```

### 5. Get Driver History
```javascript
// Get driver's completed deliveries
const response = await fetch('/api/drivers/123/history?status=delivered&page=1&limit=10');
const history = await response.json();
```

## Features Implemented

✅ **Search & Filter Drivers** - Managers can search drivers by name, vehicle type, or capacity
✅ **Driver Availability Toggle** - Drivers can mark themselves as Available/Unavailable/Busy
✅ **Basic Delivery Status Updates** - Status tracking: Pending → Picked → In Transit → Delivered
✅ **Digital Delivery Confirmation** - Signature/fingerprint collection for proof of delivery
✅ **Driver History View** - Complete delivery history with pagination and filtering
✅ **Driver Statistics** - Performance metrics and delivery breakdown
✅ **Automatic Driver Management** - Availability updates based on delivery status

## Error Handling

All endpoints include proper error handling with appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 404: Not Found
- 500: Internal Server Error

## Security Features

- Input validation using express-validator
- MongoDB ObjectId validation
- Enum validation for status fields
- Soft delete functionality
- Data sanitization

## Performance Optimizations

- Database indexes on frequently queried fields
- Pagination for large datasets
- Selective field projection
- Efficient aggregation queries for statistics
