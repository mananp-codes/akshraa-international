/**
 * Authentication & Authorization Middleware
 * Protects routes and checks user roles
 */

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// ── Protect: Verify JWT token ─────────────────────────────────────────────────
// Use this middleware on any route that requires login
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header for Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    res.status(401);
    throw new Error('Not authorized - no token provided');
  }

  try {
    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized - user not found');
    }

    if (!req.user.isActive) {
      res.status(401);
      throw new Error('Account has been deactivated');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized - invalid token');
  }
});

// ── Authorize: Check user role ────────────────────────────────────────────────
// Use after 'protect' middleware
// Example: authorize('admin') or authorize('seller', 'admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }
    next();
  };
};

// ── Seller Approved: Check if seller is approved ─────────────────────────────
const sellerApproved = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'seller' && !req.user.isApproved) {
    res.status(403);
    throw new Error('Your seller account is pending approval from admin');
  }
  next();
});

module.exports = { protect, authorize, sellerApproved };
