
import './App.css';
import { Routes, Route, Link } from "react-router-dom";
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
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-emerald-100">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link className="text-lg font-bold text-emerald-700" to="/">CeylonMart</Link>
            <div className="ml-auto flex items-center gap-3">
              <Link className="px-3 py-1.5 rounded-full text-emerald-700 hover:bg-emerald-50" to="/cart">Cart</Link>
            </div>
          </div>
        </nav>
        <main className="py-8">
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
