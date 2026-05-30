import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Filter, Clock, CheckSquare, Square, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { getAccessToken, getOutletId } from '../api/auth';
import { connectKitchen } from '../api/websocket';

const KitchenPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const wsRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/kitchen/orders/?status=RECEIVED,IN_PROGRESS,READY');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch kitchen orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // WebSocket for real-time kitchen updates
  useEffect(() => {
    const outletId = getOutletId();
    const token = getAccessToken();
    if (!outletId || !token) return;

    wsRef.current = connectKitchen(outletId, token, {
      onMessage: (data) => {
        if (data.event === 'order.created' || data.event === 'order.status_changed' || data.event === 'order.cancelled') {
          fetchOrders(); // Refetch on any kitchen event
        }
      },
    });

    return () => wsRef.current?.disconnect();
  }, [fetchOrders]);

  // Advance order status
  const handleStatusChange = async (orderId, toStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/kitchen/orders/${orderId}/status/`, { to_status: toStatus });
      fetchOrders();
    } catch (err) {
      console.error('Status update failed:', err);
      alert(err.response?.data?.message || 'Gagal mengubah status order.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Cancel order
  const handleCancel = async (orderId) => {
    if (!confirm('Yakin ingin cancel order ini?')) return;
    setUpdatingId(orderId);
    try {
      await api.post(`/kitchen/orders/${orderId}/cancel/`, { cancel_reason: 'Dibatalkan dari KDS' });
      fetchOrders();
    } catch (err) {
      console.error('Cancel failed:', err);
      alert(err.response?.data?.message || 'Gagal cancel order.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Elapsed time helper
  const getElapsed = (placedAt) => {
    if (!placedAt) return '00:00';
    const diff = Math.floor((Date.now() - new Date(placedAt).getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Group by status
  const received = orders.filter(o => o.fulfillment_status === 'RECEIVED');
  const inProgress = orders.filter(o => o.fulfillment_status === 'IN_PROGRESS');
  const ready = orders.filter(o => o.fulfillment_status === 'READY');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'RECEIVED': return { label: 'New', bg: 'bg-white', border: 'border-feast-bg', tagBg: 'bg-feast-surface-low', tagText: 'text-feast-dark-muted' };
      case 'IN_PROGRESS': return { label: 'Preparing', bg: 'bg-white', border: 'border-feast-amber', tagBg: 'bg-feast-amber/20', tagText: 'text-feast-amber' };
      case 'READY': return { label: 'Ready', bg: 'bg-[#f0fdf4]', border: 'border-green-400', tagBg: 'bg-green-100', tagText: 'text-green-700' };
      default: return { label: status, bg: 'bg-white', border: 'border-feast-bg', tagBg: 'bg-feast-surface-low', tagText: 'text-feast-dark-muted' };
    }
  };

  return (
    <>
      <header className="flex justify-between items-center px-8 py-5 bg-feast-bg sticky top-0 z-40">
        <div>
          <h2 className="text-2xl font-bold font-jakarta text-feast-dark">Active Orders</h2>
          <p className="text-sm text-feast-dark-muted mt-1">
            {received.length} new · {inProgress.length} preparing · {ready.length} ready
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchOrders} className="flex items-center gap-2 px-5 py-2.5 bg-feast-surface-low text-feast-dark font-semibold text-sm rounded-full hover:bg-gray-200 transition-colors">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-feast-sunset" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-feast-dark-muted">
          <Clock size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-semibold">Belum ada order masuk</p>
          <p className="text-sm mt-1">Order baru akan muncul secara otomatis.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="p-8 flex items-start gap-6 overflow-x-auto pb-12"
        >
          <AnimatePresence>
            {[...received, ...inProgress, ...ready].map((order) => {
              const config = getStatusConfig(order.fulfillment_status);
              const elapsed = getElapsed(order.placed_at);
              const isUrgent = order.fulfillment_status === 'RECEIVED' && parseInt(elapsed.split(':')[0]) >= 10;
              const isUpdating = updatingId === (order.id || order.order_id);

              return (
                <motion.div
                  key={order.id || order.order_id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  layout
                  className={`min-w-[320px] ${isUrgent ? 'bg-[#fdf3f3] border-t-4 border-[#e54b4b]' : `${config.bg} border-t-4 ${config.border}`} rounded-2xl p-5 shadow-sm relative`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`inline-block ${isUrgent ? 'bg-[#e54b4b] text-white' : `${config.tagBg} ${config.tagText}`} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2`}>
                        {isUrgent ? 'Urgent' : config.label}
                      </span>
                      <h3 className="text-xl font-bold font-jakarta text-feast-dark leading-tight">
                        {order.order_number || `#${(order.id || '').slice(0, 6)}`}
                      </h3>
                      <p className="text-xs text-feast-dark-muted mt-1">
                        {order.order_source === 'QR_TABLE' ? 'Dine In' : order.order_source === 'CASHIER_POS' ? 'POS' : order.order_source || 'Order'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${isUrgent ? 'text-[#e54b4b]' : 'text-feast-dark'}`}>{elapsed}</span>
                      <p className="text-[10px] text-feast-dark-muted uppercase tracking-wider">Elapsed</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {(order.items || []).map((item, idx) => (
                      <OrderItem
                        key={idx}
                        count={`${item.quantity}x`}
                        name={item.product_name || item.name || 'Item'}
                        note={item.item_notes}
                        checked={order.fulfillment_status !== 'RECEIVED'}
                        strikethrough={order.fulfillment_status === 'READY'}
                        bg="bg-feast-surface-lowest"
                      />
                    ))}
                    {order.notes && (
                      <p className="text-xs text-feast-dark-muted italic px-1">📝 {order.notes}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {order.fulfillment_status === 'RECEIVED' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusChange(order.id || order.order_id, 'IN_PROGRESS')}
                        disabled={isUpdating}
                        className="w-full py-3 bg-[#806b1b] text-white font-semibold font-vietnam text-sm rounded-xl hover:bg-[#6e5a14] transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? 'Updating...' : 'Start Prep'}
                      </motion.button>
                    )}
                    {order.fulfillment_status === 'IN_PROGRESS' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusChange(order.id || order.order_id, 'READY')}
                        disabled={isUpdating}
                        className="w-full py-3 bg-feast-surface-low text-feast-dark font-semibold font-vietnam text-sm rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? 'Updating...' : 'Mark Ready'}
                      </motion.button>
                    )}
                    {order.fulfillment_status === 'READY' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusChange(order.id || order.order_id, 'SERVED')}
                        disabled={isUpdating}
                        className="w-full py-3 bg-green-500 text-white font-semibold font-vietnam text-sm rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? 'Updating...' : 'Mark Served'}
                      </motion.button>
                    )}
                    {(order.fulfillment_status === 'RECEIVED' || order.fulfillment_status === 'IN_PROGRESS') && (
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
        </motion.div>
      )}
    </>
  );
};

const OrderItem = ({ count, name, note, noteColor = "bg-[#fff7e6] text-feast-amber", checked, strikethrough, bg }) => (
  <div className={`${bg} rounded-xl p-3 flex items-start justify-between border border-feast-bg`}>
    <div className="flex gap-3 items-start">
      <span className={`text-sm font-bold ${strikethrough ? 'text-feast-dark-muted line-through' : 'text-feast-dark'}`}>
        {count}
      </span>
      <div>
        <h4 className={`text-sm font-semibold leading-tight ${strikethrough ? 'text-feast-dark-muted line-through' : 'text-feast-dark'}`}>
          {name}
        </h4>
        {note && (
          <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${noteColor}`}>
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
