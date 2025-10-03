import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Profile from "./Pages/Profile";
import AccountSettings from "./Pages/AccountSettings";
import ProtectedRoute from "./components/ProtectedRoute";

import CustomerDashboard from "./Pages/dashboards/CustomerDashboard";
import AdminDashboard from "./Pages/dashboards/AdminDashboard";
import ShopDashboard from "./Pages/dashboards/ShopDashboard";
import SupplierDashboard from "./Pages/dashboards/SupplierDashboard";
import DeliveryDashboard from "./Pages/dashboards/DeliveryDashboard";

//Chanula's pages
import HomePage from "./Pages/HomePage";
//import ProductsPage from "./Pages/ProductsPage";
import AboutUsPage from "./Pages/AboutUsPage";
import CartPage from "./Pages/CartPage";
import CheckoutPage from "./Pages/CheckoutPage";
import OrdersPage from "./Pages/OrdersPage";
import PaymentSuccessPage from "./Pages/PaymentSuccessPage";

//Kawya's pages
import SupplierProfile from "./Pages/SupplierProfile";
import OtpVerification from "./Pages/OtpVerification";
import SupplierAdminDashboard from "./Pages/SupplierAdminDashboard";
import SupplierList from "./Pages/SupplierList";
import SupplierForm from "./Pages/SupplierForm";
import RegisterSupplier from "./Pages/RegisterSupplier";
import SupplierLogin from "./Pages/Login.jsx";
import EditProfile from "./Pages/EditProfile";
import AdminSupplierProfile from "./Pages/AdminSupplierProfile";
import RegisterOTP from "./Pages/Register";
import SupplierMessages from "./Pages/SupplierMessages";
import AdminMessages from "./Pages/AdminMessages";
import SupplierForgotPassword from "./Pages/SupplierForgotPassword";  

//Kaveesha's page
import InventoryManagement from "./Pages/InventoryManagement";
import AddCategory from "./Pages/AddCategory";
import EditCategory from "./Pages/EditCategory";
import ProductTable from "./Pages/ProductTable";
import AddProductForm from "./Pages/AddProductForm";
import UpdateProductForm from "./Pages/UpdateProductForm";
import Shop from "./Pages/Shop/Shop";

//Vihanthi's pages
import DriversSearch from "./Pages/DriversSearch";
import DriverAvailability from "./Pages/DriverAvailability";
import DeliveryStatus from "./Pages/DeliveryStatus";
import DeliveryConfirm from "./Pages/DeliveryConfirm";
import DeliverySuccess from "./Pages/DeliverySuccess";
import DriverManagement from "./Pages/DriverManagement";
import DriverDashboard from "./Pages/DriverDashboard";
import ManagerLogin from "./Pages/ManagerLogin";
import { UserProvider } from "./contexts/UserContext";

function App() {
  const customerId = "0000000000000000000000aa";
  
  return (
    <UserProvider>
      <Routes>
        {/* Public Routes - No Authentication Required */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<AboutUsPage />} />
        
        {/* Customer Routes */}
        <Route path="/products" element={<Shop />} />   {/* 👈 Customer-facing products */}
        <Route path="/cart" element={<CartPage customerId={customerId} />} />
        <Route path="/checkout" element={<CheckoutPage customerId={customerId} />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />

        {/* Supplier Routes */}
        <Route path="/supplierRegister" element={<RegisterSupplier />} />
        <Route path="/register-otp" element={<RegisterOTP />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/supplierLogin" element={<SupplierLogin />} />
        <Route path="/suppliers" element={<SupplierList />} />
        <Route path="/suppliers/new" element={<SupplierForm />} />
        <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
        <Route path="/suppliers/:id" element={<SupplierProfile />} />
        <Route path="/supplierForgotPassword" element={<SupplierForgotPassword />} />

        {/* Driver Routes */}
        <Route path="/manager/login" element={<ManagerLogin />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/drivers/management" element={<DriverManagement />} />
        <Route path="/drivers/search" element={<DriversSearch />} />
        <Route path="/drivers/availability" element={<DriverAvailability />} />
        <Route path="/deliveries/status" element={<DeliveryStatus />} />
        <Route path="/deliveries/confirm" element={<DeliveryConfirm />} />
        <Route path="/delivery/success" element={<DeliverySuccess />} />

        {/* Inventory Management Routes */}
        <Route path="/dashboard" element={<InventoryManagement />} />
        <Route path="/add-category" element={<AddCategory />} />
        <Route path="/edit-category/:id" element={<EditCategory />} />
        <Route path="/inventory/products" element={<ProductTable />} /> {/* 👈 Changed path */}
        <Route path="/add-product" element={<AddProductForm />} />
        <Route path="/update-product" element={<UpdateProductForm />} />
        <Route path="/shop" element={<Shop />} />

        {/* Protected Routes - Require Authentication */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account-settings"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute requireApproved={true}>
              <SupplierMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute requireApproved={true}>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Routes - Role-based Access */}
        <Route
          path="/dashboard/customer"
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/shop"
          element={
            <ProtectedRoute requiredRole="shop_owner">
              <ShopDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/supplier"
          element={
            <ProtectedRoute requiredRole="supplier_admin">
              <SupplierDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/inventory"
          element={
            <ProtectedRoute requiredRole="inventory_manager">
              <InventoryManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/delivery"
          element={
            <ProtectedRoute requiredRole="delivery_admin">
              <DeliveryDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <SupplierAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages/:supplierId"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/suppliers/:id"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminSupplierProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplierProfile"
          element={
            <SupplierProfile />
          }
        />

        {/* Fallback Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
