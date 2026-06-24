/**
 * Auth Routes
 * POST /api/auth/register  - Register new user
 * POST /api/auth/login     - Login user
 * GET  /api/auth/me        - Get current user
 * PUT  /api/auth/updateprofile - Update profile
 * PUT  /api/auth/changepassword - Change password
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes (no login required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (login required)
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/changepassword', protect, changePassword);

module.exports = router;
