import { Routes, Route } from "react-router-dom";
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
import InventoryDashboard from "./Pages/dashboards/InventoryDashboard";
import DeliveryDashboard from "./Pages/dashboards/DeliveryDashboard";

//Chanula's pages
import HomePage from './Pages/HomePage';
import ProductsPage from './Pages/ProductsPage';
import AboutUsPage from './Pages/AboutUsPage';
import CartPage from './Pages/CartPage';
import CheckoutPage from './Pages/CheckoutPage';
import OrdersPage from './Pages/OrdersPage';
import PaymentSuccessPage from './Pages/PaymentSuccessPage';

function App() {
  const customerId = "0000000000000000000000aa";
  return (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/account-settings" element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/customer" element={
          <ProtectedRoute requiredRole="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/shop" element={
          <ProtectedRoute requiredRole="shop_owner">
            <ShopDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/supplier" element={
          <ProtectedRoute requiredRole="supplier_admin">
            <SupplierDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/inventory" element={
          <ProtectedRoute requiredRole="inventory_manager">
            <InventoryDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/delivery" element={
          <ProtectedRoute requiredRole="delivery_admin">
            <DeliveryDashboard />
          </ProtectedRoute>
        } />

<Route path="/" element={<HomePage />} />
<Route path="/products" element={<ProductsPage customerId={customerId} />} />
<Route path="/about" element={<AboutUsPage />} />
<Route path="/cart" element={<CartPage customerId={customerId} />} />
<Route path="/checkout" element={<CheckoutPage customerId={customerId} />} />
<Route path="/orders" element={<OrdersPage />} />
<Route path="/payment-success" element={<PaymentSuccessPage />} />
      </Routes>
  );
}

export default App;
