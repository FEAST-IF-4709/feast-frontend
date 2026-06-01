import React, { useState } from 'react';
import { Receipt, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { usePermission } from '../hooks/usePermission';
import { ordersApi } from '../api/orders';
import { formatIDR, formatDateTime } from '../utils/format';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import OrderDetailModal from './orders/OrderDetailModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

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

const ORDER_SOURCE_LABEL = {
  QR_TABLE: 'Scan Meja',
  CASHIER_POS: 'Kasir POS',
  MOBILE_APP_DELIVERY: 'Delivery',
};

const FULFILLMENT_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'RECEIVED', label: 'Diterima' },
  { value: 'IN_PROGRESS', label: 'Diproses' },
  { value: 'READY', label: 'Siap' },
  { value: 'SERVED', label: 'Diservis' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

const PAYMENT_OPTIONS = [
  { value: '', label: 'Semua Pembayaran' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'SETTLED', label: 'Lunas' },
  { value: 'EXPIRED', label: 'Kedaluwarsa' },
  { value: 'FAILED', label: 'Gagal' },
];

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [filterFulfillment, setFilterFulfillment] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const params = {};
  if (filterFulfillment) params.fulfillment_status = filterFulfillment;
  if (filterPayment) params.payment_status = filterPayment;
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  const { data: ordersData, isLoading } = useApi(
    () => ordersApi.list(params),
    [filterFulfillment, filterPayment, dateFrom, dateTo]
  );

  const orders = ordersData?.results ?? (Array.isArray(ordersData) ? ordersData : []);

  const filtered = search.trim()
    ? orders.filter((o) =>
        o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
        o.walk_in_name?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div className="min-h-screen bg-feast-bg">
      <PageHeader title="Riwayat Pesanan" subtitle="Manajemen" />

      <div className="p-8 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-feast-dark-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor order..."
                className="w-full bg-feast-bg rounded-xl pl-8 pr-4 py-2.5 text-sm font-vietnam text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
              />
            </div>

            <select
              value={filterFulfillment}
              onChange={(e) => setFilterFulfillment(e.target.value)}
              className="bg-feast-bg rounded-xl px-4 py-2.5 text-sm font-vietnam text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
            >
              {FULFILLMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="bg-feast-bg rounded-xl px-4 py-2.5 text-sm font-vietnam text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
            >
              {PAYMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-feast-bg rounded-xl px-4 py-2.5 text-sm font-vietnam text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-feast-bg rounded-xl px-4 py-2.5 text-sm font-vietnam text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <LoadingSpinner fullPage />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Belum ada pesanan"
            description={search || filterFulfillment || filterPayment ? 'Tidak ada pesanan yang sesuai filter' : 'Pesanan akan muncul di sini setelah ada transaksi'}
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-feast-bg">
                    <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">No. Pesanan</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Sumber</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Waktu</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Status Pesanan</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Status Bayar</th>
                    <th className="text-right px-5 py-4 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const fs = FULFILLMENT_STATUS[order.fulfillment_status] ?? { label: order.fulfillment_status, variant: 'neutral' };
                    const ps = PAYMENT_STATUS[order.payment_status] ?? { label: order.payment_status, variant: 'neutral' };
                    return (
                      <motion.tr
                        key={order.id}
                        variants={itemVariants}
                        onClick={() => setSelectedOrder(order)}
                        className="border-b border-feast-bg last:border-0 hover:bg-feast-bg/50 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-bold text-feast-sunset font-mono">{order.order_number}</span>
                          {order.walk_in_name && (
                            <p className="text-xs text-feast-dark-muted font-vietnam mt-0.5">{order.walk_in_name}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-feast-dark-secondary font-vietnam">
                          {ORDER_SOURCE_LABEL[order.order_source] ?? order.order_source}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-feast-dark-secondary font-vietnam">
                          {formatDateTime(order.placed_at)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge variant={fs.variant} label={fs.label} />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge variant={ps.variant} label={ps.label} />
                        </td>
                        <td className="px-5 py-3.5 text-right text-sm font-bold text-feast-dark font-vietnam">
                          {formatIDR(order.grand_total)}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}
