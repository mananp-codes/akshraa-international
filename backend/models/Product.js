/**
 * Product Model
 * Covers both regular textile products and surplus/leftover stock
 */

const mongoose = require('mongoose');

// Sub-schema for product reviews
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    // ── Basic Info ──────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },

    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    // ── Category System ─────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Home Textiles',   // Placemats, table runners, cushion covers, quilts, curtains
        'Apparel',         // Ready-made garments
        'Surplus Materials', // Threads, fabric remnants, excess materials
      ],
    },

    // Sub-category for more specific filtering
    subCategory: {
      type: String,
      enum: [
        // Home Textiles
        'Placemats', 'Table Runners', 'Cushion Covers', 'Quilts', 'Curtains',
        // Apparel
        'Shirts', 'Trousers', 'Kurtas', 'Sarees', 'Ready-made Garments',
        // Surplus Materials
        'Threads', 'Fabric Remnants', 'Excess Materials', 'Raw Fabric',
      ],
    },

    // ── Pricing ─────────────────────────────────────────────
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // Discounted price (for surplus deals)
    discountedPrice: {
      type: Number,
      min: [0, 'Discounted price cannot be negative'],
    },

    // ── B2B Specific ─────────────────────────────────────────
    // Minimum Order Quantity - essential for B2B
    moq: {
      type: Number,
      required: [true, 'Minimum Order Quantity is required'],
      min: [1, 'MOQ must be at least 1'],
      default: 10,
    },

    // Unit of measurement (pieces, meters, kg, etc.)
    unit: {
      type: String,
      enum: ['pieces', 'meters', 'kg', 'dozen', 'set'],
      default: 'pieces',
    },

    // ── Stock ────────────────────────────────────────────────
    stockType: {
      type: String,
      enum: ['Regular', 'Surplus'],
      default: 'Regular',
    },

    countInStock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },

    // ── Images ──────────────────────────────────────────────
    // Array of Cloudinary URLs
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String }, // Cloudinary public ID for deletion
      },
    ],

    // ── Specifications ──────────────────────────────────────
    // Flexible key-value pairs for textile specs
    specifications: {
      material: String,       // e.g., "100% Cotton"
      dimensions: String,     // e.g., "45cm x 30cm"
      weight: String,         // e.g., "200 GSM"
      color: String,
      pattern: String,
      washCare: String,
      origin: { type: String, default: 'India' },
    },

    // ── Tags for Search ─────────────────────────────────────
    tags: [{ type: String, lowercase: true, trim: true }],

    // ── Ratings ─────────────────────────────────────────────
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],

    // ── Seller Info ──────────────────────────────────────────
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Visibility ───────────────────────────────────────────
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // For surplus deals highlighting
    isSurplusDeal: { type: Boolean, default: false },

    // Surplus expiry (after which it's no longer discounted)
    surplusExpiry: { type: Date },
  },
  {
    timestamps: true,
    // Virtual fields are included in JSON responses
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: Discount percentage ─────────────────────────────────────────────
productSchema.virtual('discountPercentage').get(function () {
  if (this.discountedPrice && this.price > 0) {
    return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
  }
  return 0;
});

// ── Virtual: Effective price (discounted if available) ───────────────────────
productSchema.virtual('effectivePrice').get(function () {
  return this.discountedPrice || this.price;
});

// ── Indexes for performance ───────────────────────────────────────────────────
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Full-text search
productSchema.index({ category: 1 });
productSchema.index({ stockType: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isSurplusDeal: 1 });

module.exports = mongoose.model('Product', productSchema);
