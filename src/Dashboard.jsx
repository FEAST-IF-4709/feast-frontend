import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Settings, TrendingUp, TrendingDown, MoreHorizontal, AlertTriangle, Loader2 } from 'lucide-react';
import { getBrandId, getOutletId, getAccessToken } from './api/auth';
import { connectDashboard } from './api/websocket';
import { analyticsApi } from './api/analytics';
import { recommendationsApi } from './api/recommendations';
import { formatIDR } from './utils/format';

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState('This Week');
  const [summaryData, setSummaryData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef(null);

  // Calculate date range based on selected period
  const getDateRange = (period) => {
    const now = new Date();
    const to = now.toISOString().split('T')[0];
    let from;
    if (period === 'Today') {
      from = to;
    } else if (period === 'This Week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      from = d.toISOString().split('T')[0];
    } else {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      from = d.toISOString().split('T')[0];
    }
    return { from, to };
  };

  const fetchDashboard = async () => {
    try {
      const { from, to } = getDateRange(timePeriod);
      const brandId = getBrandId();

      const days = timePeriod === 'Today' ? 1 : timePeriod === 'This Week' ? 7 : 30;
      const [summaryRes, chartRes, popularRes] = await Promise.allSettled([
        analyticsApi.getDashboardSummary({ date_from: from, date_to: to }),
        analyticsApi.getDashboardDailyChart({ days }),
        brandId
          ? recommendationsApi.getPopular(brandId, { limit: 5 })
          : Promise.resolve({ data: { data: [] } }),
      ]);

      if (summaryRes.status === 'fulfilled') setSummaryData(summaryRes.value.data.data);
      if (chartRes.status === 'fulfilled') setChartData(chartRes.value.data.data || []);
      if (popularRes.status === 'fulfilled') setPopularItems(popularRes.value.data.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchDashboard();
  }, [timePeriod]);

  // WebSocket for real-time updates
  useEffect(() => {
    const outletId = getOutletId();
    const token = getAccessToken();
    if (outletId && token) {
      wsRef.current = connectDashboard(outletId, token, {
        onMessage: (data) => {
          // Refetch on any dashboard event
          if (data.event) fetchDashboard();
        },
      });
    }
    return () => wsRef.current?.disconnect();
  }, []);

  const formatCurrency = (value) => {
    const num = parseFloat(value || 0);
    if (num >= 1000000) return `Rp${(num / 1000000).toFixed(1)}jt`;
    if (num >= 1000) return `Rp${(num / 1000).toFixed(0)}rb`;
    return formatIDR(num);
  };

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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-feast-sunset" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(summaryData?.total_revenue)}
                change={`${summaryData?.settled_orders || 0} settled`}
                isUp={true}
                subtitle={`${summaryData?.pending_orders || 0} pending`}
                iconColor="bg-feast-sunset/10 text-feast-sunset"
              />
              <StatCard
                title="Total Orders"
                value={summaryData?.total_orders?.toString() || '0'}
                change={`${summaryData?.settled_orders || 0} settled`}
                isUp={true}
                subtitle={`${summaryData?.pending_orders || 0} pending`}
                iconColor="bg-feast-amber/10 text-feast-amber"
              />
              <StatCard
                title="Pending Orders"
                value={summaryData?.pending_orders?.toString() || '0'}
                change="Awaiting"
                isUp={false}
                subtitle="payment"
                iconColor="bg-feast-beetroot/10 text-feast-beetroot"
              />
            </div>
          )}
        </motion.div>

        {/* Revenue Chart */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-jakarta text-feast-dark">Revenue & Orders Trend</h3>
            <button className="p-1 text-feast-dark-muted hover:text-feast-dark transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          {chartData.length > 0 ? (
            <>
              <div className="flex items-end gap-2 h-48 px-4">
                {chartData.slice(-14).map((bar, i) => {
                  const maxRevenue = Math.max(...chartData.slice(-14).map(d => parseFloat(d.revenue || 0)), 1);
                  const maxOrders = Math.max(...chartData.slice(-14).map(d => d.order_count || 0), 1);
                  const revPercent = (parseFloat(bar.revenue || 0) / maxRevenue) * 100;
                  const orderPercent = ((bar.order_count || 0) / maxOrders) * 100;
                  const dayLabel = new Date(bar.date).toLocaleDateString('id-ID', { weekday: 'short' });
                  const isMax = parseFloat(bar.revenue || 0) === maxRevenue;

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex gap-1 items-end justify-center" style={{ height: '160px' }}>
                        <div
                          className={`w-5 rounded-t-lg transition-all duration-500 ${isMax ? 'bg-feast-sunset' : 'bg-feast-sunset/20'}`}
                          style={{ height: `${Math.max(revPercent, 4)}%` }}
                          title={formatIDR(bar.revenue || 0)}
                        />
                        <div
                          className="w-5 bg-feast-bg rounded-t-lg transition-all duration-500"
                          style={{ height: `${Math.max(orderPercent, 4)}%` }}
                          title={`${bar.order_count} orders`}
                        />
                      </div>
                      <span className={`text-xs font-medium ${isMax ? 'text-feast-sunset' : 'text-feast-dark-muted'}`}>
                        {dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between px-4 mt-2">
                <span className="text-xs text-feast-dark-muted">Rp0</span>
                <span className="text-xs text-feast-dark-muted">
                  {formatCurrency(Math.max(...chartData.slice(-14).map(d => parseFloat(d.revenue || 0))))}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-feast-dark-muted text-sm">
              Belum ada data chart untuk periode ini.
            </div>
          )}
        </motion.div>

        {/* Bottom Row — Top Moving Items + Kitchen Load */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Moving Items */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold font-jakarta text-feast-dark">Top Moving Items</h3>
              <span className="text-feast-sunset text-xs font-semibold">Popular</span>
            </div>
            <div className="space-y-4">
              {popularItems.length > 0 ? (
                popularItems.map((item, i) => (
                  <TopItem
                    key={item.brand_product_id || i}
                    name={item.name}
                    orders={`${item.total_qty_sold} orders`}
                    trending={i === 0}
                    rank={i + 1}
                  />
                ))
              ) : (
                <p className="text-sm text-feast-dark-muted text-center py-4">Belum ada data produk populer.</p>
              )}
            </div>
          </motion.div>

          {/* Kitchen Load (kept as visual indicator) */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold font-jakarta text-feast-dark">Kitchen Load</h3>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-feast-sunset">
                <span className="w-2 h-2 bg-feast-sunset rounded-full animate-pulse" />
                Live
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

const TopItem = ({ name, orders, trending, rank }) => (
  <div className="flex items-center gap-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
      rank === 1 ? 'bg-feast-sunset/10 text-feast-sunset' : 'bg-feast-bg text-feast-dark-muted'
    }`}>
      #{rank}
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-semibold text-feast-dark">{name}</h4>
      <p className="text-xs text-feast-dark-muted">{orders}</p>
    </div>
    {trending && (
      <span className="text-[10px] font-semibold text-feast-sunset bg-feast-sunset/10 px-2 py-1 rounded-full">Trending</span>
    )}
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