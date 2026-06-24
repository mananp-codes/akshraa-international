/**
 * User Routes (Admin & Seller-specific operations)
 */

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  approveUser,
  toggleUserStatus,
  deleteUser,
  getPendingSellers,
  getSellerDashboard,
  getAdminStats,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All user management routes require authentication
router.use(protect);

// ── Seller Routes ─────────────────────────────────────────────────────────────
router.get('/seller/dashboard', authorize('seller', 'admin'), getSellerDashboard);

// ── Admin Routes ──────────────────────────────────────────────────────────────
router.get('/admin/stats', authorize('admin'), getAdminStats);
router.get('/sellers/pending', authorize('admin'), getPendingSellers);
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin'), getUserById);
router.put('/:id/approve', authorize('admin'), approveUser);
router.put('/:id/activate', authorize('admin'), toggleUserStatus);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
