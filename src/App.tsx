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
  allowedRoles,
}: {
  children: React.ReactElement;
  allowedRoles?: Array<'admin' | 'customer' | 'waiter' | 'kitchen' | 'super_admin'>;
}) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // super_admin can access admin routes
  const effectiveRole = role === 'super_admin' ? 'admin' : role;

  if (allowedRoles && effectiveRole && !allowedRoles.includes(effectiveRole)) {
    // Redirect to appropriate home based on role
    const homeMap: Record<string, string> = { admin: '/kitchen', waiter: '/waiter', kitchen: '/kitchen' };
    return <Navigate to={homeMap[effectiveRole] || '/'} replace />;
  }

  return children;
}

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();
  const isStaff = role === 'admin' || role === 'waiter' || role === 'kitchen' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';
  const staffHome = role === 'waiter' ? '/waiter' : '/kitchen';

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
                <Navigate to={isSuperAdmin ? '/platform/dashboard' : (isStaff ? staffHome : '/')} replace />
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
              <ProtectedRoute allowedRoles={['customer']}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Staff routes — admin, waiter, kitchen can access */}
          <Route
            path="/kitchen"
            element={
              <ProtectedRoute allowedRoles={['admin', 'kitchen']}>
                <KitchenPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/waiter"
            element={
              <ProtectedRoute allowedRoles={['admin', 'waiter']}>
                <WaiterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Platform CRM dashboard — super_admin only */}
          <Route
            path="/platform/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                <PlatformDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? (isSuperAdmin ? '/platform/dashboard' : (isStaff ? staffHome : '/')) : '/login'}
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
