/**
 * App.jsx - Root component with React Router configuration
 * Akshraa International - B2B Textile E-Commerce
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// ── Public Pages ──────────────────────────────────────────────────────────────
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';

// ── Protected Pages ───────────────────────────────────────────────────────────
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';

// ── Seller Pages ──────────────────────────────────────────────────────────────
import SellerDashboard from './pages/seller/SellerDashboard';
import ProductForm from './pages/seller/ProductForm';

// ── Admin Pages ───────────────────────────────────────────────────────────────
import AdminPanel from './pages/admin/AdminPanel';

// ── Layout Wrapper ────────────────────────────────────────────────────────────
const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// ── 404 Page ──────────────────────────────────────────────────────────────────
const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center py-32 text-center px-4">
    <div className="text-9xl font-heading font-bold text-gray-100 mb-2">404</div>
    <h2 className="text-2xl font-semibold text-gray-600 mb-2">Page Not Found</h2>
    <p className="text-gray-400 mb-8 max-w-sm">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div className="flex gap-3">
      <a href="/" className="btn-primary px-6 py-2.5">Go to Homepage</a>
      <a href="/products" className="btn-outline px-6 py-2.5">Browse Products</a>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      {/* ── Toast Notifications ─────────────────────────────────────────────── */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a3a6b',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#f5c438', secondary: '#1a3a6b' },
          },
          error: {
            style: { background: '#dc2626', color: '#fff' },
            iconTheme: { primary: '#fff', secondary: '#dc2626' },
          },
        }}
      />

      <Routes>

        {/* ════════════════════════════════════════════════════
            AUTH PAGES (no Navbar/Footer)
        ════════════════════════════════════════════════════ */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ════════════════════════════════════════════════════
            PUBLIC PAGES (with Navbar + Footer)
        ════════════════════════════════════════════════════ */}
        <Route path="/"           element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/about"      element={<MainLayout><AboutPage /></MainLayout>} />
        <Route path="/products"   element={<MainLayout><ProductsPage /></MainLayout>} />
        <Route path="/products/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />

        {/* ════════════════════════════════════════════════════
            PROTECTED: All logged-in users
        ════════════════════════════════════════════════════ */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <MainLayout><CartPage /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute>
            <MainLayout><OrdersPage /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <MainLayout><OrderDetailPage /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout><ProfilePage /></MainLayout>
          </ProtectedRoute>
        } />

        {/* ════════════════════════════════════════════════════
            PROTECTED: Seller & Admin Only
        ════════════════════════════════════════════════════ */}
        <Route path="/seller/dashboard" element={
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <MainLayout><SellerDashboard /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/seller/products/new" element={
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <MainLayout><ProductForm /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/seller/products/edit/:id" element={
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <MainLayout><ProductForm /></MainLayout>
          </ProtectedRoute>
        } />

        {/* ════════════════════════════════════════════════════
            PROTECTED: Admin Only
        ════════════════════════════════════════════════════ */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout><AdminPanel /></MainLayout>
          </ProtectedRoute>
        } />

        {/* ════════════════════════════════════════════════════
            404 NOT FOUND
        ════════════════════════════════════════════════════ */}
        <Route path="*" element={
          <MainLayout><NotFoundPage /></MainLayout>
        } />

      </Routes>
    </Router>
  );
};

export default App;
