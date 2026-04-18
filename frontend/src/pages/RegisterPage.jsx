/**
 * Register Page
 * Supports buyer and seller registration
 */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiBriefcase, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'seller' ? 'seller' : 'buyer';

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: defaultRole, businessName: '', phone: '', gstNumber: '',
  });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const data = await register(form);
      if (form.role === 'seller') {
        toast.success('Account created! Awaiting admin approval.', { duration: 5000 });
        navigate('/');
      } else {
        toast.success(`Welcome to Akshraa International, ${data.user.name.split(' ')[0]}! 🎉`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const change = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <div className="w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-primary-900 font-heading font-bold text-2xl">A</span>
            </div>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-white">Create Account</h1>
          <p className="text-primary-200 mt-1">Join Akshraa International</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Role Selector */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => change('role', 'buyer')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                form.role === 'buyer' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🛒 Register as Buyer
            </button>
            <button
              type="button"
              onClick={() => change('role', 'seller')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                form.role === 'seller' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🏪 Register as Seller
            </button>
          </div>

          {form.role === 'seller' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-700">
              ⚠️ Seller accounts require admin approval before listing products.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="label">Full Name *</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    className="input pl-9"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => change('name', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="label">Email Address *</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    className="input pl-9"
                    placeholder="you@business.com"
                    value={form.email}
                    onChange={(e) => change('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="password"
                    className="input pl-9"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={(e) => change('password', e.target.value)}
                    required minLength={6}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="label">Confirm Password *</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="password"
                    className="input pl-9"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={(e) => change('confirmPassword', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Business Name */}
              <div>
                <label className="label">Business Name</label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    className="input pl-9"
                    placeholder="Your company name"
                    value={form.businessName}
                    onChange={(e) => change('businessName', e.target.value)}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    className="input pl-9"
                    placeholder="+91-9876543210"
                    value={form.phone}
                    onChange={(e) => change('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* GST (for sellers) */}
              {form.role === 'seller' && (
                <div className="md:col-span-2">
                  <label className="label">GST Number</label>
                  <input
                    className="input"
                    placeholder="27AAAAA0000A1Z5"
                    value={form.gstNumber}
                    onChange={(e) => change('gstNumber', e.target.value.toUpperCase())}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating Account...</>
              ) : (
                `Create ${form.role === 'seller' ? 'Seller' : 'Buyer'} Account`
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
