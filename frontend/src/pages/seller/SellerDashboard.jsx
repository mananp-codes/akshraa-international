/**
 * Seller Dashboard
 * Manage products, inventory, and view stats
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getProducts, deleteProduct } from '../../api/productApi';
import { getSellerDashboard } from '../../api/userApi';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SellerDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, prodRes] = await Promise.all([
          getSellerDashboard(),
          getProducts({ limit: 50 }),
        ]);
        setStats(dashRes.data.stats);
        // Filter to only this seller's products
        setProducts(prodRes.data.products.filter(
          (p) => p.seller?._id === user?._id || p.seller === user?._id
        ));
      } catch (err) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setProducts((p) => p.filter((prod) => prod._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  if (!user?.isApproved) {
    return (
      <div className="page-wrapper">
        <div className="container-custom py-20 text-center">
          <FiAlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Awaiting Approval</h2>
          <p className="text-gray-500">Your seller account is pending admin approval. You'll receive access once approved.</p>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, color: 'bg-blue-50 text-blue-700', icon: '📦' },
    { label: 'In Stock', value: stats?.inStockProducts || 0, color: 'bg-green-50 text-green-700', icon: '✅' },
    { label: 'Out of Stock', value: stats?.outOfStock || 0, color: 'bg-red-50 text-red-700', icon: '⚠️' },
    { label: 'Surplus Products', value: stats?.surplusProducts || 0, color: 'bg-amber-50 text-amber-700', icon: '🔥' },
  ];

  return (
    <div className="page-wrapper">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="section-title mb-0">Seller Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user.name} 👋</p>
          </div>
          <Link to="/seller/products/new" className="btn-primary flex items-center gap-2">
            <FiPlus /> Add New Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className={`rounded-xl p-5 ${stat.color}`}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm font-medium mt-1 opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Products Table */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-lg">My Products</h3>
            <Link to="/seller/products/new" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              <FiPlus /> Add Product
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No products yet. <Link to="/seller/products/new" className="text-primary-600 hover:underline">Add your first product</Link></p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.images?.[0]?.url} alt="" className="w-10 h-10 object-cover rounded-lg" />
                          <span className="font-medium text-gray-800 max-w-xs truncate">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{product.subCategory || product.category}</td>
                      <td className="px-4 py-3 font-semibold text-primary-600">₹{(product.discountedPrice || product.price).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${product.countInStock > 0 ? 'badge-regular' : 'bg-red-100 text-red-700'}`}>
                          {product.countInStock > 0 ? `${product.countInStock} ${product.unit}` : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={product.stockType === 'Surplus' ? 'badge-surplus' : 'badge-regular'}>
                          {product.stockType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/seller/products/edit/${product._id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <FiEdit2 />
                          </Link>
                          <button onClick={() => handleDelete(product._id, product.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
