/**
 * Product Detail Page
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiTag, FiPackage, FiTruck, FiArrowLeft, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getProductById } from '../api/productApi';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StarRating from '../components/common/StarRating';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProductById(id);
        setProduct(data.product);
        setQuantity(data.product.moq); // Default to MOQ
      } catch (err) {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) { toast.error('Please login first'); return; }
    if (quantity < product.moq) { toast.error(`Minimum order is ${product.moq} ${product.unit}`); return; }
    addToCart(product, quantity);
    toast.success(`Added to cart! ✓`);
  };

  if (loading) return <LoadingSpinner text="Loading product..." />;
  if (!product) return <div className="text-center py-20 text-gray-400">Product not found</div>;

  const effectivePrice = product.discountedPrice || product.price;

  return (
    <div className="page-wrapper">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/products" className="flex items-center gap-1 hover:text-primary-600">
            <FiArrowLeft className="w-4 h-4" /> Products
          </Link>
          <span>/</span>
          <span className="text-primary-600">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── Image Gallery ────────────────────────── */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-gray-100 mb-3 aspect-square">
              <img
                src={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ─────────────────────────── */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-3">
              <span className="badge bg-primary-100 text-primary-700">{product.category}</span>
              {product.stockType === 'Surplus' && (
                <span className="badge-surplus">🔥 SURPLUS DEAL</span>
              )}
              {product.isFeatured && (
                <span className="badge bg-gold-100 text-gold-700">⭐ Featured</span>
              )}
            </div>

            <h1 className="font-heading text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <StarRating rating={product.rating} numReviews={product.numReviews} size="md" />

            {/* Price */}
            <div className="my-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary-600">
                  ₹{effectivePrice.toLocaleString()}
                </span>
                {product.discountedPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                    <span className="badge bg-green-100 text-green-700 text-sm">
                      {product.discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-gray-500 text-sm">per {product.unit} (excl. GST)</p>
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Min. Order Qty</div>
                <div className="font-semibold text-gray-800 flex items-center gap-1">
                  <FiTag className="text-primary-600 w-4 h-4" />
                  {product.moq} {product.unit}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Available Stock</div>
                <div className={`font-semibold flex items-center gap-1 ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <FiPackage className="w-4 h-4" />
                  {product.countInStock > 0 ? `${product.countInStock} ${product.unit}` : 'Out of Stock'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Stock Type</div>
                <div className="font-semibold text-gray-800">{product.stockType}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1">Seller</div>
                <div className="font-semibold text-gray-800 text-sm truncate">
                  {product.seller?.businessName || product.seller?.name}
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            {product.countInStock > 0 && (
              <div className="mb-5">
                <label className="label">Order Quantity ({product.unit})</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(product.moq, quantity - 10))} className="w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:border-primary-400 font-bold text-lg">−</button>
                  <input
                    type="number"
                    min={product.moq}
                    max={product.countInStock}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="input w-24 text-center font-semibold"
                  />
                  <button onClick={() => setQuantity(Math.min(product.countInStock, quantity + 10))} className="w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:border-primary-400 font-bold text-lg">+</button>
                  <span className="text-xs text-gray-500">Min: {product.moq}</span>
                </div>
                <p className="text-sm text-primary-600 font-medium mt-1">
                  Total: ₹{((effectivePrice * (quantity || 0)) || 0).toLocaleString()}
                </p>
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0}
              className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 rounded-xl"
            >
              <FiShoppingCart /> Add to Cart
            </button>

            {/* Shipping note */}
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 bg-green-50 px-4 py-3 rounded-xl">
              <FiTruck className="text-green-600" />
              Free shipping on orders above ₹10,000
            </div>
          </div>
        </div>

        {/* ── Product Details Tabs ─────────────────────────── */}
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Description */}
            <div className="card p-6">
              <h3 className="font-heading font-bold text-xl text-primary-600 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).some(k => product.specifications[k]) && (
              <div className="card p-6">
                <h3 className="font-heading font-bold text-xl text-primary-600 mb-4">Specifications</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value]) =>
                      value ? (
                        <tr key={key} className="border-b border-gray-100">
                          <td className="py-2 font-medium text-gray-700 capitalize w-40">{key}</td>
                          <td className="py-2 text-gray-600">{value}</td>
                        </tr>
                      ) : null
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
