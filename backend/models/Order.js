/**
 * Order Model
 * Tracks all B2B purchase orders with Razorpay payment integration
 */

const mongoose = require('mongoose');

// Sub-schema for individual items in an order
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },      // Snapshot of product name at time of order
  image: { type: String },                      // Snapshot of product image
  price: { type: Number, required: true },      // Price per unit at time of order
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'pieces' },
});

const orderSchema = new mongoose.Schema(
  {
    // ── Who placed the order ─────────────────────────────────
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Order Items ──────────────────────────────────────────
    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },

    // ── Shipping Address ─────────────────────────────────────
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
      pincode: { type: String, required: true },
    },

    // ── Pricing Breakdown ────────────────────────────────────
    itemsPrice: { type: Number, required: true, default: 0 },   // Subtotal
    shippingPrice: { type: Number, required: true, default: 0 }, // Shipping cost
    taxPrice: { type: Number, required: true, default: 0 },      // GST/Tax
    totalPrice: { type: Number, required: true, default: 0 },    // Grand total

    // ── Payment (Razorpay) ────────────────────────────────────
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'bank_transfer', 'cod'],
      default: 'razorpay',
    },

    paymentResult: {
      razorpayOrderId: String,   // Razorpay order ID
      razorpayPaymentId: String, // Razorpay payment ID (after success)
      razorpaySignature: String, // For payment verification
      status: String,            // 'created', 'paid', 'failed'
      paidAt: Date,
    },

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    // ── Order Status ─────────────────────────────────────────
    status: {
      type: String,
      enum: [
        'pending',      // Order placed, awaiting payment
        'confirmed',    // Payment received
        'processing',   // Being packed/prepared
        'shipped',      // Dispatched
        'delivered',    // Received by buyer
        'cancelled',    // Cancelled
        'refunded',     // Money returned
      ],
      default: 'pending',
    },

    // Tracking information
    trackingNumber: { type: String },
    carrier: { type: String },

    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },

    // ── Notes ────────────────────────────────────────────────
    buyerNotes: { type: String, maxlength: 500 },  // Special instructions from buyer
    adminNotes: { type: String, maxlength: 500 },  // Internal notes

    // ── GST Invoice ──────────────────────────────────────────
    invoiceNumber: { type: String },
    gstDetails: {
      buyerGST: String,
      sellerGST: String,
    },
  },
  {
    timestamps: true,
  }
);

// ── Middleware: Generate invoice number before saving ────────────────────────
orderSchema.pre('save', function (next) {
  if (this.isNew && !this.invoiceNumber) {
    // Format: AKS-YEAR-RANDOMNUMBER (e.g., AKS-2024-001234)
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    this.invoiceNumber = `AKS-${year}-${random}`;
  }
  next();
});

// ── Index for performance ─────────────────────────────────────────────────────
orderSchema.index({ buyer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
