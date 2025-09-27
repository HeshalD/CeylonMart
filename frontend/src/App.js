
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import SupplierProfile from './pages/SupplierProfile';
import OtpVerification from './pages/OtpVerification';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SupplierList from './pages/SupplierList';
import SupplierForm from './pages/SupplierForm';
import RegisterSupplier from './pages/RegisterSupplier';
import Login from './pages/Login';
import EditProfile from './pages/EditProfile';
import AdminSupplierProfile from './pages/AdminSupplierProfile';
import Register from './pages/Register';
import SupplierMessages from './pages/SupplierMessages';
import AdminMessages from './pages/AdminMessages';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  const location = window.location.pathname;
  const showNavigation = !['/signup', '/login'].includes(location);

  return (
    <div>
      {showNavigation && (
        <nav className="bg-white shadow-lg border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold text-gray-800">CeylonMart</h1>
                <div className="flex space-x-6">
                  <button
                    onClick={() => window.location.href = '/profile'}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin'}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Admin
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/signup';
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
          <Route path="/register" element={<RegisterSupplier />} />
          <Route path="/register-otp" element={<Register />} />
          <Route path="/verify-otp" element={<OtpVerification />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/suppliers" element={<SupplierList />} />
          <Route path="/suppliers/new" element={<SupplierForm />} />
          <Route path="/suppliers/:id/edit" element={<SupplierForm />} />
          <Route path="/suppliers/:id" element={<SupplierProfile />} />
          <Route path="/messages" element={<ProtectedRoute requireApproved={true}><SupplierMessages /></ProtectedRoute>} />
          
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
              <ProtectedRoute requireApproved={true}>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
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
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
