import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="site-footer" className="bg-feast-dark text-white font-vietnam">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold font-jakarta tracking-wider mb-4">FEAST</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Food Ecosystem Alliance & Smart Technology. Uniting the F&B ecosystem through culinary innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-5">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', path: '/' },
                { label: 'Our Brand', path: '/brand' },
                { label: 'Contact Us', path: '/contact' },
                { label: 'Career', path: '/career' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-feast-amber text-sm transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-5">Connect</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Mail size={16} className="text-feast-sunset flex-shrink-0" />
                concierge@feast.eco
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Phone size={16} className="text-feast-sunset flex-shrink-0" />
                +1 (555) 867-5309
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <MapPin size={16} className="text-feast-sunset flex-shrink-0 mt-0.5" />
                <span>
                  100 Culinary Avenue, Suite 400<br />
                  Saffron Tower, New York, NY 10011
                </span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-5">Partnership</h4>
            <p className="text-gray-400 text-sm mb-5">Interested in joining the FEAST ecosystem? Get in touch with our team.</p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-2.5 bg-feast-sunset text-white text-sm font-semibold rounded-full hover:bg-feast-sunset-dark transition-all duration-200 hover:shadow-lg hover:shadow-feast-sunset/30"
            >
              Contact Us
              <ArrowUpRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} FEAST — Food Ecosystem Alliance & Smart Technology. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-gray-500 text-xs hover:text-gray-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-gray-500 text-xs hover:text-gray-300 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
