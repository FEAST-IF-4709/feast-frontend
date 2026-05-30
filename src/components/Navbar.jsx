import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'About Us', path: '/' },
  { label: 'Our Brand', path: '/brand' },
  { label: 'Contact Us', path: '/contact' },
  { label: 'Career', path: '/career' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-jakarta ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            {/* TODO: Replace with actual FEAST logo asset */}
            <span className="text-2xl font-bold tracking-wider text-feast-dark font-jakarta">
              FEAST
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium font-vietnam transition-colors duration-200 relative pb-1 ${
                    isActive
                      ? 'text-feast-sunset'
                      : 'text-feast-dark-secondary hover:text-feast-sunset'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-feast-sunset rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>



          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-feast-dark hover:text-feast-sunset transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-white/98 backdrop-blur-md ${
          mobileOpen ? 'max-h-96 border-t border-feast-bg' : 'max-h-0'
        }`}
      >
        <div className="px-6 py-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-xl text-sm font-medium font-vietnam transition-colors ${
                  isActive
                    ? 'bg-feast-surface-lowest text-feast-sunset'
                    : 'text-feast-dark-secondary hover:bg-feast-surface-low hover:text-feast-sunset'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
