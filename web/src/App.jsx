import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ShipmentProvider } from "./context/ShipmentProvider";
import { I18nProvider } from "./i18n/I18nContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SidebarLayout from "./layouts/SidebarLayout";
import AdminDashboard from "./pages/AdminDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import LoginPage from "./pages/LoginPage";

/**
 * After login, redirect to the correct dashboard based on role.
 */
function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const destinations = {
    admin:  "/admin",
    buyer:  "/buyer",
    driver: "/delivery",
    farmer: "/farmer",
  };

  return <Navigate to={destinations[user.role] || "/login"} replace />;
}

/**
 * Guard: only allow if authenticated. Otherwise redirect to login.
 */
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/**
 * Guard: only allow if user has the specified role.
 */
function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

/**
 * If already logged in, redirect away from login page.
 */
function GuestOnly({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <ShipmentProvider>
          <BrowserRouter>
            <Routes>
              {/* Public: Login */}
              <Route
                path="/login"
                element={
                  <GuestOnly>
                    <LoginPage />
                  </GuestOnly>
                }
              />

              {/* Root redirect based on role */}
              <Route path="/" element={<RoleRedirect />} />

              {/* Authenticated dashboard routes */}
              <Route
                element={
                  <RequireAuth>
                    <SidebarLayout />
                  </RequireAuth>
                }
              >
                <Route path="/admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
                <Route path="/buyer" element={<RequireRole role="buyer"><BuyerDashboard /></RequireRole>} />
                <Route path="/delivery" element={<RequireRole role="driver"><DeliveryDashboard /></RequireRole>} />
                <Route path="/farmer" element={<RequireRole role="farmer"><FarmerDashboard /></RequireRole>} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ShipmentProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
