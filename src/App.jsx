import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { SearchProvider } from './context/SearchContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import CategoryPage from './pages/CategoryPage';
import Shop from './pages/Shop';
import OffersPage from './pages/OffersPage';
import AIAssistant from './pages/AIAssistant';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AIFloatingButton from './components/AIFloatingButton';
import CartDrawer from './components/CartDrawer';
import BottomNav from './components/BottomNav';
import { AuthProvider } from './context/AuthContext';
import AdminPage from './pages/AdminPage';
import ErrorPage from './pages/ErrorPage';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Intercept global server errors from auth callbacks
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace('#', '?'));
    if (searchParams.get('error') || hashParams.get('error')) {
      // Small timeout to allow state to settle before navigating
      setTimeout(() => {
        navigate('/error' + location.search + location.hash, { replace: true });
      }, 100);
    }
  }, [location, navigate]);
  const { isCartOpen } = useCart();
  const isAIPage = location.pathname === '/ai-assistant';
  const isLoginPage = location.pathname === '/login';
  const isAdminPage = location.pathname === '/admin';
  const isErrorPage = location.pathname === '/error';
  const isOrderSuccess = location.pathname === '/order-success';
  const isFullPage = isAIPage || isLoginPage || isAdminPage || isErrorPage || isOrderSuccess;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {!isFullPage && <Navbar />}
      <main className={`flex-grow ${isFullPage ? 'pt-0' : 'pt-16 pb-20 md:pb-0'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          {/* Catch-all 404 Route */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
      {location.pathname === '/' && <Footer />}
      {!isFullPage && <BottomNav />}
      {location.pathname === '/' && !isCartOpen && <AIFloatingButton />}
      <CartDrawer />
      <Toaster position="bottom-center" />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrderProvider>
          <CartProvider>
            <SearchProvider>
              <AppContent />
            </SearchProvider>
          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
