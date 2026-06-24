/**
 * ProductCard Component
 * Displays product in grid/list view with surplus badge
 */

import { Link } from 'react-router-dom';
import { FiShoppingCart, FiTag } from 'react-icons/fi';
import StarRating from '../common/StarRating';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const isInCart = useCartStore((state) => state.items.some((item) => item.product._id === product._id));
  const user = useAuthStore((state) => state.user);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent link navigation
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    addToCart(product);
    toast.success(`Added ${product.moq} ${product.unit} to cart!`);
  };

  const effectivePrice = product.discountedPrice || product.price;
  const isSurplus = product.stockType === 'Surplus';

  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className={`card overflow-hidden h-full flex flex-col rounded-xl ${isSurplus ? 'surplus-card' : ''}`}>

        {/* Product Image */}
        <div className="relative overflow-hidden h-52 bg-paper-200">
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isSurplus && (
              <span className="badge bg-primary-900/90 text-gold-300 text-[11px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wide backdrop-blur-sm">
                Surplus
              </span>
            )}
            {product.isSurplusDeal && product.discountedPrice && (
              <span className="badge bg-gold-500 text-primary-900 text-[11px] font-bold px-2.5 py-1 rounded-md">
                {product.discountPercentage}% OFF
              </span>
            )}
            {product.isFeatured && !isSurplus && (
              <span className="badge bg-primary-600/90 text-white text-[11px] px-2.5 py-1 rounded-md backdrop-blur-sm">
                Featured
              </span>
            )}
          </div>
          {/* Out of stock overlay */}
          {product.countInStock === 0 && (
            <div className="absolute inset-0 bg-ink/55 flex items-center justify-center">
              <span className="text-white font-semibold bg-red-600 px-3 py-1 rounded-lg text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1">
          <span className="text-[11px] text-primary-600 font-semibold uppercase tracking-wide mb-1.5">
            {product.subCategory || product.category}
          </span>

          <h3 className="font-semibold text-ink text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          <StarRating rating={product.rating} numReviews={product.numReviews} />

          {/* Price */}
          <div className="mt-3 mb-2">
            {product.discountedPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary-600 font-heading">
                  ₹{product.discountedPrice.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.price.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-primary-600 font-heading">
                ₹{product.price.toLocaleString()}
              </span>
            )}
            <p className="text-xs text-gray-500">per {product.unit}</p>
          </div>

          {/* MOQ */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <FiTag className="w-3 h-3" />
            <span>Min. order: {product.moq} {product.unit}</span>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isInCart
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'btn-primary'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FiShoppingCart className="w-4 h-4" />
            {isInCart ? 'In Cart ✓' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
