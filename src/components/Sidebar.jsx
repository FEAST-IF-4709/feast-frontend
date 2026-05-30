import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  ShoppingCart,
  Store,
  ShieldCheck,
  ChefHat,
  Megaphone,
  TableProperties,
  LogOut,
} from 'lucide-react';
import api from '../api/client';
import { clearTokens, getRefreshToken, hasPermission } from '../api/auth';

const allSidebarItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutGrid, permission: 'dashboard.view' },
  { label: 'Order', path: '/order', icon: ShoppingCart, permission: 'cashier.order.create' },
  { label: 'Restaurant Profile', path: '/restaurant-profile', icon: Store, permission: null },
  { label: 'Roles', path: '/roles', icon: ShieldCheck, permission: 'rbac.role.view' },
  { label: 'Kitchen', path: '/kitchen', icon: ChefHat, permission: 'kitchen.order.view' },
  { label: 'Marketing', path: '/marketing', icon: Megaphone, permission: null },
  { label: 'Table', path: '/table', icon: TableProperties, permission: 'tables.view' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Filter sidebar items based on user permissions
  const sidebarItems = useMemo(() => {
    return allSidebarItems.filter((item) => {
      if (!item.permission) return true; // No permission required = always show
      return hasPermission(item.permission);
    });
  }, [location.pathname]); // re-evaluate when route changes

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch {
      // Even if logout API fails, we still clear local tokens
    } finally {
      clearTokens();
      navigate('/login');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <aside className="w-60 bg-white flex flex-col h-screen sticky top-0 font-vietnam z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="px-6 pt-6 pb-4"
      >
        <Link to="/dashboard" className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-10 h-10 bg-feast-sunset rounded-xl flex items-center justify-center shadow-md shadow-feast-sunset/20"
          >
            <ChefHat size={20} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-base font-bold font-jakarta text-feast-dark leading-tight">
              FEAST Portal
            </h1>
            <p className="text-[10px] uppercase tracking-[0.15em] text-feast-dark-muted font-medium">
              The Kinetic Kitchen
            </p>
          </div>
        </Link>
      </motion.div>

      {/* Navigation */}
      <motion.nav 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 px-3 mt-2 space-y-1"
      >
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.div key={item.path} variants={itemVariants}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 relative ${
                  isActive
                    ? 'text-white'
                    : 'text-feast-dark-secondary hover:text-feast-dark hover:bg-feast-bg'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-feast-sunset rounded-xl shadow-md shadow-feast-sunset/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* Logout */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-3 pb-6"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-feast-dark-muted hover:bg-red-50 hover:text-red-500 transition-colors duration-200 w-full"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>Logout</span>
        </motion.button>
      </motion.div>
    </aside>
  );
};

export default Sidebar;