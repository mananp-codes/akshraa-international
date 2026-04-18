/**
 * Product Controller
 * Full CRUD for products with filtering, search, and image uploads
 */

const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// ── @route   GET /api/products ────────────────────────────────────────────────
// @desc    Get all products with filtering, search, sorting, pagination
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,       // Search term
    category,      // Filter by category
    subCategory,   // Filter by sub-category
    stockType,     // 'Regular' or 'Surplus'
    minPrice,
    maxPrice,
    isFeatured,
    isSurplusDeal,
    sortBy,        // 'price_asc', 'price_desc', 'newest', 'rating'
    page = 1,
    limit = 12,
  } = req.query;

  // Build MongoDB query object
  const query = { isActive: true };

  // Full-text search (uses the text index we created on name, description, tags)
  if (keyword) {
    query.$text = { $search: keyword };
  }

  // Category filters
  if (category) query.category = category;
  if (subCategory) query.subCategory = subCategory;
  if (stockType) query.stockType = stockType;
  if (isFeatured === 'true') query.isFeatured = true;
  if (isSurplusDeal === 'true') query.isSurplusDeal = true;

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Sorting options
  let sortOptions = {};
  switch (sortBy) {
    case 'price_asc':   sortOptions = { price: 1 }; break;
    case 'price_desc':  sortOptions = { price: -1 }; break;
    case 'rating':      sortOptions = { rating: -1 }; break;
    case 'newest':
    default:            sortOptions = { createdAt: -1 }; break;
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query with pagination
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('seller', 'name businessName') // Include seller info
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean(), // .lean() returns plain JS objects (faster)
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    products,
  });
});

// ── @route   GET /api/products/surplus ────────────────────────────────────────
// @desc    Get surplus/deal products for the homepage section
// @access  Public
const getSurplusDeals = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    isSurplusDeal: true,
    stockType: 'Surplus',
    countInStock: { $gt: 0 }, // Only in-stock products
  })
    .populate('seller', 'name businessName')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  res.status(200).json({ success: true, products });
});

// ── @route   GET /api/products/featured ──────────────────────────────────────
// @desc    Get featured products for homepage
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate('seller', 'name businessName')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  res.status(200).json({ success: true, products });
});

// ── @route   GET /api/products/:id ────────────────────────────────────────────
// @desc    Get single product by ID
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name businessName phone email')
    .populate('reviews.user', 'name');

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({ success: true, product });
});

// ── @route   POST /api/products ───────────────────────────────────────────────
// @desc    Create a new product (Seller/Admin only)
// @access  Private (Seller, Admin)
const createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, category, subCategory,
    price, discountedPrice, moq, unit,
    stockType, countInStock, tags,
    specifications, isFeatured, isSurplusDeal, surplusExpiry,
  } = req.body;

  // Build images array from uploaded files (via Cloudinary)
  const images = req.files
    ? req.files.map((file) => ({
        url: file.path,          // Cloudinary URL
        publicId: file.filename, // Cloudinary public ID
      }))
    : [];

  if (images.length === 0) {
    res.status(400);
    throw new Error('At least one product image is required');
  }

  const product = await Product.create({
    name, description, category, subCategory,
    price: Number(price),
    discountedPrice: discountedPrice ? Number(discountedPrice) : undefined,
    moq: Number(moq) || 10,
    unit,
    stockType,
    countInStock: Number(countInStock) || 0,
    images,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
    specifications: specifications ? JSON.parse(specifications) : {},
    isFeatured: isFeatured === 'true',
    isSurplusDeal: isSurplusDeal === 'true',
    surplusExpiry,
    seller: req.user._id,
  });

  res.status(201).json({ success: true, product });
});

// ── @route   PUT /api/products/:id ────────────────────────────────────────────
// @desc    Update a product
// @access  Private (Owner Seller or Admin)
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Only the seller who created it (or admin) can update
  if (
    product.seller.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('You are not authorized to update this product');
  }

  // If new images uploaded, add them to existing images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));
    req.body.images = [...(product.images || []), ...newImages];
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, product });
});

// ── @route   DELETE /api/products/:id ─────────────────────────────────────────
// @desc    Delete a product
// @access  Private (Owner Seller or Admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Only the seller who created it (or admin) can delete
  if (
    product.seller.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('You are not authorized to delete this product');
  }

  // Delete all images from Cloudinary to save storage space
  for (const image of product.images) {
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
  }

  await product.deleteOne();

  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

// ── @route   POST /api/products/:id/reviews ───────────────────────────────────
// @desc    Add or update a review for a product
// @access  Private (Buyers who have ordered)
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user already reviewed this product
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    // Update existing review
    alreadyReviewed.rating = Number(rating);
    alreadyReviewed.comment = comment;
  } else {
    // Add new review
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });
  }

  // Recalculate average rating
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.numReviews;

  await product.save();

  res.status(200).json({ success: true, message: 'Review added successfully' });
});

// ── @route   DELETE /api/products/:id/images/:publicId ───────────────────────
// @desc    Delete a specific image from a product
// @access  Private (Owner Seller or Admin)
const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (
    product.seller.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { publicId } = req.params;
  // Delete from Cloudinary
  await cloudinary.uploader.destroy(publicId);

  // Remove from product images array
  product.images = product.images.filter((img) => img.publicId !== publicId);
  await product.save();

  res.status(200).json({ success: true, message: 'Image deleted' });
});

module.exports = {
  getProducts,
  getSurplusDeals,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  deleteProductImage,
};
