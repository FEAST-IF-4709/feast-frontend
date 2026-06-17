import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  ShoppingCart,
  ChefHat,
  BookOpen,
  Grid3x3,
  Building2,
  Users,
  Receipt,
  ShieldCheck,
  Store,
  Gift,
  LogOut,
  Layers,
} from 'lucide-react';
import api from '../api/client';
import { clearTokens, getRefreshToken, hasPermission, isSuperAdmin } from '../api/auth';

const SIDEBAR_GROUPS = [
  {
    label: null,
    superadminOnly: true,
    items: [
      { label: 'Brands', path: '/brands', icon: Layers, permission: null, superadminOnly: true },
    ],
  },
  {
    label: null,
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutGrid, permission: 'dashboard.view' },
      { label: 'Order', path: '/order', icon: ShoppingCart, permission: 'cashier.order.create' },
      { label: 'Kitchen', path: '/kitchen', icon: ChefHat, permission: 'kitchen.order.view' },
    ],
  },
  {
    label: 'Manajemen',
    items: [
      { label: 'Menu', path: '/menu', icon: BookOpen, permission: 'products.view' },
      { label: 'Tables', path: '/table', icon: Grid3x3, permission: 'tables.view' },
      { label: 'Outlets', path: '/outlets', icon: Building2, permission: 'outlet.view' },
      { label: 'Staff', path: '/staff', icon: Users, permission: 'staff.view' },
      { label: 'Orders', path: '/orders', icon: Receipt, permission: 'orders.view' },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { label: 'Roles', path: '/roles', icon: ShieldCheck, permission: 'rbac.role.view' },
      { label: 'Restaurant Profile', path: '/restaurant-profile', icon: Store, permission: null },
      { label: 'Loyalty & Voucher', path: '/marketing', icon: Gift, permission: null },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const visibleGroups = useMemo(() => {
    const superAdmin = isSuperAdmin();
    return SIDEBAR_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (superAdmin) return !!item.superadminOnly;
        if (item.superadminOnly) return false;
        return item.permission === null || hasPermission(item.permission);
      }),
    })).filter((group) => group.items.length > 0);
  // re-evaluate when route changes (permissions are in JWT, stable per session)
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <aside className="w-60 bg-white flex flex-col h-screen sticky top-0 font-vietnam z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
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
        className="flex-1 px-3 mt-2 overflow-y-auto"
      >
        {visibleGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-2' : ''}>
            {group.label && (
              <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-feast-dark-muted">
                {group.label}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
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
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
            </div>
          </div>
        ))}
      </motion.nav>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-3 pb-6 pt-2"
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
