import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, User, Table2, Smartphone, ShoppingCart } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { formatIDR, formatDateTime } from '../../utils/format';

const FULFILLMENT_STATUS = {
  RECEIVED: { label: 'Diterima', variant: 'info' },
  IN_PROGRESS: { label: 'Diproses', variant: 'warning' },
  READY: { label: 'Siap', variant: 'success' },
  SERVED: { label: 'Diservis', variant: 'success' },
  COMPLETED: { label: 'Selesai', variant: 'neutral' },
  CANCELLED: { label: 'Dibatalkan', variant: 'danger' },
};

const PAYMENT_STATUS = {
  PENDING: { label: 'Menunggu', variant: 'warning' },
  SETTLED: { label: 'Lunas', variant: 'success' },
  EXPIRED: { label: 'Kedaluwarsa', variant: 'neutral' },
  DENIED: { label: 'Ditolak', variant: 'danger' },
  FAILED: { label: 'Gagal', variant: 'danger' },
  REFUNDED: { label: 'Dikembalikan', variant: 'info' },
};

const PAYMENT_METHOD_LABEL = {
  CASH: 'Tunai',
  EDC: 'EDC / Kartu',
  QRIS_MIDTRANS: 'QRIS',
  BANK_TRANSFER_MIDTRANS: 'Transfer Bank',
};

const ORDER_SOURCE_LABEL = {
  QR_TABLE: 'Scan Meja',
  CASHIER_POS: 'Kasir POS',
  MOBILE_APP_DELIVERY: 'Delivery',
};

export default function OrderDetailModal({ isOpen, onClose, order }) {
  if (!order) return null;

  const items = order.items ?? [];
  const fulfillment = FULFILLMENT_STATUS[order.fulfillment_status] ?? { label: order.fulfillment_status, variant: 'neutral' };
  const payment = PAYMENT_STATUS[order.payment_status] ?? { label: order.payment_status, variant: 'neutral' };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-feast-bg">
              <div>
                <p className="text-xs font-semibold text-feast-dark-muted font-vietnam uppercase tracking-wider">
                  {ORDER_SOURCE_LABEL[order.order_source] ?? order.order_source}
                </p>
                <h2 className="font-jakarta text-lg font-bold text-feast-dark">{order.order_number}</h2>
                <p className="text-xs text-feast-dark-muted font-vietnam mt-0.5">{formatDateTime(order.placed_at)}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-feast-bg rounded-xl transition-colors text-feast-dark-muted"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Status badges */}
              <div className="flex gap-2 flex-wrap">
                <StatusBadge variant={fulfillment.variant} label={`Pesanan: ${fulfillment.label}`} />
                <StatusBadge variant={payment.variant} label={`Bayar: ${payment.label}`} />
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3">
                {order.customer && (
                  <div className="bg-feast-bg rounded-xl p-3 flex items-center gap-2">
                    <User size={14} className="text-feast-dark-muted flex-shrink-0" />
                    <div>
                      <p className="text-xs text-feast-dark-muted font-vietnam">Pelanggan</p>
                      <p className="text-sm font-semibold text-feast-dark font-jakarta truncate">
                        {order.customer?.full_name ?? `#${String(order.customer).slice(0, 8)}`}
                      </p>
                    </div>
                  </div>
                )}
                {order.walk_in_name && (
                  <div className="bg-feast-bg rounded-xl p-3 flex items-center gap-2">
                    <User size={14} className="text-feast-dark-muted flex-shrink-0" />
                    <div>
                      <p className="text-xs text-feast-dark-muted font-vietnam">Nama Tamu</p>
                      <p className="text-sm font-semibold text-feast-dark font-jakarta">{order.walk_in_name}</p>
                    </div>
                  </div>
                )}
                {order.table && (
                  <div className="bg-feast-bg rounded-xl p-3 flex items-center gap-2">
                    <Table2 size={14} className="text-feast-dark-muted flex-shrink-0" />
                    <div>
                      <p className="text-xs text-feast-dark-muted font-vietnam">Meja</p>
                      <p className="text-sm font-semibold text-feast-dark font-jakarta">
                        {order.table?.label ?? `#${String(order.table).slice(0, 8)}`}
                      </p>
                    </div>
                  </div>
                )}
                <div className="bg-feast-bg rounded-xl p-3 flex items-center gap-2">
                  <ShoppingCart size={14} className="text-feast-dark-muted flex-shrink-0" />
                  <div>
                    <p className="text-xs text-feast-dark-muted font-vietnam">Metode Bayar</p>
                    <p className="text-sm font-semibold text-feast-dark font-jakarta">
                      {PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method ?? '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam mb-3">
                  Item Pesanan
                </h3>
                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const snap = item.product_snapshot ?? {};
                    return (
                      <div key={item.id ?? idx} className="flex items-start gap-3">
                        {snap.image_url ? (
                          <img
                            src={snap.image_url}
                            alt={snap.name}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-feast-bg flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-feast-dark font-jakarta leading-tight">
                            {snap.name ?? '-'}
                          </p>
                          {item.item_notes && (
                            <p className="text-xs text-feast-dark-muted font-vietnam">{item.item_notes}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-feast-dark-muted font-vietnam">{item.quantity}x</p>
                          <p className="text-sm font-semibold text-feast-dark font-vietnam">
                            {formatIDR(item.line_total)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-feast-bg pt-4 space-y-2">
                <div className="flex justify-between text-sm font-vietnam text-feast-dark-secondary">
                  <span>Subtotal</span>
                  <span>{formatIDR(order.subtotal)}</span>
                </div>
                {parseFloat(order.discount_total) > 0 && (
                  <div className="flex justify-between text-sm font-vietnam text-green-600">
                    <span>Diskon</span>
                    <span>-{formatIDR(order.discount_total)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold font-jakarta text-feast-dark pt-1 border-t border-feast-bg">
                  <span>Total</span>
                  <span className="text-feast-sunset">{formatIDR(order.grand_total)}</span>
                </div>
              </div>

              {order.notes && (
                <div className="bg-feast-bg rounded-xl p-3">
                  <p className="text-xs text-feast-dark-muted font-vietnam mb-1">Catatan</p>
                  <p className="text-sm text-feast-dark font-vietnam">{order.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
