/**
 * Products Listing Page
 * With filters, search, pagination
 */

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';
import { getProducts } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORIES = ['Home Textiles', 'Apparel', 'Surplus Materials'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });
  const [showFilters, setShowFilters] = useState(false);

  // Filter state (synced with URL params)
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    stockType: searchParams.get('stockType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
  });

  // Bug fix: Use a ref to track first mount so URL sync doesn't fire on initial render
  const isFirstRender = useRef(true);

  // Bug fix: Separate URL sync effect from data-fetch effect to avoid stale closure issues
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Bug fix: Correctly remove empty string values (previous logic had broken operator precedence)
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== '')
        );
        const { data } = await getProducts(cleanFilters);
        setProducts(data.products);
        setPagination({ total: data.total, pages: data.pages, currentPage: data.currentPage });
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ keyword: '', category: '', stockType: '', minPrice: '', maxPrice: '', sortBy: 'newest', page: 1 });
  };

  const hasActiveFilters = filters.category || filters.stockType || filters.minPrice || filters.maxPrice || filters.keyword;

  return (
    <div className="page-wrapper">
      <div className="container-custom py-8">

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-primary-600">
            {filters.category || filters.stockType === 'Surplus' ? (
              <>
                {filters.stockType === 'Surplus' ? '🔥 Surplus Deals' : filters.category}
              </>
            ) : 'All Products'}
          </h1>
          <p className="text-gray-500 mt-1">{pagination.total} products found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar Filters (Desktop) ──────────────────── */}
          <aside className={`lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="card p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                    <FiX className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-5">
                <label className="label text-xs">Search</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    className="input pl-9 text-sm"
                    placeholder="Search products..."
                    value={filters.keyword}
                    onChange={(e) => updateFilter('keyword', e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-5">
                <label className="label text-xs">Category</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" checked={!filters.category} onChange={() => updateFilter('category', '')} className="accent-primary-600" />
                    <span className="text-sm text-gray-600">All Categories</span>
                  </label>
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat}
                        onChange={() => updateFilter('category', cat)}
                        className="accent-primary-600"
                      />
                      <span className="text-sm text-gray-600">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Type */}
              <div className="mb-5">
                <label className="label text-xs">Stock Type</label>
                <div className="space-y-2">
                  {[['', 'All'], ['Regular', 'Regular'], ['Surplus', '🔥 Surplus Deals']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="stockType"
                        checked={filters.stockType === val}
                        onChange={() => updateFilter('stockType', val)}
                        className="accent-primary-600"
                      />
                      <span className="text-sm text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <label className="label text-xs">Price Range (₹)</label>
                <div className="flex gap-2">
                  <input
                    className="input text-sm"
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                  />
                  <input
                    className="input text-sm"
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Content ───────────────────────────────── */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <button
                className="lg:hidden flex items-center gap-2 btn-outline text-sm py-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter /> Filters
                {hasActiveFilters && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
              </button>

              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="input w-auto text-sm ml-auto"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <LoadingSpinner text="Loading products..." />
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">📦</p>
                <h3 className="text-lg font-semibold text-gray-600">No products found</h3>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn-primary mt-4">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          p === pagination.currentPage
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
