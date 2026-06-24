/**
 * About Page
 */

import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiGlobe, FiShield, FiTrendingUp, FiStar } from 'react-icons/fi';

const AboutPage = () => (
  <div className="page-wrapper">

    {/* Hero */}
    <section className="bg-primary-600 text-white py-20">
      <div className="container-custom text-center">
        <div className="w-20 h-20 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-primary-900 font-heading font-bold text-3xl">A</span>
        </div>
        <h1 className="font-heading text-5xl font-bold mb-4">Akshraa International</h1>
        <p className="text-gold-400 text-xl mb-2">Delivering Quality Textiles Worldwide</p>
        <p className="text-primary-200 max-w-2xl mx-auto mt-4">
          Founded by <strong className="text-white">Rahul Pandey</strong>, Akshraa International is India's
          premier B2B textile platform connecting manufacturers, exporters, and bulk buyers across the globe.
        </p>
      </div>
    </section>

    {/* Mission */}
    <section className="py-16 bg-white">
      <div className="container-custom max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-3xl font-bold text-primary-600 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We believe every textile business deserves access to premium quality products at
              competitive B2B prices. Our platform bridges the gap between Indian textile
              manufacturers and global buyers.
            </p>
            <p className="text-gray-600 leading-relaxed">
              From premium home textiles to ready-made apparel, and even surplus/clearance stock,
              we ensure nothing goes to waste and every buyer gets the best value.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🏭', label: 'Manufacturing', desc: 'Direct from Indian mills' },
              { icon: '✈️', label: 'Export Ready', desc: '50+ countries served' },
              { icon: '♻️', label: 'Zero Waste', desc: 'Surplus stock clearance' },
              { icon: '🤝', label: 'B2B Focused', desc: 'Bulk orders welcome' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-semibold text-gray-700 text-sm">{item.label}</p>
                <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <h2 className="font-heading text-3xl font-bold text-primary-600 text-center mb-10">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: FiShield, title: 'Quality Assured', desc: 'Every product meets strict quality standards before listing. We personally verify our sellers.' },
            { icon: FiGlobe, title: 'Global Reach', desc: 'We ship to 50+ countries with reliable logistics partners and full export documentation.' },
            { icon: FiTrendingUp, title: 'Competitive Pricing', desc: 'Direct manufacturer pricing with bulk discounts. No middlemen, maximum savings for you.' },
            { icon: FiStar, title: 'Trusted Platform', desc: '500+ businesses rely on Akshraa International for their regular textile procurement.' },
            { icon: FiPhone, title: '24/7 Support', desc: 'Our dedicated B2B support team is always ready to help with your order requirements.' },
            { icon: FiShield, title: 'Secure Payments', desc: 'Razorpay-powered secure payments with full GST invoicing for every transaction.' },
          ].map(item => (
            <div key={item.title} className="card p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Contact */}
    <section className="py-16 bg-white">
      <div className="container-custom max-w-3xl">
        <h2 className="font-heading text-3xl font-bold text-primary-600 text-center mb-10">Get In Touch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { icon: FiMail, label: 'Email', value: 'rahul@akshraa.com', href: 'mailto:rahul@akshraa.com' },
            { icon: FiPhone, label: 'Phone', value: '+91-9876543210', href: 'tel:+919876543210' },
            { icon: FiMapPin, label: 'Location', value: 'Surat, Gujarat, India', href: '#' },
          ].map(item => (
            <a key={item.label} href={item.href} className="card p-6 hover:border-primary-300 border border-transparent transition-colors">
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-5 h-5 text-gold-600" />
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
              <p className="font-semibold text-gray-700">{item.value}</p>
            </a>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/register" className="btn-primary px-10 py-3.5 text-base rounded-xl">
            Start Buying / Selling Today
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;
