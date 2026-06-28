/**
 * HomePage
 * Hero + Categories + Featured + Surplus Deals
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiStar, FiTrendingUp, FiShield, FiGlobe, FiSearch } from 'react-icons/fi';
import { getFeaturedProducts, getSurplusDeals } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ── Category Data ──────────────────────────────────────────────────────────────
const categories = [
  {
    name: 'Home Textiles',
    desc: 'Placemats, runners, quilts & curtains',
    swatch: 'from-primary-700 via-primary-600 to-primary-500',
    path: '/products?category=Home Textiles',
  },
  {
    name: 'Apparel',
    desc: 'Kurtas, garments & ready-to-ship lines',
    swatch: 'from-[#4a3f6b] via-[#6c5a99] to-[#9a86c9]',
    path: '/products?category=Apparel',
  },
  {
    name: 'Surplus Materials',
    desc: 'Threads, remnants & clearance lots',
    swatch: 'from-[#b3791e] via-gold-500 to-gold-300',
    path: '/products?category=Surplus Materials',
  },
];

// ── Trust Badges ───────────────────────────────────────────────────────────────
const trustFeatures = [
  { icon: FiShield, title: 'Quality assured', desc: 'Every product meets export standards' },
  { icon: FiGlobe, title: 'Global shipping', desc: 'Delivering to 50+ countries' },
  { icon: FiTrendingUp, title: 'B2B pricing', desc: 'Competitive bulk rates for businesses' },
  { icon: FiStar, title: 'Trusted by 500+', desc: 'Businesses sourcing through Akshraa' },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [surplusDeals, setSurplusDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, surplusRes] = await Promise.all([
          getFeaturedProducts(),
          getSurplusDeals(),
        ]);
        setFeatured(featuredRes.data.products);
        setSurplusDeals(surplusRes.data.products);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="page-wrapper">

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative bg-primary-900 weave-texture overflow-hidden">
        <div className="container-custom relative z-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">

            {/* Left: copy */}
            <div className="max-w-xl">
              <div className="eyebrow mb-6">
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full" />
                B2B Textile Sourcing · Since Surat
              </div>

              <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.08] tracking-tight">
                Quality textiles,
                <br />
                <span className="text-gold-gradient">sourced direct</span>
                <br />
                from India.
              </h1>
              <p className="text-lg text-primary-100/80 mb-10 leading-relaxed">
                Home textiles, apparel and surplus fabric — priced for bulk buyers,
                inspected for export quality, and shipped worldwide.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-lg">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search placemats, kurtas, fabric…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-ink outline-none text-sm shadow-lg border border-white/10"
                  />
                </div>
                <button type="submit" className="btn-gold px-6 py-3.5 rounded-xl whitespace-nowrap">
                  Search
                </button>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-gold flex items-center gap-2 px-8 py-3.5 rounded-xl text-base">
                  Browse catalogue <FiArrowRight />
                </Link>
                <Link to="/products?stockType=Surplus" className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base bg-white/8 text-white border border-white/15 hover:bg-white/14 transition-colors">
                  View surplus deals
                </Link>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-10 mt-14 pt-8 border-t border-white/10">
                {[
                  { value: '500+', label: 'Buyers served' },
                  { value: '50+', label: 'Countries shipped to' },
                  { value: '10K+', label: 'Units exported' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="font-heading text-gold-400 font-bold text-3xl leading-none">{stat.value}</div>
                    <div className="text-primary-100/60 text-sm mt-1.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: swatch grid — fabric sample wall */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {(featured.length > 0 ? featured.slice(0, 4) : Array.from({ length: 4 })).map((p, i) => (
                <div
                  key={p?._id || i}
                  className={`swatch-card aspect-[4/5] bg-primary-700 ${i % 3 === 0 ? 'translate-y-4' : ''}`}
                >
                  {p ? (
                    <img src={p.images?.[0]?.url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-700 to-primary-800 animate-pulse" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink/70 to-transparent">
                    {p && <p className="text-white text-xs font-medium truncate">{p.name}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="thread-divider" style={{ background: 'repeating-linear-gradient(90deg, rgba(245,196,56,0.35) 0, rgba(245,196,56,0.35) 6px, transparent 6px, transparent 12px)' }} />
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRUST FEATURES
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-10 border-b border-paper-200">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustFeatures.map((feat) => (
              <div key={feat.title} className="flex items-start gap-3.5">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                  <feat.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-ink">{feat.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CATEGORIES SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-paper-100">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="eyebrow justify-center mb-3">
              <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" /> Catalogue
            </div>
            <h2 className="section-title">Shop by category</h2>
            <p className="section-subtitle">Three product lines, sourced and inspected for bulk buyers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link key={cat.name} to={cat.path} className="group">
                <div className={`swatch-card h-64 bg-gradient-to-br ${cat.swatch} flex flex-col justify-end p-6 transition-transform duration-300 group-hover:-translate-y-1.5`}>
                  <div className="weave-texture absolute inset-0" />
                  <h3 className="font-heading font-bold text-2xl text-white mb-1.5 relative z-10">
                    {cat.name}
                  </h3>
                  <p className="text-white/75 text-sm mb-4 relative z-10">{cat.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-300 relative z-10">
                    Browse products <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SURPLUS DEALS SECTION (Highlighted)
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <div className="eyebrow mb-3">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Limited stock
              </div>
              <h2 className="section-title mb-0">Surplus deals</h2>
              <p className="text-gray-500 mt-1">Clearance prices on premium leftover stock</p>
            </div>
            <Link
              to="/products?stockType=Surplus"
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              See all deals <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading deals..." />
          ) : surplusDeals.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No surplus deals right now. Check back soon!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {surplusDeals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-paper-100">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <div className="eyebrow mb-3">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" /> Best sellers
              </div>
              <h2 className="section-title mb-0">Featured products</h2>
              <p className="text-gray-500 mt-1">A selection of our most-ordered lines</p>
            </div>
            <Link to="/products" className="btn-outline flex items-center gap-2 whitespace-nowrap">
              View all <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading products..." />
          ) : featured.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No featured products yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-primary-900 weave-texture text-center relative overflow-hidden">
        <div className="thread-divider absolute top-0 inset-x-0" style={{ background: 'repeating-linear-gradient(90deg, rgba(245,196,56,0.35) 0, rgba(245,196,56,0.35) 6px, transparent 6px, transparent 12px)' }} />
        <div className="container-custom max-w-2xl relative z-10">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">
            Ready to place a <span className="text-gold-gradient">bulk order?</span>
          </h2>
          <p className="text-primary-100/70 text-lg mb-10">
            Join 500+ businesses sourcing textiles through Akshraa International.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-gold px-8 py-3.5 rounded-xl text-base">
              Create a free account
            </Link>
            <Link to="/products" className="px-8 py-3.5 rounded-xl text-base bg-white/8 text-white border border-white/15 hover:bg-white/14 transition-colors">
              Browse catalogue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
