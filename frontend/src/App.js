
import './App.css';
import { Routes, Route } from "react-router-dom";
import HomePage from './Pages/HomePage';
import CartPage from './Pages/CartPage';
import CheckoutPage from './Pages/CheckoutPage';
import OrdersPage from './Pages/OrdersPage';
import PaymentSuccessPage from './Pages/PaymentSuccessPage';

function App() {
  // In a real app, get customerId from auth context; using a demo id here
  const customerId = "0000000000000000000000aa";

  return (
      <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-white">
        <main>
        <Routes>
          <Route path="/" element={<HomePage customerId={customerId} />} />
          <Route path="/cart" element={<CartPage customerId={customerId} />} />
          <Route path="/checkout" element={<CheckoutPage customerId={customerId} />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
