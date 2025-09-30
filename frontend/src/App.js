import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import HomePage from "./Pages/HomePage";
import ProductsPage from "./Pages/ProductsPage";
import AboutUsPage from "./Pages/AboutUsPage";
import CartPage from "./Pages/CartPage";
import CheckoutPage from "./Pages/CheckoutPage";
import OrdersPage from "./Pages/OrdersPage";
import PaymentSuccessPage from "./Pages/PaymentSuccessPage";

//Kawya's pages
import SupplierProfile from "./Pages/SupplierProfile";
import OtpVerification from "./Pages/OtpVerification";
import SupplierAdminDashboard from "./Pages/AdminDashboard";
import SupplierProtectedRoute from "./components/ProtectedRoute";
import SupplierList from "./Pages/SupplierList";
import SupplierForm from "./Pages/SupplierForm";
import RegisterSupplier from "./Pages/RegisterSupplier";
import SupplierLogin from "./Pages/Login";
import EditProfile from "./Pages/EditProfile";
import AdminSupplierProfile from "./Pages/AdminSupplierProfile";
import RegisterOTP from "./Pages/Register";
import SupplierMessages from "./Pages/SupplierMessages";
import AdminMessages from "./Pages/AdminMessages";
import SupplierForgotPassword from "./Pages/ForgotPassword";

//Kaveesha's page
import InventoryManagement from "./Pages/InventoryManagement";
import AddCategory from "./Pages/AddCategory";
import EditCategory from "./Pages/EditCategory";
import ProductTable from "./Pages/ProductTable";
import AddProductForm from "./Pages/AddProductForm";
import UpdateProductForm from "./Pages/UpdateProductForm";
import Shop from "./Pages/Shop/Shop";

//Vihanthi's pages
import DriverHomePage from "./Pages/DriverHomePage";
import DriversSearch from "./Pages/DriversSearch";
import DriverAvailability from "./Pages/DriverAvailability";
import DeliveryStatus from "./Pages/DeliveryStatus";
import DeliveryConfirm from "./Pages/DeliveryConfirm";
import DeliverySuccess from "./Pages/DeliverySuccess";
import DriverManagement from "./Pages/DriverManagement";
import DriverDashboard from "./Pages/DriverDashboard";
import ManagerLogin from "./Pages/ManagerLogin";
import { UserProvider } from "./contexts/UserContext";
import Navigation from "./components/Navigation";
import DriverHeader from "./components/DriverHeader";
import DriverFooter from "./components/DriverFooter";

function AppContent() {
  const location = useLocation();

  // Define which routes should use the new Header/Footer vs current Navigation
  const isPublicRoute = location.pathname === "/";
  const isDriverRoute =
    location.pathname.startsWith("/driver/") ||
    location.pathname.startsWith("/drivers/") ||
    location.pathname.startsWith("/deliveries/") ||
    location.pathname.startsWith("/delivery/") ||
    location.pathname === "/manager/login";

  return (
    <div>
      {isPublicRoute ? (
        <>
          <DriverHeader />
          <main>
            <Routes>
              <Route path="/" element={<DriverHomePage />} />
            </Routes>
          </main>
          <DriverFooter />
        </>
      ) : (
        <>
          <Navigation />
          <main className="max-w-6xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/manager/login" element={<ManagerLogin />} />
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
              <Route
                path="/drivers/management"
                element={<DriverManagement />}
              />
              <Route path="/drivers/search" element={<DriversSearch />} />
              <Route
                path="/drivers/availability"
                element={<DriverAvailability />}
              />
              <Route path="/deliveries/status" element={<DeliveryStatus />} />
              <Route path="/deliveries/confirm" element={<DeliveryConfirm />} />
              <Route path="/delivery/success" element={<DeliverySuccess />} />
            </Routes>
          </main>
        </>
      )}
    </div>
  );
}

function App() {
  const customerId = "0000000000000000000000aa";
  const location = window.location.pathname;
  const showNavigation = !["/signup", "/login"].includes(location);
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/*Kaveesha's rotes */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={<InventoryManagement />} />
        <Route path="/add-category" element={<AddCategory />} />
        <Route path="/edit-category/:id" element={<EditCategory />} />
        <Route path="/products" element={<ProductTable />} />
        <Route path="/add-product" element={<AddProductForm />} />
        <Route path="/update-product" element={<UpdateProductForm />} />
        <Route path="/shop" element={<Shop />} />

        {/* Protected Routes */}
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
              <InventoryDashboard />
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

        <Route path="/" element={<HomePage />} />
        <Route
          path="/products"
          element={<ProductsPage customerId={customerId} />}
        />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/cart" element={<CartPage customerId={customerId} />} />
        <Route
          path="/checkout"
          element={<CheckoutPage customerId={customerId} />}
        />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
      </Routes>
      <div>
        {showNavigation && (
          <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-8">
                  <h1 className="text-xl font-bold text-gray-800">
                    CeylonMart
                  </h1>
                  <div className="flex space-x-6">
                    <button
                      onClick={() => (window.location.href = "/profile")}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => (window.location.href = "/admin")}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Admin
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/signup";
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
        )}

        <div className={showNavigation ? "container py-4" : ""}>
          <Routes>
            {/* Public Routes */}
            <Route path="/supplierRegister" element={<RegisterSupplier />} />
            <Route path="/register-otp" element={<RegisterOTP />} />
            <Route path="/verify-otp" element={<OtpVerification />} />
            <Route path="/supplierLogin" element={<SupplierLogin />} />
            <Route
              path="/forgot-password"
              element={<SupplierForgotPassword />}
            />
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/suppliers/new" element={<SupplierForm />} />
            <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
            <Route path="/suppliers/:id" element={<SupplierProfile />} />
            <Route
              path="/messages"
              element={
                <ProtectedRoute requireApproved={true}>
                  <SupplierMessages />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Approved Suppliers Only */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute requireApproved={true}>
                  <SupplierProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <SupplierProtectedRoute requireApproved={true}>
                  <EditProfile />
                </SupplierProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <SupplierProtectedRoute requireAdmin={true}>
                  <SupplierAdminDashboard />
                </SupplierProtectedRoute>
              }
            />
            <Route
              path="/admin/messages/:supplierId"
              element={
                <SupplierProtectedRoute requireAdmin={true}>
                  <AdminMessages />
                </SupplierProtectedRoute>
              }
            />
            <Route
              path="/admin/suppliers/:id"
              element={
                <SupplierProtectedRoute requireAdmin={true}>
                  <AdminSupplierProfile />
                </SupplierProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>

      <UserProvider>
        <AppContent />
      </UserProvider>
    </>
  );
}

export default App;
