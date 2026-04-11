import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LanguageProvider } from './LanguageContext';
import TopAppBar from './components/TopAppBar';
import BottomNavBar from './components/BottomNavBar';
import ProtectedRoute from './components/ProtectedRoute';

// Views
import GlobalAuthView from './views/GlobalAuthView';
import CoursesView from './views/CoursesView';
import JobsView from './views/JobsView';
import ProfileView from './views/ProfileView';
import CourseLearnView from './views/CourseLearnView';

// Marketplace Views
import MarketplaceView from './views/marketplace/MarketplaceView';
import FarmerDashboardView from './views/marketplace/FarmerDashboardView';
import CreateListingView from './views/marketplace/CreateListingView';
import ListingDetailView from './views/marketplace/ListingDetailView';
import CheckoutView from './views/marketplace/CheckoutView';
import MyOrdersView from './views/marketplace/MyOrdersView';
import OrderTrackingView from './views/marketplace/OrderTrackingView';
import MandiAdmin from './views/marketplace/MandiAdmin';

// Driver Views (Placeholder until fully ported)
import DriverDashboardView from './views/DriverDashboardView';
import FarmerDeliveriesView from './views/FarmerDeliveriesView';

const RoleRedirect = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (user?.role === 'Admin') return <Navigate to="/mandi-admin" replace />;
  if (user?.role === 'Farmer') return <Navigate to="/mandi-dashboard" replace />;
  if (user?.role === 'Buyer') return <Navigate to="/marketplace" replace />;
  if (user?.role === 'Driver') return <Navigate to="/driver-dashboard" replace />;
  return <Navigate to="/auth" replace />;
};

function App() {
  const hideNavBarRoutes = [
    '/auth',
    '/mandi-admin',
    '/create-listing',
    '/checkout',
    '/listing',
    '/tracking',
    '/learn',
    '/quiz',
    '/farmer-deliveries'
  ];

  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="max-w-[480px] mx-auto h-[100dvh] relative bg-cream shadow-2xl overflow-hidden flex flex-col">
          <TopAppBar />

          <div className="flex-1 overflow-y-auto w-full p-4 pb-24 no-scrollbar">
            <Routes>
              {/* Public Routes */}
              <Route path="/auth" element={<GlobalAuthView />} />
              
              {/* Root Redirect based on Role */}
              <Route path="/" element={<RoleRedirect />} />

              {/* === FARMER ROUTES === */}
              {/* Farmers have access to skill portal & mandi dashboard */}
              <Route path="/courses" element={<ProtectedRoute allowedRoles={['Farmer']}><CoursesView /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute allowedRoles={['Farmer']}><JobsView /></ProtectedRoute>} />
              <Route path="/learn/:id" element={<ProtectedRoute allowedRoles={['Farmer']}><CourseLearnView /></ProtectedRoute>} />
              <Route path="/mandi-dashboard" element={<ProtectedRoute allowedRoles={['Farmer']}><FarmerDashboardView /></ProtectedRoute>} />
              <Route path="/create-listing" element={<ProtectedRoute allowedRoles={['Farmer']}><CreateListingView /></ProtectedRoute>} />
              <Route path="/farmer-deliveries" element={<ProtectedRoute allowedRoles={['Farmer']}><FarmerDeliveriesView /></ProtectedRoute>} />
              
              {/* === BUYER ROUTES === */}
              {/* Buyers just have buying pages */}
              <Route path="/marketplace" element={<ProtectedRoute allowedRoles={['Buyer']}><MarketplaceView /></ProtectedRoute>} />
              <Route path="/listing/:id" element={<ProtectedRoute allowedRoles={['Buyer']}><ListingDetailView /></ProtectedRoute>} />
              <Route path="/checkout/:id" element={<ProtectedRoute allowedRoles={['Buyer']}><CheckoutView /></ProtectedRoute>} />
              
              {/* === DRIVER ROUTES === */}
              {/* Drivers process tracking statuses */}
              <Route path="/driver-dashboard" element={<ProtectedRoute allowedRoles={['Driver']}><DriverDashboardView /></ProtectedRoute>} />

              {/* === ADMIN ROUTES === */}
              <Route path="/mandi-admin" element={<ProtectedRoute allowedRoles={['Admin']}><MandiAdmin /></ProtectedRoute>} />

              {/* === SHARED ROUTES === */}
              {/* Both Farmers & Buyers can typically have a profile and orders */}
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['Farmer', 'Buyer', 'Driver']}><ProfileView /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute allowedRoles={['Farmer', 'Buyer']}><MyOrdersView /></ProtectedRoute>} />
              <Route path="/tracking/:id" element={<ProtectedRoute allowedRoles={['Farmer', 'Buyer']}><OrderTrackingView /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<RoleRedirect />} />
            </Routes>
          </div>

          {/* Conditional Bottom Nav Logic Wrapper */}
          <Routes>
            {hideNavBarRoutes.map(route => (
              <Route key={route} path={`${route}/*`} element={null} />
            ))}
            <Route path="*" element={<BottomNavBar />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
