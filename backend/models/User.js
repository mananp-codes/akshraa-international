/**
 * User Model
 * Handles buyers, sellers, and admin accounts
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries by default
    },

    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
    },

    // Seller-specific: admin must approve before seller can list products
    isApproved: {
      type: Boolean,
      default: function () {
        // Buyers are auto-approved; sellers need admin approval
        return this.role === 'buyer' || this.role === 'admin';
      },
    },

    // Business information (for B2B verification)
    businessName: {
      type: String,
      trim: true,
    },

    businessAddress: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: 'India' },
      pincode: String,
    },

    phone: {
      type: String,
      trim: true,
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    avatar: {
      type: String,
      default: '', // Cloudinary URL
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Track last login for analytics
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Middleware: Hash password before saving ───────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (or is new)
  if (!this.isModified('password')) return next();

  // Generate salt and hash password (10 rounds is a good balance of security/speed)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Method: Compare entered password with hashed password ────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Method: Generate JWT token ───────────────────────────────────────────────
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },  // Payload
    process.env.JWT_SECRET,             // Secret key
    { expiresIn: process.env.JWT_EXPIRE || '30d' } // Expiration
  );
};

module.exports = mongoose.model('User', userSchema);
