import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, LayoutDashboard, History, LogOut, ShieldCheck } from 'lucide-react';
import Auth from './pages/Auth';
import Marketplace from './pages/Marketplace';
import FarmerDashboard from './pages/FarmerDashboard';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import Admin from './pages/Admin';
import { useTranslation } from 'react-i18next';
import { logout } from './store/slices/authSlice';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  if (!isAuthenticated) return <Navigate to="/auth" />;
  
  if (!user || !user.role) {
    dispatch(logout());
    return <Navigate to="/auth" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If Admin, send to Admin; otherwise, send to their respective dashboard
    if (user.role === 'Admin') return <Navigate to="/admin" />;
    return <Navigate to={user.role === 'Farmer' ? '/dashboard' : '/marketplace'} />;
  }
  return children;
};

const BottomNav = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  if (!isAuthenticated || location.pathname === '/auth') return null;

  const isActive = (path) => location.pathname === path || (path === '/dashboard' && location.pathname === '/create-listing') || location.pathname.startsWith('/tracking/');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 h-22 shadow-[0_-2px_15px_rgba(0,0,0,0.05)] flex items-center justify-around px-2 z-50">
      {user.role === 'Buyer' ? (
        <>
          <Link to="/marketplace" className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${isActive('/marketplace') ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`}>
            <ShoppingBag className="w-7 h-7" />
            <span className="text-[10px] font-black uppercase tracking-tighter">{t('marketplace')}</span>
          </Link>
          <Link to="/orders" className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${isActive('/orders') ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`}>
            <History className="w-7 h-7" />
            <span className="text-[10px] font-black uppercase tracking-tighter">History</span>
          </Link>
        </>
      ) : user.role === 'Farmer' ? (
        <Link to="/dashboard" className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${isActive('/dashboard') ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`}>
          <LayoutDashboard className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-tighter">{t('dashboard')}</span>
        </Link>
      ) : (
        <Link to="/admin" className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${isActive('/admin') ? 'text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`}>
          <ShieldCheck className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Admin Panel</span>
        </Link>
      )}
      <button 
        onClick={() => dispatch(logout())}
        className="flex-1 flex flex-col items-center gap-1.5 p-2 text-gray-400 rounded-2xl"
      >
        <LogOut className="w-7 h-7" />
        <span className="text-[10px] font-black uppercase tracking-tighter">Logout</span>
      </button>
    </nav>
  );
};

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);
  
  React.useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-10 bg-red-600 text-white flex items-center justify-center text-[10px] font-black z-[100] shadow-lg uppercase">
      Offline · Data from cache
    </div>
  );
};

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <div className="max-w-screen-2xl mx-auto relative min-h-screen bg-background">
        <OfflineBanner />
        <Routes>
          <Route path="/auth" element={!isAuthenticated ? <Auth /> : (user && user.role ? <Navigate to={user.role === 'Admin' ? '/admin' : (user.role === 'Farmer' ? '/dashboard' : '/marketplace')} /> : <Auth />)} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><Admin /></ProtectedRoute>} />

          {/* Buyer Specific Routes */}
          <Route path="/marketplace" element={<ProtectedRoute allowedRoles={['Buyer']}><Marketplace /></ProtectedRoute>} />
          <Route path="/listing/:id" element={<ProtectedRoute allowedRoles={['Buyer']}><ListingDetail /></ProtectedRoute>} />
          <Route path="/checkout/:id" element={<ProtectedRoute allowedRoles={['Buyer']}><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allowedRoles={['Buyer']}><MyOrders /></ProtectedRoute>} />
          <Route path="/tracking/:id" element={<ProtectedRoute allowedRoles={['Buyer']}><OrderTracking /></ProtectedRoute>} />
          
          {/* Farmer Specific Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Farmer']}><FarmerDashboard /></ProtectedRoute>} />
          <Route path="/create-listing" element={<ProtectedRoute allowedRoles={['Farmer']}><CreateListing /></ProtectedRoute>} />
          
          <Route path="/" element={<Navigate to="/auth" />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
