/**
 * Navbar Component
 * Responsive navigation with cart count and user menu
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiSettings, FiPackage } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Surplus Deals', path: '/products?stockType=Surplus', gold: true },
    { label: 'About', path: '/about' },
  ];

  return (
    <nav className="bg-primary-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ───────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
              <span className="text-primary-900 font-heading font-bold text-lg">A</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-heading font-bold text-lg leading-tight">Akshraa International</div>
              <div className="text-gold-400 text-xs">Delivering Quality Textiles Worldwide</div>
            </div>
          </Link>

          {/* ── Desktop Nav Links ─────────────────── */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-gold-400 ${
                  link.gold ? 'text-gold-400 font-semibold animate-pulse' : 'text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right Actions ─────────────────────── */}
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 hover:text-gold-400 transition-colors">
              <FiShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-primary-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-primary-900 font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user.name.split(' ')[0]}</span>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <FiPackage className="text-primary-600" /> My Orders
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <FiSettings className="text-primary-600" /> Profile
                      </Link>
                      {(user.role === 'seller' || user.role === 'admin') && (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <FiUser className="text-primary-600" />
                          {user.role === 'admin' ? 'Admin Panel' : 'Seller Dashboard'}
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                        >
                          <FiSettings className="text-primary-600" /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiLogOut /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm px-4 py-2 hover:text-gold-400 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-gold text-sm py-2 px-4">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 hover:text-gold-400 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ───────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-primary-700 py-4 space-y-2 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  link.gold
                    ? 'text-gold-400 bg-primary-700'
                    : 'text-white hover:bg-primary-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-3 px-4 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center btn-outline text-sm border-white text-white">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center btn-gold text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Close user menu on outside click */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;
