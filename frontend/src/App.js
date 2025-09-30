
import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './Pages/HomePage';
import DriversSearch from './Pages/DriversSearch';
import DriverAvailability from './Pages/DriverAvailability';
import DeliveryStatus from './Pages/DeliveryStatus';
import DeliveryConfirm from './Pages/DeliveryConfirm';
import DeliverySuccess from './Pages/DeliverySuccess';
import DriverManagement from './Pages/DriverManagement';
import DriverDashboard from './Pages/DriverDashboard';
import ManagerLogin from './Pages/ManagerLogin';
import { UserProvider } from './contexts/UserContext';
import Navigation from './components/Navigation';
import Header from './components/Header';
import Footer from './components/Footer';

function AppContent() {
  const location = useLocation();
  
  // Define which routes should use the new Header/Footer vs current Navigation
  const isPublicRoute = location.pathname === '/';
  const isDriverRoute = location.pathname.startsWith('/driver/') || 
                       location.pathname.startsWith('/drivers/') || 
                       location.pathname.startsWith('/deliveries/') || 
                       location.pathname.startsWith('/delivery/') ||
                       location.pathname === '/manager/login';

  return (
    <div>
      {isPublicRoute ? (
        <>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </>
      ) : (
        <>
          <Navigation />
          <main className="max-w-6xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/manager/login" element={<ManagerLogin />} />
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
              <Route path="/drivers/management" element={<DriverManagement />} />
              <Route path="/drivers/search" element={<DriversSearch />} />
              <Route path="/drivers/availability" element={<DriverAvailability />} />
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
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
