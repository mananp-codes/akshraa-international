/**
 * Database Seeder
 * Seeds sample data for development and testing
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// ── Sample Users ──────────────────────────────────────────────────────────────
const users = [
  {
    name: 'Admin Akshraa',
    email: process.env.ADMIN_EMAIL || 'admin@akshraa.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin',
    isApproved: true,
    businessName: 'Akshraa International',
    phone: '+91-9876543210',
  },
  {
    name: 'Rahul Pandey',
    email: 'rahul@akshraa.com',
    password: 'Seller@123',
    role: 'seller',
    isApproved: true,
    businessName: 'Akshraa International',
    phone: '+91-9876543211',
    gstNumber: '27AAAAA0000A1Z5',
    businessAddress: {
      street: '123 Textile Market',
      city: 'Surat',
      state: 'Gujarat',
      country: 'India',
      pincode: '395003',
    },
  },
  {
    name: 'Priya Sharma',
    email: 'buyer@example.com',
    password: 'Buyer@123',
    role: 'buyer',
    isApproved: true,
    businessName: 'Sharma Exports',
    phone: '+91-9876543212',
    businessAddress: {
      street: '456 Fashion Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
    },
  },
];

// ── Sample Products ───────────────────────────────────────────────────────────
const getSampleProducts = (sellerId) => [
  {
    name: 'Premium Cotton Placemats Set',
    description:
      'Elegant cotton placemats perfect for restaurants and hotels. Available in bulk with consistent quality. Machine washable and long-lasting. Ideal for B2B orders for hospitality industry.',
    category: 'Home Textiles',
    subCategory: 'Placemats',
    price: 250,
    moq: 50,
    unit: 'pieces',
    stockType: 'Regular',
    countInStock: 500,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=800',
        publicId: 'sample_placemat_1',
      },
    ],
    specifications: {
      material: '100% Pure Cotton',
      dimensions: '45cm x 30cm',
      weight: '150 GSM',
      color: 'Ivory White',
      washCare: 'Machine wash at 40°C',
      origin: 'India',
    },
    tags: ['placemats', 'cotton', 'home textiles', 'restaurant'],
    isFeatured: true,
    seller: sellerId,
    rating: 4.5,
    numReviews: 12,
  },
  {
    name: 'Luxury Embroidered Table Runner',
    description:
      'Hand-embroidered table runners with intricate Indian motifs. Perfect for export markets and luxury hospitality. Made from premium fabric with gold thread work.',
    category: 'Home Textiles',
    subCategory: 'Table Runners',
    price: 450,
    moq: 30,
    unit: 'pieces',
    stockType: 'Regular',
    countInStock: 200,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        publicId: 'sample_runner_1',
      },
    ],
    specifications: {
      material: 'Silk Blend',
      dimensions: '180cm x 35cm',
      weight: '200 GSM',
      color: 'Gold & Maroon',
      washCare: 'Dry clean only',
      origin: 'India',
    },
    tags: ['table runner', 'embroidered', 'luxury', 'export'],
    isFeatured: true,
    seller: sellerId,
    rating: 4.8,
    numReviews: 8,
  },
  {
    name: 'Cotton Cushion Cover with Kantha Work',
    description:
      'Handcrafted cushion covers featuring traditional Kantha embroidery. Bulk orders available for interior designers and retailers. Each piece is uniquely handcrafted.',
    category: 'Home Textiles',
    subCategory: 'Cushion Covers',
    price: 320,
    moq: 24,
    unit: 'pieces',
    stockType: 'Regular',
    countInStock: 360,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800',
        publicId: 'sample_cushion_1',
      },
    ],
    specifications: {
      material: '100% Cotton',
      dimensions: '45cm x 45cm',
      weight: '180 GSM',
      color: 'Multicolor',
      washCare: 'Hand wash cold',
      origin: 'West Bengal, India',
    },
    tags: ['cushion covers', 'kantha', 'handmade', 'cotton'],
    isFeatured: true,
    seller: sellerId,
    rating: 4.6,
    numReviews: 15,
  },
  {
    name: 'Premium Winter Quilt - Hotel Grade',
    description:
      'Hotel-grade cotton quilts with excellent warmth retention. Used by 5-star hotels across India. Bulk ordering available with custom sizing options.',
    category: 'Home Textiles',
    subCategory: 'Quilts',
    price: 1200,
    moq: 10,
    unit: 'pieces',
    stockType: 'Regular',
    countInStock: 150,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
        publicId: 'sample_quilt_1',
      },
    ],
    specifications: {
      material: 'Cotton fill, Cotton cover',
      dimensions: '200cm x 220cm (Double)',
      weight: '700 GSM',
      color: 'White',
      washCare: 'Machine wash gentle',
      origin: 'India',
    },
    tags: ['quilt', 'hotel', 'winter', 'cotton'],
    isFeatured: false,
    seller: sellerId,
    rating: 4.7,
    numReviews: 20,
  },
  {
    name: 'Readymade Cotton Kurta (Bulk)',
    description:
      'Ready-to-ship cotton kurtas for corporate gifting and retail. Available in all sizes S-XXL. Minimal branding available. Perfect for corporate orders.',
    category: 'Apparel',
    subCategory: 'Kurtas',
    price: 350,
    moq: 100,
    unit: 'pieces',
    stockType: 'Regular',
    countInStock: 1000,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800',
        publicId: 'sample_kurta_1',
      },
    ],
    specifications: {
      material: '100% Cotton',
      dimensions: 'S, M, L, XL, XXL',
      weight: '160 GSM',
      color: 'White / Off-White',
      washCare: 'Machine wash',
      origin: 'India',
    },
    tags: ['kurta', 'cotton', 'apparel', 'bulk', 'corporate'],
    isFeatured: true,
    seller: sellerId,
    rating: 4.3,
    numReviews: 25,
  },
  // ── SURPLUS PRODUCTS ──────────────────────────────────────
  {
    name: 'Surplus Cotton Thread Lot - Premium',
    description:
      '🔥 SURPLUS DEAL: Leftover cotton threads from completed export orders. High quality, consistent color. Perfect for textile manufacturers and embroidery units. Limited stock - grab before it\'s gone!',
    category: 'Surplus Materials',
    subCategory: 'Threads',
    price: 800,
    discountedPrice: 480,    // 40% discount
    moq: 10,
    unit: 'kg',
    stockType: 'Surplus',
    countInStock: 200,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618047-3f3e5e00b8c2?w=800',
        publicId: 'sample_thread_1',
      },
    ],
    specifications: {
      material: '100% Mercerized Cotton',
      weight: '40/2 Count',
      color: 'Assorted Colors',
      origin: 'India',
    },
    tags: ['threads', 'surplus', 'cotton', 'embroidery'],
    isFeatured: false,
    isSurplusDeal: true,
    seller: sellerId,
    rating: 4.4,
    numReviews: 7,
  },
  {
    name: 'Fabric Remnants Bundle - Linen Mix',
    description:
      '🔥 SURPLUS DEAL: Premium linen fabric remnants from luxury order. Ideal for cushions, bags, and small home décor items. Minimum 20 meters per piece. Excellent quality at clearance price.',
    category: 'Surplus Materials',
    subCategory: 'Fabric Remnants',
    price: 1500,
    discountedPrice: 850,    // 43% discount
    moq: 5,
    unit: 'kg',
    stockType: 'Surplus',
    countInStock: 80,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        publicId: 'sample_fabric_1',
      },
    ],
    specifications: {
      material: 'Linen-Cotton Blend',
      dimensions: '60 inches wide',
      weight: '220 GSM',
      color: 'Beige / Natural',
      origin: 'India',
    },
    tags: ['fabric', 'linen', 'remnants', 'surplus', 'clearance'],
    isFeatured: false,
    isSurplusDeal: true,
    seller: sellerId,
    rating: 4.5,
    numReviews: 5,
  },
  {
    name: 'Surplus Curtain Fabric - Jacquard',
    description:
      '🔥 SURPLUS DEAL: High-quality Jacquard weave curtain fabric leftover from hotel project. Perfect for interior designers and fabric retailers. Rich texture with premium finish.',
    category: 'Surplus Materials',
    subCategory: 'Excess Materials',
    price: 2200,
    discountedPrice: 1200,
    moq: 10,
    unit: 'meters',
    stockType: 'Surplus',
    countInStock: 300,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        publicId: 'sample_curtain_fabric_1',
      },
    ],
    specifications: {
      material: 'Jacquard Weave Polyester-Cotton',
      dimensions: '56 inches wide',
      weight: '280 GSM',
      color: 'Deep Teal',
      washCare: 'Dry clean recommended',
      origin: 'India',
    },
    tags: ['curtain', 'jacquard', 'surplus', 'fabric', 'hotel'],
    isFeatured: false,
    isSurplusDeal: true,
    seller: sellerId,
    rating: 4.6,
    numReviews: 3,
  },
];

// ── Main Seeder Function ──────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seeder...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users (passwords hashed automatically by User model)
    const createdUsers = await User.insertMany(users);
    console.log(`👤 Created ${createdUsers.length} users`);

    // Find seller user
    const seller = createdUsers.find((u) => u.role === 'seller');

    // Create products with seller ID
    const products = getSampleProducts(seller._id);
    const createdProducts = await Product.insertMany(products);
    console.log(`📦 Created ${createdProducts.length} products`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('─────────────────────────────────────────');
    console.log('🔑 Login Credentials:');
    console.log(`   Admin:  admin@akshraa.com / Admin@123456`);
    console.log(`   Seller: rahul@akshraa.com / Seller@123`);
    console.log(`   Buyer:  buyer@example.com / Buyer@123`);
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error.message);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
