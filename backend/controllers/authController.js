/**
 * Auth Controller
 * Handles user registration, login, and profile management
 */

const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// ── Helper: Send token response ───────────────────────────────────────────────
// Creates JWT, sets cookie, and sends response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      businessName: user.businessName,
      avatar: user.avatar,
    },
  });
};

// ── @route   POST /api/auth/register ─────────────────────────────────────────
// @desc    Register a new user
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, businessName, phone, gstNumber } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('Email already registered. Please login instead.');
  }

  // Validate role (only buyer or seller allowed from registration)
  const allowedRoles = ['buyer', 'seller'];
  const userRole = allowedRoles.includes(role) ? role : 'buyer';

  // Create new user (password hashed automatically by User model middleware)
  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    businessName,
    phone,
    gstNumber,
    // Sellers need admin approval; buyers are auto-approved
    isApproved: userRole === 'buyer',
  });

  // Send welcome response with token
  sendTokenResponse(user, 201, res);
});

// ── @route   POST /api/auth/login ─────────────────────────────────────────────
// @desc    Login user and return JWT token
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user and include password (normally excluded)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    res.status(401);
    throw new Error('Your account has been deactivated. Contact support.');
  }

  // Compare entered password with hashed password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Update last login time
   await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

  sendTokenResponse(user, 200, res);
});

// ── @route   GET /api/auth/me ─────────────────────────────────────────────────
// @desc    Get current logged-in user profile
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the 'protect' middleware
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

// ── @route   PUT /api/auth/updateprofile ──────────────────────────────────────
// @desc    Update user profile details
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  // Only allow updating safe fields (not role, password, etc.)
  const allowedFields = ['name', 'phone', 'businessName', 'businessAddress', 'gstNumber'];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,       // Return updated user
    runValidators: true, // Run schema validators
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// ── @route   PUT /api/auth/changepassword ─────────────────────────────────────
// @desc    Change user password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  // Set new password (will be hashed by pre-save middleware)
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

module.exports = { register, login, getMe, updateProfile, changePassword };
