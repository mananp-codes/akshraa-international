/**
 * Cart Page with Razorpay checkout
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { createOrder, verifyPayment } from '../api/orderApi';

const CartPage = () => {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotalRaw = useCartStore((state) =>
    state.items.reduce((sum, item) => {
      const price = item.product.discountedPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0)
  );
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '', city: '', state: '', country: 'India', pincode: '',
  });
  const [step, setStep] = useState('cart'); // 'cart' | 'address' | 'payment'

  const subtotal = subtotalRaw;
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 10000 ? 0 : 500;
  const total = subtotal + tax + shipping;

  const handleCheckout = async () => {
    if (!user) { toast.error('Please login to checkout'); return navigate('/login'); }
    setLoading(true);

    try {
      const orderData = {
        orderItems: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: 'razorpay',
      };

      const { data } = await createOrder(orderData);

      // ── Open Razorpay Checkout ─────────────────────────────
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Akshraa International',
        description: 'Textile Order Payment',
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await verifyPayment(data.order._id, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            toast.success('Payment successful! Order confirmed. 🎉');
            navigate(`/orders/${data.order._id}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: { color: '#1a3a6b' },
      };

      // Load Razorpay script and open modal
      // Bug fix: check if script already loaded to avoid duplicate injection
      const openRazorpay = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      if (window.Razorpay) {
        openRazorpay();
      } else {
        const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (!existing) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = openRazorpay;
          document.body.appendChild(script);
        } else {
          existing.addEventListener('load', openRazorpay);
        }
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="container-custom py-20 text-center">
          <div className="text-7xl mb-6">🛒</div>
          <h2 className="font-heading text-3xl font-bold text-gray-700 mb-3">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Add some textile products to get started</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <FiShoppingBag /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container-custom py-8">
        <h1 className="section-title mb-6">
          {step === 'cart' ? 'Shopping Cart' : 'Shipping & Payment'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart Items / Shipping Form ─────────────────── */}
          <div className="lg:col-span-2">
            {step === 'cart' ? (
              <div className="space-y-4">
                {items.map((item) => {
                  const effectivePrice = item.product.discountedPrice || item.product.price;
                  return (
                    <div key={item.product._id} className="card p-4 flex gap-4">
                      <img
                        src={item.product.images?.[0]?.url}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${item.product._id}`} className="font-semibold text-gray-800 hover:text-primary-600 line-clamp-1">
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-0.5">₹{effectivePrice.toLocaleString()} / {item.product.unit}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQuantity(item.product._id, Math.max(item.product.moq, item.quantity - 10))} className="w-7 h-7 rounded-md border border-gray-200 text-sm hover:border-primary-400 font-bold">−</button>
                            <span className="w-12 text-center font-medium text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product._id, item.quantity + 10)} className="w-7 h-7 rounded-md border border-gray-200 text-sm hover:border-primary-400 font-bold">+</button>
                          </div>
                          <span className="font-semibold text-primary-600">
                            ₹{(effectivePrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.product._id)} className="text-red-400 hover:text-red-600 p-1">
                        <FiTrash2 />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Shipping Address Form */
              <div className="card p-6">
                <h3 className="font-semibold text-lg mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'fullName', col: 2 },
                    { label: 'Phone', key: 'phone', col: 2 },
                    { label: 'Street Address', key: 'street', col: 2 },
                    { label: 'City', key: 'city' },
                    { label: 'State', key: 'state' },
                    { label: 'Country', key: 'country' },
                    { label: 'Pincode', key: 'pincode' },
                  ].map(({ label, key, col }) => (
                    <div key={key} className={col === 2 ? 'md:col-span-2' : ''}>
                      <label className="label">{label} *</label>
                      <input
                        className="input"
                        value={shippingAddress[key]}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, [key]: e.target.value }))}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Order Summary ────────────────────────────────── */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-5">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary-600">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {step === 'cart' ? (
                  <button onClick={() => setStep('address')} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                    Proceed to Checkout <FiArrowRight />
                  </button>
                ) : (
                  <>
                    <button onClick={handleCheckout} disabled={loading} className="w-full btn-gold py-3 flex items-center justify-center gap-2">
                      {loading ? (
                        <><span className="w-5 h-5 border-2 border-primary-900 border-t-transparent rounded-full animate-spin" /> Processing...</>
                      ) : (
                        <>Pay ₹{total.toLocaleString()} via Razorpay</>
                      )}
                    </button>
                    <button onClick={() => setStep('cart')} className="w-full text-sm text-gray-500 flex items-center justify-center gap-1 hover:text-gray-700">
                      <FiArrowLeft /> Back to Cart
                    </button>
                  </>
                )}
              </div>

              {subtotal < 10000 && (
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Add ₹{(10000 - subtotal).toLocaleString()} more for free shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
