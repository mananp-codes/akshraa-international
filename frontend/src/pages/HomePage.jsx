/**
 * HomePage
 * Hero + Categories + Featured + Surplus Deals
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiStar, FiTrendingUp, FiShield, FiGlobe } from 'react-icons/fi';
import { getFeaturedProducts, getSurplusDeals } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

// ── Category Data ──────────────────────────────────────────────────────────────
const categories = [
  {
    name: 'Home Textiles',
    emoji: '🏠',
    desc: 'Placemats, Runners, Quilts, Curtains',
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-800',
    path: '/products?category=Home Textiles',
  },
  {
    name: 'Apparel',
    emoji: '👕',
    desc: 'Kurtas, Garments, Ready-to-Ship',
    color: 'bg-purple-50 border-purple-200',
    textColor: 'text-purple-800',
    path: '/products?category=Apparel',
  },
  {
    name: 'Surplus Materials',
    emoji: '♻️',
    desc: 'Threads, Fabric Remnants, Clearance',
    color: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-800',
    path: '/products?category=Surplus Materials',
  },
];

// ── Trust Badges ───────────────────────────────────────────────────────────────
const trustFeatures = [
  { icon: FiShield, title: 'Quality Assured', desc: 'Every product meets export quality standards' },
  { icon: FiGlobe, title: 'Global Shipping', desc: 'We ship to 50+ countries worldwide' },
  { icon: FiTrendingUp, title: 'B2B Pricing', desc: 'Competitive bulk pricing for businesses' },
  { icon: FiStar, title: 'Trusted by 500+', desc: 'Businesses trust Akshraa International' },
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
      <section
        className="relative min-h-[90vh] flex items-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="hero-overlay absolute inset-0" />
        <div className="container-custom relative z-10 py-20">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-400/40 text-gold-300 text-sm px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
              India's Premier B2B Textile Platform
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              Akshraa<br />
              <span className="text-gold-gradient bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
                International
              </span>
            </h1>
            <p className="text-xl text-gray-200 mb-10 max-w-xl leading-relaxed">
              Delivering Quality Textiles Worldwide — Premium home textiles,
              apparel, and surplus deals for global B2B buyers.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-lg">
              <input
                type="text"
                placeholder="Search placemats, kurtas, fabric..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-xl text-gray-800 outline-none text-sm shadow-lg"
              />
              <button type="submit" className="btn-gold px-6 py-3.5 rounded-xl whitespace-nowrap">
                Search
              </button>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-gold flex items-center gap-2 px-8 py-3.5 rounded-xl text-base">
                Browse Products <FiArrowRight />
              </Link>
              <Link to="/products?stockType=Surplus" className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-colors">
                🔥 View Surplus Deals
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-8 mt-12 text-white/80 text-sm">
              <div><span className="text-gold-400 font-bold text-2xl">500+</span><br />Happy Clients</div>
              <div><span className="text-gold-400 font-bold text-2xl">50+</span><br />Countries Served</div>
              <div><span className="text-gold-400 font-bold text-2xl">10K+</span><br />Products Shipped</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRUST FEATURES
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-primary-600 text-white py-10">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustFeatures.map((feat) => (
              <div key={feat.title} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <feat.icon className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feat.title}</h3>
                  <p className="text-xs text-primary-200 mt-0.5">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CATEGORIES SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Quality textiles for every B2B need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link key={cat.name} to={cat.path} className="group">
                <div className={`border-2 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 ${cat.color} group-hover:-translate-y-1`}>
                  <div className="text-6xl mb-4">{cat.emoji}</div>
                  <h3 className={`font-heading font-bold text-xl mb-2 ${cat.textColor}`}>
                    {cat.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">{cat.desc}</p>
                  <span className={`inline-flex items-center gap-1 text-sm font-medium ${cat.textColor}`}>
                    Browse Products <FiArrowRight />
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
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full mb-3 font-medium">
                🔥 Limited Stock Available
              </div>
              <h2 className="section-title mb-0">Surplus Deals</h2>
              <p className="text-gray-500 mt-1">Clearance prices on premium quality leftover stock</p>
            </div>
            <Link
              to="/products?stockType=Surplus"
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              See All Deals <FiArrowRight />
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
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="section-title mb-0">Featured Products</h2>
              <p className="text-gray-500 mt-1">Our best-selling textile products</p>
            </div>
            <Link to="/products" className="btn-outline flex items-center gap-2 whitespace-nowrap">
              View All <FiArrowRight />
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
      <section className="py-20 bg-primary-600 text-white text-center">
        <div className="container-custom max-w-2xl">
          <h2 className="font-heading text-4xl font-bold mb-4">
            Ready to Place a <span className="text-gold-400">Bulk Order?</span>
          </h2>
          <p className="text-primary-200 text-lg mb-8">
            Join 500+ businesses that trust Akshraa International for their textile needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-gold px-8 py-3.5 rounded-xl text-base">
              Get Started Free
            </Link>
            <Link to="/products" className="px-8 py-3.5 rounded-xl text-base bg-white/15 border border-white/30 hover:bg-white/25 transition-colors">
              Browse Catalogue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
