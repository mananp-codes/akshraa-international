/**
 * Admin Panel - Full platform management
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiPackage, FiShoppingBag, FiDollarSign, FiCheck, FiX, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAdminStats, getAllUsers, approveUser, toggleUserStatus, getPendingSellers } from '../../api/userApi';
import { getAllOrders, updateOrderStatus } from '../../api/orderApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TABS = ['Overview', 'Users', 'Pending Sellers', 'Orders'];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, pendingRes, ordersRes] = await Promise.all([
          getAdminStats(),
          getAllUsers(),
          getPendingSellers(),
          getAllOrders(),
        ]);
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users);
        setPendingSellers(pendingRes.data.sellers);
        setOrders(ordersRes.data.orders);
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (userId, approve) => {
    try {
      await approveUser(userId, approve);
      setPendingSellers((p) => p.filter((s) => s._id !== userId));
      setUsers((u) => u.map((usr) => usr._id === userId ? { ...usr, isApproved: approve } : usr));
      toast.success(approve ? 'Seller approved!' : 'Seller rejected');
    } catch {
      toast.error('Action failed');
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await toggleUserStatus(userId);
      setUsers((u) => u.map((usr) => usr._id === userId ? { ...usr, isActive: !usr.isActive } : usr));
      toast.success('User status updated');
    } catch {
      toast.error('Action failed');
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, { status });
      setOrders((o) => o.map((ord) => ord._id === orderId ? { ...ord, status } : ord));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order');
    }
  };

  if (loading) return <LoadingSpinner text="Loading admin panel..." />;

  return (
    <div className="page-wrapper">
      <div className="container-custom py-8">
        <h1 className="section-title">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
              {tab === 'Pending Sellers' && pendingSellers.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full inline-flex items-center justify-center">
                  {pendingSellers.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ─────────────────────────────── */}
        {activeTab === 'Overview' && stats && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'text-blue-600 bg-blue-50' },
                { label: 'Total Products', value: stats.totalProducts, icon: FiPackage, color: 'text-purple-600 bg-purple-50' },
                { label: 'Total Orders', value: stats.totalOrders, icon: FiShoppingBag, color: 'text-green-600 bg-green-50' },
                { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: 'text-gold-600 bg-gold-50' },
              ].map((stat) => (
                <div key={stat.label} className={`card p-5 ${stat.color}`}>
                  <stat.icon className="w-8 h-8 mb-3 opacity-70" />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm font-medium mt-1 opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Buyers', value: stats.totalBuyers },
                { label: 'Sellers', value: stats.totalSellers },
                { label: 'Pending Approvals', value: stats.pendingSellers, alert: stats.pendingSellers > 0 },
              ].map((item) => (
                <div key={item.label} className={`card p-4 ${item.alert ? 'border-amber-300 bg-amber-50' : ''}`}>
                  <div className="text-2xl font-bold text-gray-700">{item.value}</div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Users Tab ────────────────────────────────── */}
        {activeTab === 'Users' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge capitalize ${
                          user.role === 'admin' ? 'bg-primary-100 text-primary-700' :
                          user.role === 'seller' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {user.role !== 'admin' && (
                          <button onClick={() => handleToggleUser(user._id)} title={user.isActive ? 'Deactivate' : 'Activate'} className={`p-1.5 rounded-lg ${user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                            {user.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pending Sellers Tab ───────────────────────── */}
        {activeTab === 'Pending Sellers' && (
          <div>
            {pendingSellers.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FiCheck className="w-12 h-12 mx-auto mb-3 text-green-400" />
                <p>All sellers have been reviewed!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSellers.map((seller) => (
                  <div key={seller._id} className="card p-5 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{seller.name}</h4>
                      <p className="text-sm text-gray-500">{seller.email}</p>
                      {seller.businessName && <p className="text-sm font-medium text-primary-600 mt-1">{seller.businessName}</p>}
                      {seller.gstNumber && <p className="text-xs text-gray-400">GST: {seller.gstNumber}</p>}
                      <p className="text-xs text-gray-400 mt-1">Applied {new Date(seller.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleApprove(seller._id, true)} className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                        <FiCheck /> Approve
                      </button>
                      <button onClick={() => handleApprove(seller._id, false)} className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                        <FiX /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Orders Tab ───────────────────────────────── */}
        {activeTab === 'Orders' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Invoice</th>
                    <th className="px-4 py-3 text-left">Buyer</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-right">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{order.invoiceNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{order.buyer?.name}</div>
                        <div className="text-xs text-gray-500">{order.buyer?.email}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary-600">₹{order.totalPrice.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`badge capitalize ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'shipped' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatus(order._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-400"
                        >
                          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
