/**
 * Order Controller
 * Handles cart checkout, Razorpay payments, and order management
 */

const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Initialize Razorpay with credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── @route   POST /api/orders ─────────────────────────────────────────────────
// @desc    Create a new order and Razorpay payment order
// @access  Private (Buyers)
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, buyerNotes } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  // ── Validate items and calculate prices ───────────────────
  let itemsPrice = 0;
  const validatedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }

    // Check if order quantity meets MOQ
    if (item.quantity < product.moq) {
      res.status(400);
      throw new Error(
        `Minimum order for "${product.name}" is ${product.moq} ${product.unit}`
      );
    }

    // Check stock availability
    if (item.quantity > product.countInStock) {
      res.status(400);
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.countInStock}`
      );
    }

    const effectivePrice = product.discountedPrice || product.price;
    itemsPrice += effectivePrice * item.quantity;

    validatedItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: effectivePrice,
      quantity: item.quantity,
      unit: product.unit,
    });
  }

  // Calculate tax (18% GST) and shipping
  const taxPrice = Math.round(itemsPrice * 0.18);
  const shippingPrice = itemsPrice > 10000 ? 0 : 500; // Free shipping above ₹10,000
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // ── Create Razorpay Order ──────────────────────────────────
  const razorpayOrder = await razorpay.orders.create({
    amount: totalPrice * 100, // Razorpay uses paise (1 INR = 100 paise)
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: {
      buyerName: req.user.name,
      buyerEmail: req.user.email,
    },
  });

  // ── Save order in database ────────────────────────────────
  const order = await Order.create({
    buyer: req.user._id,
    orderItems: validatedItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'razorpay',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    buyerNotes,
    paymentResult: {
      razorpayOrderId: razorpayOrder.id,
      status: 'created',
    },
  });

  // ── Update stock counts ────────────────────────────────────
  for (const item of validatedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { countInStock: -item.quantity },
    });
  }

  res.status(201).json({
    success: true,
    order,
    razorpayOrderId: razorpayOrder.id,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  });
});

// ── @route   POST /api/orders/:id/verify-payment ─────────────────────────────
// @desc    Verify Razorpay payment signature after payment
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  // ── Verify signature (security check) ─────────────────────
  // Razorpay sends a signature = HMAC(order_id + "|" + payment_id, secret)
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const isValid = expectedSignature === razorpaySignature;

  if (!isValid) {
    res.status(400);
    throw new Error('Payment verification failed - invalid signature');
  }

  // ── Update order status ────────────────────────────────────
  const order = await Order.findOneAndUpdate(
    { 'paymentResult.razorpayOrderId': razorpayOrderId },
    {
      isPaid: true,
      paidAt: new Date(),
      status: 'confirmed',
      paymentResult: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
        paidAt: new Date(),
      },
    },
    { new: true }
  );

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    order,
  });
});

// ── @route   GET /api/orders/myorders ─────────────────────────────────────────
// @desc    Get logged-in user's order history
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate('orderItems.product', 'name images category')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: orders.length, orders });
});

// ── @route   GET /api/orders/:id ──────────────────────────────────────────────
// @desc    Get single order by ID
// @access  Private (Owner or Admin)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'name email phone businessName')
    .populate('orderItems.product', 'name images category seller');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Only buyer or admin can view the order
  if (
    order.buyer._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.status(200).json({ success: true, order });
});

// ── @route   GET /api/orders ──────────────────────────────────────────────────
// @desc    Get all orders (Admin only)
// @access  Private (Admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('buyer', 'name email businessName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / limitNum),
    orders,
  });
});

// ── @route   PUT /api/orders/:id/status ───────────────────────────────────────
// @desc    Update order status (Admin)
// @access  Private (Admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, carrier, adminNotes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (carrier) order.carrier = carrier;
  if (adminNotes) order.adminNotes = adminNotes;

  // Mark as delivered if status is 'delivered'
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  await order.save();

  res.status(200).json({ success: true, order });
});

// ── @route   GET /api/orders/stats ────────────────────────────────────────────
// @desc    Get order statistics for admin dashboard
// @access  Private (Admin)
const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
      },
    },
  ]);

  const totalRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  res.status(200).json({
    success: true,
    stats,
    totalRevenue: totalRevenue[0]?.total || 0,
  });
});

module.exports = {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
};
