import React from 'react';
import { Play, TrendingUp, Mail, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const MarketingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <header className="flex justify-between items-center px-8 py-5 bg-feast-bg sticky top-0 z-40">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-feast-amber mb-1">
            Audience Engagement
          </p>
          <h2 className="text-3xl font-bold font-jakarta text-feast-dark">Marketing</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-feast-surface-low text-feast-dark font-semibold text-sm rounded-xl hover:bg-gray-200 transition-colors">
            New Voucher
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#f66a3d] text-white font-semibold text-sm rounded-xl hover:bg-[#e0582d] transition-colors shadow-sm">
            <Play size={14} fill="currentColor" /> Create Campaign
          </button>
        </div>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Row */}
        <div className="lg:col-span-2">
          {/* Main Hero Card */}
          <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} className="bg-white rounded-3xl p-8 relative overflow-hidden shadow-sm h-full">
            {/* Decorative circle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-feast-surface-low rounded-full translate-x-1/3" />
            
            <div className="relative z-10">
              <span className="inline-block bg-[#fff7e6] text-feast-amber text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                <ClockIcon /> Scheduled for tomorrow
              </span>
              <h3 className="text-2xl font-bold font-jakarta text-feast-dark mb-3">
                Summer Tasting Menu Reveal
              </h3>
              <p className="text-sm text-feast-dark-muted leading-relaxed max-w-md mb-8">
                Push notification reaching 12,400 gold and silver tier members, inviting them for early booking access.
              </p>
              
              <div className="flex gap-12">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-feast-dark-muted mb-1">Target Audience</p>
                  <p className="text-sm font-bold text-feast-dark">12.4k Members</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-feast-dark-muted mb-1">Channel</p>
                  <p className="text-sm font-bold text-feast-dark">Push & Email</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Conversion Card */}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-[#fb7c4a] rounded-3xl p-6 text-white relative overflow-hidden shadow-sm h-[130px] flex flex-col justify-center">
            <TrendingUp size={64} className="absolute -right-4 -top-4 text-white/10" />
            <p className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">30-Day Conversion</p>
            <h3 className="text-4xl font-bold font-jakarta mb-1">8.4%</h3>
            <p className="text-[10px] font-medium opacity-80 flex items-center gap-1">
              ↑ +1.2% from last month
            </p>
          </motion.div>

          {/* Vouchers Card */}
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-[#e9e9e9] rounded-3xl p-6 relative overflow-hidden shadow-sm h-[130px] flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-feast-dark-muted mb-2">Total Active Vouchers</p>
            <h3 className="text-4xl font-bold font-jakarta text-feast-dark mb-1">1,248</h3>
            <p className="text-[10px] font-medium text-feast-dark-muted">
              Redeemed this week: 342
            </p>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="lg:col-span-2">
          {/* Recent Campaigns */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-jakarta text-feast-dark">Recent Campaigns</h3>
              <button className="text-xs font-semibold text-[#fb7c4a] hover:underline">View All</button>
            </div>
            
            <div className="space-y-6">
              {/* Campaign 1 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#fdf3f3] flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-[#e54b4b]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-feast-dark">Weekend Brunch Special</h4>
                    <span className="bg-feast-surface-low text-feast-dark-muted text-[10px] font-bold uppercase px-2 py-0.5 rounded">Sent</span>
                  </div>
                  <p className="text-xs text-feast-dark-muted mb-2">Targeted: All active users in last 30 days.</p>
                  <div className="flex gap-4 text-[10px] text-feast-dark-muted font-medium">
                    <span className="flex items-center gap-1">👥 8.2k Delivered</span>
                    <span className="flex items-center gap-1">👁️ 12% Open Rate</span>
                  </div>
                </div>
              </div>

              {/* Campaign 2 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f4f7f2] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={16} className="text-[#659e41]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-feast-dark">New Menu Item Alert</h4>
                    <span className="bg-feast-surface-low text-feast-dark-muted text-[10px] font-bold uppercase px-2 py-0.5 rounded">Sent</span>
                  </div>
                  <p className="text-xs text-feast-dark-muted mb-2">Targeted: Users who ordered pasta previously.</p>
                  <div className="flex gap-4 text-[10px] text-feast-dark-muted font-medium">
                    <span className="flex items-center gap-1">👥 3.1k Delivered</span>
                    <span className="flex items-center gap-1">👁️ 18% Open Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div>
          {/* Membership Distribution */}
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-jakarta text-feast-dark">Membership Distribution</h3>
              <button className="text-feast-dark-muted hover:text-feast-dark"><MoreHorizontal size={16} /></button>
            </div>
            
            <div className="space-y-6">
              <DistributionBar label="Gold Tier" members="1,204 members" color="bg-feast-amber" percent={20} dotColor="bg-feast-amber" />
              <DistributionBar label="Silver Tier" members="4,532 members" color="bg-[#a0a4aa]" percent={50} dotColor="bg-[#a0a4aa]" />
              <DistributionBar label="Bronze Tier" members="8,921 members" color="bg-[#fb7c4a]" percent={85} dotColor="bg-[#fb7c4a]" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

const DistributionBar = ({ label, members, color, percent, dotColor }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-sm font-semibold text-feast-dark">{label}</span>
      </div>
      <span className="text-[10px] text-feast-dark-muted">{members}</span>
    </div>
    <div className="w-full h-2 bg-feast-bg rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
    </div>
  </div>
);

const ClockIcon = () => (
  <svg className="w-3 h-3 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default MarketingPage;
