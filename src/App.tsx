import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ToastProvider } from './store/ToastContext';
import { CartProvider } from './store/CartContext';
import { OrdersProvider } from './store/OrdersContext';
import { MenuProvider } from './store/MenuContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ToastContainer from './components/ToastContainer';
import OrderStatusNotifier from './components/OrderStatusNotifier';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import KitchenPage from './pages/KitchenPage';
import WaiterPage from './pages/WaiterPage';
import AdminPage from './pages/AdminPage';
import PlatformLoginPage from './pages/PlatformLoginPage';
import PlatformDashboard from './pages/PlatformDashboard';
import './styles/global.css';

// Protected route wrapper
function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactElement;
  allowedRole?: 'admin' | 'customer';
}) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // super_admin can access admin routes
  const effectiveRole = role === 'super_admin' ? 'admin' : role;

  if (allowedRole && effectiveRole !== allowedRole) {
    // Redirect to appropriate home based on role
    return <Navigate to={effectiveRole === 'admin' ? '/kitchen' : '/'} replace />;
  }

  return children;
}

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();
  const isAdminLike = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';

  return (
    <div className="app-container">
      {isAuthenticated && !isSuperAdmin && <Header />}
      <OrderStatusNotifier />
      <main className="main-content">
        <Routes>
          {/* Login route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={isSuperAdmin ? '/platform/dashboard' : (isAdminLike ? '/kitchen' : '/')} replace />
              ) : (
                <LoginPage />
              )
            }
          />

          {/* Platform admin login — separate hidden URL */}
          <Route
            path="/platform"
            element={
              isAuthenticated && role === 'super_admin' ? (
                <Navigate to="/platform/dashboard" replace />
              ) : (
                <PlatformLoginPage />
              )
            }
          />

          {/* Customer routes - only accessible by customers */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRole="customer">
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRole="customer">
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRole="customer">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRole="customer">
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute allowedRole="customer">
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/kitchen"
            element={
              <ProtectedRoute allowedRole="admin">
                <KitchenPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/waiter"
            element={
              <ProtectedRoute allowedRole="admin">
                <WaiterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Platform CRM dashboard — super_admin only */}
          <Route
            path="/platform/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <PlatformDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? (isSuperAdmin ? '/platform/dashboard' : (isAdminLike ? '/kitchen' : '/')) : '/login'}
                replace
              />
            }
          />
        </Routes>
      </main>
      {isAuthenticated && !isSuperAdmin && <BottomNav />}
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <MenuProvider>
            <CartProvider>
              <OrdersProvider>
                <AppRoutes />
              </OrdersProvider>
            </CartProvider>
          </MenuProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
