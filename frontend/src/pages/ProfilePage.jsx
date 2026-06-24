/**
 * Profile / Account Settings Page
 */

import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiLock, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { updateProfile, changePassword } from '../api/authApi';

const ProfilePage = () => {
  const { user, refreshUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    businessName: user?.businessName || '',
    gstNumber: user?.gstNumber || '',
    businessAddress: {
      street: user?.businessAddress?.street || '',
      city: user?.businessAddress?.city || '',
      state: user?.businessAddress?.state || '',
      country: user?.businessAddress?.country || 'India',
      pincode: user?.businessAddress?.pincode || '',
    },
  });

  // Password form state
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profileForm);
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const pf = (field, value) => setProfileForm(p => ({ ...p, [field]: value }));
  const pa = (field, value) => setProfileForm(p => ({ ...p, businessAddress: { ...p.businessAddress, [field]: value } }));

  return (
    <div className="page-wrapper">
      <div className="container-custom py-8">
        <h1 className="section-title">My Account</h1>

        {/* User card */}
        <div className="card p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-heading font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className={`badge capitalize ${
                user?.role === 'admin' ? 'bg-primary-100 text-primary-700' :
                user?.role === 'seller' ? 'bg-purple-100 text-purple-700' :
                'bg-green-100 text-green-700'
              }`}>{user?.role}</span>
              {user?.role === 'seller' && (
                <span className={`badge ${user?.isApproved ? 'badge-regular' : 'bg-yellow-100 text-yellow-700'}`}>
                  {user?.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {['profile', 'password'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'profile' ? '👤 Profile' : '🔒 Password'}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ─────────────────────────────── */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="max-w-2xl space-y-5">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input className="input pl-9" value={profileForm.name} onChange={e => pf('name', e.target.value)} required />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Email (cannot be changed)</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input className="input pl-9 bg-gray-50 cursor-not-allowed" value={user?.email} disabled />
                  </div>
                </div>
                <div>
                  <label className="label">Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input className="input pl-9" value={profileForm.phone} onChange={e => pf('phone', e.target.value)} placeholder="+91-9876543210" />
                  </div>
                </div>
                <div>
                  <label className="label">Business Name</label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input className="input pl-9" value={profileForm.businessName} onChange={e => pf('businessName', e.target.value)} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="label">GST Number</label>
                  <input className="input" value={profileForm.gstNumber} onChange={e => pf('gstNumber', e.target.value.toUpperCase())} placeholder="27AAAAA0000A1Z5" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Business Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Street Address</label>
                  <input className="input" value={profileForm.businessAddress.street} onChange={e => pa('street', e.target.value)} placeholder="123 Textile Market, Ring Road" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input className="input" value={profileForm.businessAddress.city} onChange={e => pa('city', e.target.value)} />
                </div>
                <div>
                  <label className="label">State</label>
                  <input className="input" value={profileForm.businessAddress.state} onChange={e => pa('state', e.target.value)} />
                </div>
                <div>
                  <label className="label">Country</label>
                  <input className="input" value={profileForm.businessAddress.country} onChange={e => pa('country', e.target.value)} />
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input className="input" value={profileForm.businessAddress.pincode} onChange={e => pa('pincode', e.target.value)} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 py-3 px-8">
              {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave />}
              Save Changes
            </button>
          </form>
        )}

        {/* ── Password Tab ─────────────────────────────── */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange} className="max-w-md">
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold text-gray-800 mb-2">Change Password</h3>
              {[
                { label: 'Current Password', key: 'currentPassword', show: showPass.current, toggleKey: 'current' },
                { label: 'New Password', key: 'newPassword', show: showPass.new, toggleKey: 'new' },
                { label: 'Confirm New Password', key: 'confirmPassword', show: showPass.confirm, toggleKey: 'confirm' },
              ].map(({ label, key, show, toggleKey }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={show ? 'text' : 'password'}
                      className="input pl-9 pr-10"
                      value={passForm[key]}
                      onChange={e => setPassForm(p => ({ ...p, [key]: e.target.value }))}
                      required minLength={key !== 'currentPassword' ? 6 : 1}
                    />
                    <button type="button" onClick={() => setShowPass(p => ({ ...p, [toggleKey]: !p[toggleKey] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {show ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={saving} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiLock />}
                Change Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
