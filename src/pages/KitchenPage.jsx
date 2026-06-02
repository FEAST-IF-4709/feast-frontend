import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, CheckSquare, Square, Loader2, RefreshCw, Wifi, WifiOff, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { getAccessToken, getOutletId, getOutletIds } from '../api/auth';
import { connectKitchen } from '../api/websocket';
import { useToast } from '../hooks/useToast';

// Forces a re-render every second so elapsed timers tick live
function useTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
}

function playNewOrderSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // AudioContext unavailable — silent fail
  }
}

const KitchenPage = () => {
  // ── Outlet context ──────────────────────────────────────────────────
  const primaryOutletId = getOutletId();        // primary outlet from JWT (may be null)
  const allOutletIds    = getOutletIds();        // all outlets user has access to
  const showPicker      = allOutletIds.length > 1; // picker whenever user has >1 outlet

  const [outlets, setOutlets]               = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState(
    // default: primary outlet if set, else the only outlet in the list
    primaryOutletId ?? (allOutletIds.length === 1 ? allOutletIds[0] : null)
  );

  // ── Orders & UI state ───────────────────────────────────────────────
  const [orders, setOrders]       = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [wsStatus, setWsStatus]   = useState('connecting');
  const wsRef = useRef(null);
  const toast = useToast();
  useTick();

  // Fetch outlet list whenever user has access to more than one outlet
  useEffect(() => {
    if (!showPicker) return;
    api.get('/kitchen/outlets/').then((res) => {
      const list = res.data.data || [];
      setOutlets(list);
      // if no outlet pre-selected yet, default to first in list
      if (!selectedOutletId && list.length > 0) {
        setSelectedOutletId(list[0].id);
      }
    }).catch(() => {});
  }, [showPicker]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch orders ────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ status: 'RECEIVED,IN_PROGRESS,READY' });
      if (selectedOutletId) params.set('outlet_id', selectedOutletId);
      const res = await api.get(`/kitchen/orders/?${params}`);
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch kitchen orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOutletId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── WebSocket — reconnect whenever selected outlet changes ──────────
  useEffect(() => {
    const token = getAccessToken();
    if (!selectedOutletId || !token) {
      setWsStatus('disconnected');
      return;
    }

    setWsStatus('connecting');
    wsRef.current?.disconnect();

    wsRef.current = connectKitchen(selectedOutletId, token, {
      onOpen:  () => setWsStatus('connected'),
      onClose: () => setWsStatus('disconnected'),
      onError: () => setWsStatus('disconnected'),
      onMessage: (data) => {
        if (data.event === 'order.created') {
          playNewOrderSound();
          toast.success('Order baru masuk!');
          fetchOrders();
        } else if (
          data.event === 'order.status_changed' ||
          data.event === 'order.cancelled'
        ) {
          fetchOrders();
        }
      },
    });

    return () => wsRef.current?.disconnect();
  }, [selectedOutletId, fetchOrders]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ─────────────────────────────────────────────────────────
  const handleStatusChange = async (orderId, toStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/kitchen/orders/${orderId}/status/`, { to_status: toStatus });
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status order.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (orderId) => {
    if (!confirm('Yakin ingin cancel order ini?')) return;
    setUpdatingId(orderId);
    try {
      await api.post(`/kitchen/orders/${orderId}/cancel/`, {
        cancel_reason: 'Dibatalkan dari KDS',
      });
      toast.success('Order berhasil dibatalkan.');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal cancel order.');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────
  const getElapsed = (placedAt) => {
    if (!placedAt) return '00:00';
    const diff = Math.floor((Date.now() - new Date(placedAt).getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const selectedOutletName =
    outlets.find((o) => o.id === selectedOutletId)?.name ?? null;

  const received   = orders.filter((o) => o.fulfillment_status === 'RECEIVED');
  const inProgress = orders.filter((o) => o.fulfillment_status === 'IN_PROGRESS');
  const ready      = orders.filter((o) => o.fulfillment_status === 'READY');

  const COLUMNS = [
    { status: 'RECEIVED',    label: 'New Orders',     orders: received,   dot: 'bg-feast-amber', countStyle: 'bg-feast-amber/10 text-feast-amber' },
    { status: 'IN_PROGRESS', label: 'Preparing',      orders: inProgress, dot: 'bg-blue-400',    countStyle: 'bg-blue-50 text-blue-600'           },
    { status: 'READY',       label: 'Ready to Serve', orders: ready,      dot: 'bg-green-400',   countStyle: 'bg-green-50 text-green-600'          },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 14 },
    show:   { opacity: 1, y: 0,  transition: { type: 'spring', stiffness: 200, damping: 22 } },
    exit:   { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
  };

  return (
    <>
      {/* ── Header ── */}
      <header className="flex justify-between items-center px-8 py-5 bg-feast-bg sticky top-0 z-40">
        <div>
          <h2 className="text-2xl font-bold font-jakarta text-feast-dark">Kitchen Display</h2>
          <p className="text-sm text-feast-dark-muted mt-1">
            {received.length} new · {inProgress.length} preparing · {ready.length} ready
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Outlet picker — only for brand-level users */}
          {showPicker && (
            <div className="relative">
              <select
                value={selectedOutletId ?? ''}
                onChange={(e) => setSelectedOutletId(e.target.value || null)}
                className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-feast-bg rounded-full text-sm font-semibold text-feast-dark shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
              >
                {outlets.length === 0 ? (
                  <option value="">Loading outlets…</option>
                ) : (
                  outlets.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))
                )}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-feast-dark-muted"
              />
            </div>
          )}

          {/* Outlet label for outlet-level users */}
          {!showPicker && selectedOutletName && (
            <span className="text-xs font-semibold text-feast-dark-muted bg-feast-surface-low px-3 py-1.5 rounded-full">
              {selectedOutletName}
            </span>
          )}

          {/* WebSocket status */}
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              wsStatus === 'connected'
                ? 'bg-green-50 text-green-600'
                : wsStatus === 'connecting'
                ? 'bg-yellow-50 text-yellow-600'
                : 'bg-red-50 text-red-500'
            }`}
          >
            {wsStatus === 'connected' ? <Wifi size={12} /> : <WifiOff size={12} />}
            {wsStatus === 'connected' ? 'Live' : wsStatus === 'connecting' ? 'Connecting…' : 'Offline'}
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-5 py-2.5 bg-feast-surface-low text-feast-dark font-semibold text-sm rounded-full hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      {/* ── No outlet selected (brand-level, outlets still loading) ── */}
      {showPicker && !selectedOutletId ? (
        <div className="flex flex-col items-center justify-center py-24 text-feast-dark-muted">
          <Loader2 className="animate-spin w-8 h-8 text-feast-sunset mb-4" />
          <p className="text-sm">Memuat daftar outlet…</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin w-8 h-8 text-feast-sunset" />
        </div>
      ) : (
        <div className="px-6 pb-6" style={{ height: 'calc(100vh - 84px)' }}>
          <div className="h-full grid grid-cols-3 gap-5">
            {COLUMNS.map((col) => (
              <div key={col.status} className="flex flex-col min-h-0">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <h3 className="text-xs font-bold text-feast-dark uppercase tracking-widest">
                    {col.label}
                  </h3>
                  <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${col.countStyle}`}>
                    {col.orders.length}
                  </span>
                </div>

                {/* Scrollable cards */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 min-h-0">
                  {col.orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-feast-bg rounded-2xl">
                      <Clock size={20} className="text-feast-dark-muted opacity-30 mb-1" />
                      <p className="text-xs text-feast-dark-muted">Tidak ada order</p>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {col.orders.map((order) => {
                        const elapsed = getElapsed(order.placed_at);
                        const isUrgent =
                          order.fulfillment_status === 'RECEIVED' &&
                          parseInt(elapsed.split(':')[0]) >= 10;
                        const isUpdating = updatingId === (order.id || order.order_id);

                        const borderColor = isUrgent
                          ? 'border-[#e54b4b]'
                          : order.fulfillment_status === 'IN_PROGRESS'
                          ? 'border-feast-amber'
                          : order.fulfillment_status === 'READY'
                          ? 'border-green-400'
                          : 'border-feast-bg';
                        const bgColor = isUrgent
                          ? 'bg-[#fdf3f3]'
                          : order.fulfillment_status === 'READY'
                          ? 'bg-[#f0fdf4]'
                          : 'bg-white';

                        return (
                          <motion.div
                            key={order.id || order.order_id}
                            variants={cardVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            layout
                            whileHover={{ y: -2 }}
                            className={`${bgColor} border-t-4 ${borderColor} rounded-2xl p-5 shadow-sm`}
                          >
                            {/* Card top */}
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${
                                  isUrgent
                                    ? 'bg-[#e54b4b] text-white'
                                    : order.fulfillment_status === 'IN_PROGRESS'
                                    ? 'bg-feast-amber/20 text-feast-amber'
                                    : order.fulfillment_status === 'READY'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-feast-surface-low text-feast-dark-muted'
                                }`}>
                                  {isUrgent ? 'Urgent' : col.label.replace(' Orders', '')}
                                </span>
                                <h3 className="text-xl font-bold font-jakarta text-feast-dark leading-tight">
                                  {order.order_number || `#${(order.id || '').slice(0, 6)}`}
                                </h3>
                                <p className="text-xs text-feast-dark-muted mt-0.5">
                                  {order.order_source === 'QR_TABLE'
                                    ? `Dine In${order.table_label ? ` · ${order.table_label}` : ''}`
                                    : order.order_source === 'CASHIER_POS'
                                    ? 'POS'
                                    : order.order_source || 'Order'}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`text-xl font-bold tabular-nums ${isUrgent ? 'text-[#e54b4b]' : 'text-feast-dark'}`}>
                                  {elapsed}
                                </span>
                                <p className="text-[10px] text-feast-dark-muted uppercase tracking-wider">Elapsed</p>
                              </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-2 mb-5">
                              {(order.items || []).map((item, idx) => (
                                <OrderItem
                                  key={idx}
                                  count={`${item.quantity}x`}
                                  name={item.product_name || item.name || 'Item'}
                                  note={item.item_notes}
                                  checked={order.fulfillment_status !== 'RECEIVED'}
                                  strikethrough={order.fulfillment_status === 'READY'}
                                />
                              ))}
                              {order.notes && (
                                <p className="text-xs text-feast-dark-muted italic px-1 pt-1">
                                  📝 {order.notes}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-2">
                              {order.fulfillment_status === 'RECEIVED' && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                  onClick={() => handleStatusChange(order.id || order.order_id, 'IN_PROGRESS')}
                                  disabled={isUpdating}
                                  className="w-full py-3 bg-[#806b1b] text-white font-semibold font-vietnam text-sm rounded-xl hover:bg-[#6e5a14] transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Start Prep'}
                                </motion.button>
                              )}
                              {order.fulfillment_status === 'IN_PROGRESS' && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                  onClick={() => handleStatusChange(order.id || order.order_id, 'READY')}
                                  disabled={isUpdating}
                                  className="w-full py-3 bg-feast-surface-low text-feast-dark font-semibold font-vietnam text-sm rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Mark Ready'}
                                </motion.button>
                              )}
                              {order.fulfillment_status === 'READY' && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                  onClick={() => handleStatusChange(order.id || order.order_id, 'SERVED')}
                                  disabled={isUpdating}
                                  className="w-full py-3 bg-green-500 text-white font-semibold font-vietnam text-sm rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Mark Served'}
                                </motion.button>
                              )}
                              {(order.fulfillment_status === 'RECEIVED' ||
                                order.fulfillment_status === 'IN_PROGRESS') && (
                                <button
                                  onClick={() => handleCancel(order.id || order.order_id)}
                                  disabled={isUpdating}
                                  className="w-full py-2 text-xs font-medium text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                >
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const OrderItem = ({ count, name, note, checked, strikethrough }) => (
  <div className="bg-feast-surface-lowest rounded-xl p-3 flex items-start justify-between border border-feast-bg">
    <div className="flex gap-3 items-start">
      <span className={`text-sm font-bold ${strikethrough ? 'text-feast-dark-muted line-through' : 'text-feast-dark'}`}>
        {count}
      </span>
      <div>
        <h4 className={`text-sm font-semibold leading-tight ${strikethrough ? 'text-feast-dark-muted line-through' : 'text-feast-dark'}`}>
          {name}
        </h4>
        {note && (
          <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#fff7e6] text-feast-amber">
            {note}
          </span>
        )}
      </div>
    </div>
    {checked ? (
      <CheckSquare size={16} className="text-feast-sunset mt-0.5 flex-shrink-0" />
    ) : (
      <Square size={16} className="text-feast-dark-muted mt-0.5 flex-shrink-0" />
    )}
  </div>
);

export default KitchenPage;
