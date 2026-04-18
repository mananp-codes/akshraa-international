/**
 * Order History Page
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiXCircle } from 'react-icons/fi';
import { getMyOrders } from '../api/orderApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const statusConfig = {
  pending: { label: 'Pending', icon: FiClock, color: 'text-yellow-600 bg-yellow-50' },
  confirmed: { label: 'Confirmed', icon: FiCheckCircle, color: 'text-blue-600 bg-blue-50' },
  processing: { label: 'Processing', icon: FiPackage, color: 'text-purple-600 bg-purple-50' },
  shipped: { label: 'Shipped', icon: FiTruck, color: 'text-orange-600 bg-orange-50' },
  delivered: { label: 'Delivered', icon: FiCheckCircle, color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'Cancelled', icon: FiXCircle, color: 'text-red-600 bg-red-50' },
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading your orders..." />;

  return (
    <div className="page-wrapper">
      <div className="container-custom py-8">
        <h1 className="section-title">My Orders</h1>
        <p className="section-subtitle">{orders.length} total orders</p>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
            <Link to="/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <Link key={order._id} to={`/orders/${order._id}`}>
                  <div className="card p-5 hover:border-primary-300 border border-transparent transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-gray-500">#{order.invoiceNumber}</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                          {order.isPaid && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                              ✓ Paid
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {order.orderItems.length} items · Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {order.orderItems.slice(0, 3).map((item) => (
                            <img
                              key={item._id}
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          ))}
                          {order.orderItems.length > 3 && (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">
                              +{order.orderItems.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary-600">
                          ₹{order.totalPrice.toLocaleString()}
                        </p>
                        <p className="text-xs text-primary-500 mt-1">View Details →</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
