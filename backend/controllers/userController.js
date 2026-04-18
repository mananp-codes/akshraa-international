/**
 * User Controller
 * Admin functions: manage users, approve sellers
 */

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// ── @route   GET /api/users ───────────────────────────────────────────────────
// @desc    Get all users (Admin only)
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isApproved, page = 1, limit = 20 } = req.query;

  const query = {};
  if (role) query.role = role;
  if (isApproved !== undefined) query.isApproved = isApproved === 'true';

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pages: Math.ceil(total / limitNum),
    users,
  });
});

// ── @route   GET /api/users/:id ───────────────────────────────────────────────
// @desc    Get user by ID (Admin only)
// @access  Private (Admin)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({ success: true, user });
});

// ── @route   PUT /api/users/:id/approve ───────────────────────────────────────
// @desc    Approve or reject a seller account (Admin only)
// @access  Private (Admin)
const approveUser = asyncHandler(async (req, res) => {
  const { isApproved } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'seller') {
    res.status(400);
    throw new Error('Can only approve/reject seller accounts');
  }

  user.isApproved = isApproved;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: isApproved
      ? `Seller "${user.name}" has been approved`
      : `Seller "${user.name}" has been rejected`,
    user,
  });
});

// ── @route   PUT /api/users/:id/activate ──────────────────────────────────────
// @desc    Activate or deactivate a user account (Admin only)
// @access  Private (Admin)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deactivating admin accounts
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot deactivate admin accounts');
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User account ${user.isActive ? 'activated' : 'deactivated'}`,
    user,
  });
});

// ── @route   DELETE /api/users/:id ────────────────────────────────────────────
// @desc    Delete a user (Admin only)
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete admin accounts');
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// ── @route   GET /api/users/sellers/pending ───────────────────────────────────
// @desc    Get sellers awaiting approval (Admin only)
// @access  Private (Admin)
const getPendingSellers = asyncHandler(async (req, res) => {
  const sellers = await User.find({
    role: 'seller',
    isApproved: false,
    isActive: true,
  })
    .select('-password')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: sellers.length,
    sellers,
  });
});

// ── @route   GET /api/users/seller/dashboard ──────────────────────────────────
// @desc    Get seller dashboard stats (products, orders)
// @access  Private (Seller)
const getSellerDashboard = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  // Get seller's products
  const products = await Product.find({ seller: sellerId, isActive: true });

  // Get orders containing seller's products
  const sellerProductIds = products.map((p) => p._id);

  const [totalProducts, outOfStock, surplusProducts] = await Promise.all([
    Product.countDocuments({ seller: sellerId, isActive: true }),
    Product.countDocuments({ seller: sellerId, isActive: true, countInStock: 0 }),
    Product.countDocuments({ seller: sellerId, isActive: true, stockType: 'Surplus' }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalProducts,
      outOfStock,
      surplusProducts,
      inStockProducts: totalProducts - outOfStock,
    },
    recentProducts: products
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5),
  });
});

// ── @route   GET /api/users/admin/stats ───────────────────────────────────────
// @desc    Get overall platform statistics (Admin only)
// @access  Private (Admin)
const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBuyers,
    totalSellers,
    pendingSellers,
    totalProducts,
    totalOrders,
    revenueResult,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'buyer', isActive: true }),
    User.countDocuments({ role: 'seller', isActive: true }),
    User.countDocuments({ role: 'seller', isApproved: false, isActive: true }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalBuyers,
      totalSellers,
      pendingSellers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
    },
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  approveUser,
  toggleUserStatus,
  deleteUser,
  getPendingSellers,
  getSellerDashboard,
  getAdminStats,
};
