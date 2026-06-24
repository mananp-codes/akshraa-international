/**
 * Order Routes
 * POST /api/orders              - Create order + Razorpay order
 * POST /api/orders/:id/verify   - Verify payment
 * GET  /api/orders/myorders     - Buyer's order history
 * GET  /api/orders/:id          - Single order (owner or admin)
 * GET  /api/orders              - All orders (admin)
 * PUT  /api/orders/:id/status   - Update status (admin)
 */

const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

// Buyer routes
router.post('/', createOrder);
router.post('/:id/verify-payment', verifyPayment);
router.get('/myorders', getMyOrders);

// Admin routes
router.get('/stats', authorize('admin'), getOrderStats);
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

// Single order (owner or admin - checked inside controller)
router.get('/:id', getOrderById);

module.exports = router;
