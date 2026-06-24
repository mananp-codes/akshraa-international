/**
 * Order Detail Page
 * Shows full order info, payment status, shipping, items
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiPackage, FiTruck, FiCheckCircle,
  FiClock, FiXCircle, FiMapPin, FiPhone, FiUser
} from 'react-icons/fi';
import { getOrderById } from '../api/orderApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusConfig = {
  pending:    { label: 'Pending Payment', icon: FiClock,        color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  confirmed:  { label: 'Confirmed',       icon: FiCheckCircle,  color: 'text-blue-600 bg-blue-50 border-blue-200' },
  processing: { label: 'Processing',      icon: FiPackage,      color: 'text-purple-600 bg-purple-50 border-purple-200' },
  shipped:    { label: 'Shipped',         icon: FiTruck,        color: 'text-orange-600 bg-orange-50 border-orange-200' },
  delivered:  { label: 'Delivered',       icon: FiCheckCircle,  color: 'text-green-600 bg-green-50 border-green-200' },
  cancelled:  { label: 'Cancelled',       icon: FiXCircle,      color: 'text-red-600 bg-red-50 border-red-200' },
  refunded:   { label: 'Refunded',        icon: FiXCircle,      color: 'text-gray-600 bg-gray-50 border-gray-200' },
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading order details..." />;
  if (!order) return (
    <div className="page-wrapper text-center py-20">
      <p className="text-gray-400">Order not found.</p>
      <Link to="/orders" className="btn-primary mt-4 inline-block">Back to Orders</Link>
    </div>
  );

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="page-wrapper">
      <div className="container-custom py-8">

        {/* Back */}
        <Link to="/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm">
          <FiArrowLeft /> Back to Orders
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title mb-1">Order Details</h1>
            <p className="text-gray-500 font-mono text-sm">#{order.invoiceNumber}</p>
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm ${status.color}`}>
            <StatusIcon className="w-4 h-4" />
            {status.label}
          </span>
        </div>

        {/* Progress Bar (only for non-cancelled orders) */}
        {order.status !== 'cancelled' && order.status !== 'refunded' && (
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between relative">
              {/* Connecting line */}
              <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 z-0" />
              <div
                className="absolute left-0 top-5 h-0.5 bg-primary-600 z-0 transition-all duration-700"
                style={{ width: `${Math.max(0, currentStep / (statusSteps.length - 1)) * 100}%` }}
              />
              {statusSteps.map((step, i) => {
                const done = i <= currentStep;
                const cfg = statusConfig[step];
                const Icon = cfg.icon;
                return (
                  <div key={step} className="flex flex-col items-center gap-2 z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      done
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-medium capitalize text-center hidden sm:block ${done ? 'text-primary-600' : 'text-gray-400'}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Order Items ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Order Items ({order.orderItems.length})</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="p-5 flex gap-4">
                    <img
                      src={item.image || 'https://via.placeholder.com/80'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl bg-gray-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        ₹{item.price.toLocaleString()} × {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary-600">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiMapPin className="text-primary-600" /> Shipping Address
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-2 font-medium text-gray-800">
                  <FiUser className="w-4 h-4 text-gray-400" />
                  {order.shippingAddress.fullName}
                </p>
                <p className="flex items-center gap-2">
                  <FiPhone className="w-4 h-4 text-gray-400" />
                  {order.shippingAddress.phone}
                </p>
                <p className="mt-2">
                  {order.shippingAddress.street},<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>
              {order.trackingNumber && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="text-sm font-medium text-orange-700">
                    🚚 Tracking: <span className="font-mono">{order.trackingNumber}</span>
                    {order.carrier && ` (${order.carrier})`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Order Summary ────────────────────────────────── */}
          <div className="space-y-4">
            {/* Price breakdown */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal</span>
                  <span>₹{order.itemsPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{order.taxPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={order.shippingPrice === 0 ? 'text-green-600 font-medium' : ''}>
                    {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
                  <span>Total Paid</span>
                  <span className="text-primary-600">₹{order.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Payment Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.isPaid ? '✓ Paid' : 'Pending'}
                  </span>
                </div>
                {order.paymentResult?.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Razorpay ID</span>
                    <span className="font-mono text-xs text-gray-600 truncate max-w-[150px]">
                      {order.paymentResult.razorpayPaymentId}
                    </span>
                  </div>
                )}
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid On</span>
                    <span>{new Date(order.paidAt).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Meta */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Order Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice #</span>
                  <span className="font-mono font-medium">{order.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Placed On</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivered On</span>
                    <span>{new Date(order.deliveredAt).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {order.buyerNotes && (
              <div className="card p-4 bg-blue-50 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Your Notes:</p>
                <p className="text-sm text-blue-800">{order.buyerNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
