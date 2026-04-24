import React, { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import { motion } from 'framer-motion';
import { Search, Bell, Settings, TrendingUp, TrendingDown, Clock, MoreHorizontal, AlertTriangle } from 'lucide-react';

import kineticKitchenImg from './assets/Kinetic Kitchen Action.jpg';
import chefPlatingImg from './assets/Chef plating food.jpg';
import dynamicFoodImg from './assets/Dynamic food plating.jpg';

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState('This Week');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <>
      {/* Top Bar */}
      <header className="flex justify-between items-center px-8 py-5 bg-white sticky top-0 z-40">
        <h2 className="text-xl font-bold font-jakarta text-feast-dark">Analytics Overview</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-feast-dark-muted/50" />
            <input
              type="text"
              placeholder="Search metrics..."
              className="bg-feast-bg rounded-xl pl-9 pr-4 py-2.5 text-sm text-feast-dark font-vietnam placeholder-feast-dark-muted/40 focus:outline-none focus:ring-2 focus:ring-feast-sunset/20 w-52"
            />
          </div>
          <button className="relative p-2 text-feast-dark-muted hover:text-feast-dark transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-feast-sunset rounded-full" />
          </button>
          <button className="p-2 text-feast-dark-muted hover:text-feast-dark transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-8 py-6 space-y-6"
      >
        {/* Today's Heat */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-3xl font-bold font-jakarta text-feast-dark">Today's Heat</h1>
              <p className="text-feast-dark-muted text-sm mt-1">Real-time performance for your kitchen.</p>
            </div>
            <div className="flex bg-feast-bg rounded-xl p-1">
              {['Today', 'This Week', 'This Month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    timePeriod === period
                      ? 'bg-feast-sunset text-white shadow-sm'
                      : 'text-feast-dark-muted hover:text-feast-dark'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              title="Total Revenue"
              value="$12,450"
              change="+14.5%"
              isUp={true}
              subtitle="vs last week"
              iconColor="bg-feast-sunset/10 text-feast-sunset"
            />
            <StatCard
              title="Total Orders"
              value="342"
              change="+8.2%"
              isUp={true}
              subtitle="vs last week"
              iconColor="bg-feast-amber/10 text-feast-amber"
            />
            <StatCard
              title="Avg Prep Time"
              value="14m"
              change="-2.1m"
              isUp={true}
              subtitle="vs last week"
              iconColor="bg-feast-beetroot/10 text-feast-beetroot"
            />
          </div>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-jakarta text-feast-dark">Revenue & Orders Trend</h3>
            <button className="p-1 text-feast-dark-muted hover:text-feast-dark transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          {/* Simple Bar Chart */}
          <div className="flex items-end gap-4 h-48 px-4">
            {[
              { day: 'Mon', value: 40, orders: 35 },
              { day: 'Tue', value: 55, orders: 30 },
              { day: 'Wed', value: 35, orders: 50 },
              { day: 'Thu', value: 60, orders: 45 },
              { day: 'Fri', value: 70, orders: 55 },
              { day: 'Sat', value: 95, orders: 75 },
              { day: 'Sun', value: 50, orders: 40 },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 items-end justify-center" style={{ height: '160px' }}>
                  {/* Revenue bar */}
                  <div
                    className={`w-5 rounded-t-lg transition-all duration-500 ${
                      bar.day === 'Sat' ? 'bg-feast-sunset' : 'bg-feast-sunset/20'
                    }`}
                    style={{ height: `${bar.value}%` }}
                  />
                  {/* Orders bar */}
                  <div
                    className="w-5 bg-feast-bg rounded-t-lg transition-all duration-500"
                    style={{ height: `${bar.orders}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${bar.day === 'Sat' ? 'text-feast-sunset' : 'text-feast-dark-muted'}`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
          {/* Y-axis labels */}
          <div className="flex justify-between px-4 mt-2">
            <span className="text-xs text-feast-dark-muted">$0</span>
            <span className="text-xs text-feast-dark-muted">$1k</span>
            <span className="text-xs text-feast-dark-muted">$2k</span>
            <span className="text-xs text-feast-dark-muted">$3k</span>
          </div>
        </motion.div>

        {/* Bottom Row — Top Moving Items + Kitchen Load */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Moving Items */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold font-jakarta text-feast-dark">Top Moving Items</h3>
              <button className="text-feast-sunset text-xs font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              <TopItem
                name="Classic Smashburger"
                orders="124 orders today"
                price="$1,860"
                trending={true}
                img={kineticKitchenImg}
              />
              <TopItem
                name="Truffle Parm Fries"
                orders="98 orders today"
                price="$784"
                trending={false}
                img={chefPlatingImg}
              />
              <TopItem
                name="Nashville Hot Chicken"
                orders="85 orders today"
                price="$1,105"
                trending={false}
                img={dynamicFoodImg}
              />
            </div>
          </motion.div>

          {/* Kitchen Load */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold font-jakarta text-feast-dark">Kitchen Load</h3>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-feast-sunset">
                <span className="w-2 h-2 bg-feast-sunset rounded-full animate-pulse" />
                High Capacity
              </span>
            </div>
            <div className="space-y-5">
              <LoadBar label="Grill Station" percent={85} color="bg-feast-sunset" />
              <LoadBar label="Fryer Station" percent={60} color="bg-feast-amber" />
              <LoadBar label="Expo / Assembly" percent={92} color="bg-feast-sunset" />
            </div>

            {/* Bottleneck Alert */}
            <div className="mt-6 bg-feast-surface-lowest rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-feast-sunset flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-feast-dark">Bottleneck Alert</p>
                <p className="text-xs text-feast-dark-muted mt-1">
                  Expo station is nearing max capacity. Consider shifting prep staff to assembly.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

/* ── Sub-Components ── */

const StatCard = ({ title, value, change, isUp, subtitle, iconColor }) => (
  <div className="bg-white rounded-2xl p-5 relative group hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-feast-dark-muted uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold font-jakarta text-feast-dark mt-2">{value}</h3>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
        {isUp ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
      </div>
    </div>
    <div className="flex items-center gap-2 mt-3">
      <span className={`text-xs font-semibold flex items-center gap-0.5 ${isUp ? 'text-green-500' : 'text-red-400'}`}>
        {isUp ? '↗' : '↘'} {change}
      </span>
      <span className="text-xs text-feast-dark-muted">{subtitle}</span>
    </div>
  </div>
);

const TopItem = ({ name, orders, price, trending, img }) => (
  <div className="flex items-center gap-4">
    <img src={img} alt={name} className="w-12 h-12 rounded-xl object-cover" />
    <div className="flex-1">
      <h4 className="text-sm font-semibold text-feast-dark">{name}</h4>
      <p className="text-xs text-feast-dark-muted">{orders}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-bold text-feast-dark">{price}</p>
      {trending && (
        <span className="text-[10px] font-semibold text-feast-sunset">Trending</span>
      )}
    </div>
  </div>
);

const LoadBar = ({ label, percent, color }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-sm text-feast-dark-secondary font-medium">{label}</span>
      <span className={`text-sm font-bold ${percent >= 80 ? 'text-feast-sunset' : 'text-feast-dark'}`}>
        {percent}%
      </span>
    </div>
    <div className="w-full h-2.5 bg-feast-bg rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

export default Dashboard;