/**
 * Akshraa International - Express Server
 * Entry point for the backend API
 */

// Load environment variables FIRST (before any other imports that use them)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Import Routes ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

// ── Connect to MongoDB Atlas ──────────────────────────────────────────────────
connectDB();

// ── Initialize Express App ────────────────────────────────────────────────────
const app = express();

// ── Security Middleware ────────────────────────────────────────────────────────
// Helmet adds security headers to all responses
app.use(helmet());

// Rate limiting: max 100 requests per 15 minutes per IP
// Prevents brute force and DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ── CORS Configuration ────────────────────────────────────────────────────────
// Allow requests from frontend URL only
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000', // Alternative dev port
      'http://localhost:5174',
    ];

    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));           // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// ── Logger (Development only) ─────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Colorful request logging in dev mode
}

// ── Health Check ──────────────────────────────────────────────────────────────
// Simple endpoint to verify the server is running (used by Render, etc.)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Akshraa International API is running! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);        // Authentication endpoints
app.use('/api/products', productRoutes); // Product CRUD + search
app.use('/api/orders', orderRoutes);     // Orders + Razorpay
app.use('/api/users', userRoutes);       // User management (admin)

// ── Root Info ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Akshraa International API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users',
    },
    docs: 'https://github.com/your-repo/akshraa-international#api-docs',
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
// Catch all unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// Must be LAST middleware - catches all errors from controllers
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  🌟 AKSHRAA INTERNATIONAL - Backend API Server');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  ✅ Server running on port: ${PORT}`);
  console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`  🏥 Health Check: http://localhost:${PORT}/health`);
  console.log('══════════════════════════════════════════════════════\n');
});

// Handle unhandled promise rejections (e.g., DB connection failure)
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
