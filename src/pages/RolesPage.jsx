import React from 'react';
import { ShieldCheck, Pencil, Plus, CircleDot } from 'lucide-react';
import { motion } from 'framer-motion';

const roles = [
  {
    title: 'System Administrator',
    subtitle: 'Highest Privilege Level',
    description:
      'Unrestricted access to all modules, including global system settings, billing, and complete staff oversight.',
    permissions: ['All Modules', 'Billing & Finance', 'Role Management'],
    activeUsers: 2,
    avatarColors: ['bg-feast-sunset', 'bg-feast-amber'],
    iconBg: 'bg-feast-dark',
  },
  {
    title: 'Branch Manager',
    subtitle: 'Operational Oversight',
    description:
      'Manages day-to-day branch operations, inventory adjustments, order approvals, and staff scheduling.',
    permissions: ['Inventory Control', 'Order Overrides', 'System Config'],
    activeUsers: 8,
    avatarColors: ['bg-feast-beetroot'],
    iconBg: 'bg-feast-dark-secondary',
  },
  {
    title: 'Kitchen Staff',
    subtitle: 'Execution & Prep',
    description:
      'Access focused on kitchen display systems (KDS), recipe viewing, and marking ticket statuses.',
    permissions: ['KDS Access', 'Recipe Book (Read)', 'Pricing Edit'],
    activeUsers: 24,
    avatarColors: ['bg-feast-amber'],
    iconBg: 'bg-feast-dark-muted',
  },
];

const RolesPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <>
      {/* Top Bar */}
      <header className="flex justify-between items-center px-8 py-5 bg-white sticky top-0 z-40">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-feast-dark-muted">
            Access Control
          </p>
          <h2 className="text-2xl font-bold font-jakarta text-feast-dark mt-1">Role Matrix</h2>
        </div>
        <button
          id="add-role-btn"
          className="flex items-center gap-2 px-5 py-2.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-full hover:bg-feast-sunset-dark transition-all duration-200 hover:shadow-lg hover:shadow-feast-sunset/20"
        >
          <Plus size={16} />
          Add New Role
        </button>
      </header>

      <div className="px-8 py-6">
        {/* Role Cards Grid */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {roles.map((role, i) => (
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              key={i}
              className="bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 group relative border border-transparent hover:border-feast-bg"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${role.iconBg} rounded-xl flex items-center justify-center`}>
                    <ShieldCheck size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-jakarta text-feast-dark">{role.title}</h3>
                    <p className="text-xs text-feast-dark-muted">{role.subtitle}</p>
                  </div>
                </div>
                <button className="p-1.5 text-feast-dark-muted hover:text-feast-sunset rounded-lg hover:bg-feast-bg transition-colors opacity-0 group-hover:opacity-100">
                  <Pencil size={14} />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-feast-dark-muted leading-relaxed mb-5">
                {role.description}
              </p>

              {/* Key Permissions */}
              <div className="mb-5">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-feast-dark-muted mb-3">
                  Key Permissions
                </h4>
                <div className="space-y-2">
                  {role.permissions.map((perm, pi) => (
                    <div key={pi} className="flex items-center gap-2">
                      <CircleDot size={12} className="text-feast-sunset flex-shrink-0" />
                      <span className="text-xs font-medium text-feast-dark-secondary">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Users */}
              <div className="flex items-center gap-2 pt-4 border-t border-feast-bg">
                <div className="flex -space-x-2">
                  {role.avatarColors.map((color, ai) => (
                    <div
                      key={ai}
                      className={`w-7 h-7 ${color} rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold`}
                    >
                      {String.fromCharCode(65 + ai)}
                    </div>
                  ))}
                  {role.activeUsers > role.avatarColors.length && (
                    <div className="w-7 h-7 bg-feast-bg rounded-full border-2 border-white flex items-center justify-center text-feast-dark-muted text-[10px] font-bold">
                      +{role.activeUsers - role.avatarColors.length}
                    </div>
                  )}
                </div>
                <span className="text-xs text-feast-dark-muted ml-1">
                  {role.activeUsers} Active Users
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );
};

export default RolesPage;
