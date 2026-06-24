/**
 * Product Routes
 * Public:  GET /api/products, GET /api/products/:id
 * Private: POST/PUT/DELETE (Seller/Admin)
 */

const express = require('express');
const router = express.Router();
const {
  getProducts,
  getSurplusDeals,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  deleteProductImage,
} = require('../controllers/productController');
const { protect, authorize, sellerApproved } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// ── Public Routes ─────────────────────────────────────────────────────────────
router.get('/', getProducts);                    // All products with filters
router.get('/surplus-deals', getSurplusDeals);   // Surplus deals for homepage
router.get('/featured', getFeaturedProducts);    // Featured products for homepage
router.get('/:id', getProductById);              // Single product detail

// ── Protected Routes ──────────────────────────────────────────────────────────
// Create product (Sellers & Admins only, seller must be approved)
router.post(
  '/',
  protect,
  authorize('seller', 'admin'),
  sellerApproved,
  upload.array('images', 5), // Allow up to 5 images
  createProduct
);

// Update product
router.put(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  upload.array('images', 5),
  updateProduct
);

// Delete product
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

// Delete specific product image
router.delete(
  '/:id/images/:publicId',
  protect,
  authorize('seller', 'admin'),
  deleteProductImage
);

// Add review (buyers only)
router.post('/:id/reviews', protect, authorize('buyer'), addReview);

module.exports = router;
