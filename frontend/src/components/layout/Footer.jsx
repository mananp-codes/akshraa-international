/**
 * Footer Component
 */

import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => (
  <footer className="bg-primary-900 text-gray-300 mt-auto">
    <div className="container-custom py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
              <span className="text-primary-900 font-heading font-bold text-lg">A</span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-lg">Akshraa International</h3>
              <p className="text-gold-400 text-xs">Delivering Quality Textiles Worldwide</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
            India's trusted B2B textile platform. Premium quality products,
            competitive pricing, and reliable global shipping.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <FiMail className="text-gold-400" />
              <span>rahul@akshraa.com</span>
            </div>
            <div className="flex items-center gap-2">
              <FiPhone className="text-gold-400" />
              <span>+91-9876543210</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin className="text-gold-400" />
              <span>Surat, Gujarat, India</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'All Products', path: '/products' },
              { label: 'Surplus Deals', path: '/products?stockType=Surplus' },
              { label: 'Home Textiles', path: '/products?category=Home Textiles' },
              { label: 'Apparel', path: '/products?category=Apparel' },
              { label: 'About Us', path: '/about' },
            ].map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="hover:text-gold-400 transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="font-semibold text-white mb-4">Account</h4>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Login', path: '/login' },
              { label: 'Register as Buyer', path: '/register' },
              { label: 'Become a Seller', path: '/register?role=seller' },
              { label: 'My Orders', path: '/orders' },
              { label: 'Cart', path: '/cart' },
            ].map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="hover:text-gold-400 transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Akshraa International. All rights reserved.</p>
        <p>Built with ❤️ in India | Owner: Rahul Pandey</p>
      </div>
    </div>
  </footer>
);

export default Footer;
