# Supplier Authentication & Management System

This document describes the complete React frontend implementation for supplier registration, OTP verification, admin approval, and profile management in the CeylonMart MERN application.

## 🚀 Features Implemented

### 1. **Supplier Registration & OTP Verification**
- **Register Form**: Company name, contact name, email, phone, products/categories, address
- **OTP Verification**: 6-digit code sent to email
- **Status Flow**: Registration → OTP Verification → Pending Admin Approval

### 2. **Authentication System**
- **Login with Status Check**: Only approved suppliers can log in
- **JWT Token Management**: Secure authentication with localStorage
- **Role-based Access**: Supplier vs Admin roles

### 3. **Supplier Profile Management**
- **Profile View**: Complete supplier information display
- **Edit Profile**: Update supplier details
- **Quick Actions**: WhatsApp and Email integration

### 4. **Admin Dashboard**
- **Supplier Approval**: Approve/Reject pending suppliers
- **Status Management**: Change supplier status (pending/approved/rejected)
- **Statistics**: Dashboard with counts by status

## 📁 File Structure

```
src/
├── api.js                           # API configuration with auth endpoints
├── App.js                          # Main app with routing
├── components/
│   └── ProtectedRoute.jsx          # Role-based route protection
└── pages/
    ├── RegisterSupplier.jsx        # Supplier registration form
    ├── VerifyOTP.jsx              # OTP verification page
    ├── Login.jsx                  # Login with status checking
    ├── SupplierProfile.jsx        # Supplier profile (approved only)
    ├── EditProfile.jsx            # Edit supplier profile
    └── AdminDashboard.jsx         # Admin approval management
```

## 🔗 API Endpoints

### Authentication Endpoints
- `POST /auth/register` - Register new supplier
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/login` - Login supplier/admin
- `GET /suppliers/me` - Get current supplier profile

### Supplier Management Endpoints
- `GET /suppliers` - Get all suppliers (admin only)
- `PUT /suppliers/:id` - Update supplier
- `PUT /suppliers/:id/status` - Update supplier status (admin only)

## 🛣️ Routing Structure

### Public Routes
- `/register` - Supplier registration
- `/verify-otp` - OTP verification
- `/login` - Login page

### Protected Routes (Approved Suppliers Only)
- `/profile` - Supplier profile view
- `/profile/edit` - Edit supplier profile

### Admin Routes
- `/admin/suppliers` - Admin dashboard for approvals

## 🔐 Authentication Flow

### 1. Registration Flow
```
User Registration → OTP Verification → Pending Approval → Admin Approval → Login Access
```

### 2. Login Flow
```
Login → Check Status → 
├─ Approved: Access Profile
├─ Pending: Show "Wait for approval" message
└─ Rejected: Show rejection message
```

### 3. Admin Flow
```
Admin Login → Dashboard → View Suppliers → Approve/Reject → Status Updated
```

## 🎨 UI/UX Features

### **Form Validation**
- Real-time validation with error messages
- Required field indicators
- Email format validation
- Phone number validation

### **Status Management**
- Color-coded status badges
- Pending (Yellow), Approved (Green), Rejected (Red)
- Status-based access control

### **Responsive Design**
- Mobile-first approach
- Tailwind CSS styling
- Modern, clean interface
- Loading states and error handling

### **Quick Actions**
- WhatsApp integration: `https://wa.me/<phone>?text=Need%20stock`
- Email integration: `mailto:<email>?subject=Stock%20Request&body=Please%20send%20the%20required%20stock`

## 🔧 Technical Implementation

### **State Management**
- React Hooks (useState, useEffect)
- Local storage for authentication
- Form state management
- Error and loading states

### **Security Features**
- JWT token authentication
- Role-based access control
- Protected routes
- Automatic token validation

### **Error Handling**
- Network error handling
- API error responses
- User-friendly error messages
- Form validation errors

## 🚀 Getting Started

### 1. **Start Backend Server**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### 2. **Start Frontend**
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

### 3. **Access the Application**
- **Registration**: `http://localhost:3000/register`
- **Login**: `http://localhost:3000/login`
- **Admin Dashboard**: `http://localhost:3000/admin/suppliers`

## 🧪 Testing the System

### **Demo Credentials**
The login page includes demo credentials for testing:
- **Supplier**: `supplier@test.com` / `password123`
- **Admin**: `ann03@gmail.com` / `lamann01`

### **Test Flow**
1. **Register** a new supplier
2. **Verify OTP** (use any 6-digit code for testing)
3. **Login as Admin** to approve the supplier
4. **Login as Supplier** to access profile
5. **Test Profile Editing** and quick actions

## 📱 User Experience

### **Supplier Journey**
1. **Register** → Fill form with company details
2. **Verify OTP** → Enter 6-digit code from email
3. **Wait for Approval** → Admin reviews and approves
4. **Login & Access** → View profile, edit details, use quick actions

### **Admin Journey**
1. **Login** → Access admin dashboard
2. **Review Suppliers** → See all pending/approved/rejected suppliers
3. **Manage Status** → Approve or reject suppliers
4. **Monitor** → View statistics and supplier information

## 🔒 Security Considerations

- **JWT Tokens**: Secure authentication
- **Role-based Access**: Admin vs Supplier permissions
- **Status Validation**: Only approved suppliers can access protected routes
- **Input Validation**: Client and server-side validation
- **Error Handling**: Secure error messages without sensitive data

## 🎯 Production Ready Features

- ✅ **Complete CRUD Operations**
- ✅ **Authentication & Authorization**
- ✅ **Form Validation**
- ✅ **Error Handling**
- ✅ **Loading States**
- ✅ **Responsive Design**
- ✅ **Role-based Access Control**
- ✅ **Status Management**
- ✅ **Quick Actions Integration**
- ✅ **Clean Code Architecture**

This system provides a complete, production-ready supplier management solution with authentication, approval workflows, and profile management capabilities.
