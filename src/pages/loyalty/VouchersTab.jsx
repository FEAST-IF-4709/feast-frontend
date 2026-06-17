import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Gift, Coins, Tag, Package, Star } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { usePermission } from '../../hooks/usePermission';
import { useToast } from '../../hooks/useToast';
import { voucherTemplatesApi } from '../../api/loyalty';
import { handleApiError } from '../../api/errorHandler';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import VoucherModal from './components/VoucherModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const DISCOUNT_TYPE_CONFIG = {
  PERCENT: { label: 'Diskon %', color: 'bg-blue-50 text-blue-600' },
  FIXED: { label: 'Potongan Rp', color: 'bg-green-50 text-green-600' },
  FREE_ITEM: { label: 'Item Gratis', color: 'bg-feast-sunset/10 text-feast-sunset' },
};

const SCOPE_CONFIG = {
  ALL: { label: 'Semua Produk', icon: Package },
  CATEGORY: { label: 'Per Kategori', icon: Tag },
  PRODUCT: { label: 'Produk Pilihan', icon: Star },
};

const TIER_THRESHOLDS = [
  { tier: 'Silver', points: 100, color: 'text-gray-500' },
  { tier: 'Gold', points: 200, color: 'text-feast-amber' },
];

export default function VouchersTab() {
  const toast = useToast();
  const canManage = usePermission('loyalty.voucher.manage');

  const { data, isLoading, refetch } = useApi(() => voucherTemplatesApi.list(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const vouchers = data?.results ?? data ?? [];

  const openCreate = () => { setEditingItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setModalOpen(true); };
  const handleModalClose = () => { setModalOpen(false); setEditingItem(null); };

  const handleDelete = async () => {
    try {
      await voucherTemplatesApi.delete(confirmDeleteId);
      toast.success('Voucher dihapus');
      refetch();
    } catch (err) {
      handleApiError(err, { showError: toast.error });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="pb-10">
      {/* Info tier system */}
      <div className="mb-5 bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam mb-3">
          Sistem Tier Loyalty
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-feast-bg rounded-xl px-4 py-2.5">
            <span className="text-lg">🥉</span>
            <div>
              <p className="text-xs font-semibold font-jakarta text-feast-dark">Bronze</p>
              <p className="text-[11px] text-feast-dark-muted font-vietnam">0 – 99 poin / bulan</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-feast-bg rounded-xl px-4 py-2.5">
            <span className="text-lg">🥈</span>
            <div>
              <p className="text-xs font-semibold font-jakarta text-feast-dark">Silver</p>
              <p className="text-[11px] text-feast-dark-muted font-vietnam">100 – 199 poin / bulan</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-feast-bg rounded-xl px-4 py-2.5">
            <span className="text-lg">🥇</span>
            <div>
              <p className="text-xs font-semibold font-jakarta text-feast-dark">Gold</p>
              <p className="text-[11px] text-feast-dark-muted font-vietnam">200+ poin / bulan</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-feast-bg rounded-xl px-4 py-2.5">
            <Coins size={16} className="text-feast-amber" />
            <div>
              <p className="text-xs font-semibold font-jakarta text-feast-dark">Earn Rate</p>
              <p className="text-[11px] text-feast-dark-muted font-vietnam">1 poin per Rp 10.000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header + add button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold font-jakarta text-feast-dark">
            Voucher Tersedia ({vouchers.length})
          </h2>
          <p className="text-xs text-feast-dark-muted font-vietnam mt-0.5">
            Customer dapat menukarkan poin mereka dengan voucher di bawah ini
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-full hover:bg-feast-sunset-dark transition-all hover:shadow-lg hover:shadow-feast-sunset/20"
          >
            <Plus size={16} />
            Buat Voucher
          </button>
        )}
      </div>

      {vouchers.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="Belum ada voucher"
          description="Buat voucher pertama untuk program loyalty brand Anda"
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {vouchers.map((voucher) => {
            const discountCfg = DISCOUNT_TYPE_CONFIG[voucher.discount_type] ?? DISCOUNT_TYPE_CONFIG.FREE_ITEM;
            const scopeCfg = SCOPE_CONFIG[voucher.applicable_scope] ?? SCOPE_CONFIG.ALL;
            const ScopeIcon = scopeCfg.icon;

            return (
              <motion.div
                key={voucher.id}
                variants={itemVariants}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col group ${
                  voucher.is_active ? '' : 'opacity-60'
                }`}
              >
                {/* Image */}
                <div className="relative h-36 bg-feast-bg flex items-center justify-center overflow-hidden">
                  {voucher.image_url ? (
                    <img src={voucher.image_url} alt={voucher.title} className="w-full h-full object-cover" />
                  ) : (
                    <Gift size={32} className="text-feast-dark-muted/30" />
                  )}
                  {!voucher.is_active && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="text-xs font-semibold font-vietnam text-feast-dark-muted bg-white px-3 py-1 rounded-full border border-feast-bg">
                        Nonaktif
                      </span>
                    </div>
                  )}
                  {/* Action buttons */}
                  {canManage && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(voucher)}
                        className="p-1.5 bg-white/90 text-feast-dark-muted hover:text-feast-sunset rounded-lg shadow-sm transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(voucher.id)}
                        className="p-1.5 bg-white/90 text-feast-dark-muted hover:text-red-500 rounded-lg shadow-sm transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-jakarta text-sm font-bold text-feast-dark leading-snug mb-1">
                    {voucher.title}
                  </h3>
                  {voucher.description && (
                    <p className="text-xs text-feast-dark-muted font-vietnam line-clamp-2 mb-3 flex-1">
                      {voucher.description}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {/* Points cost */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold font-vietnam bg-feast-amber/10 text-feast-amber rounded-full px-2.5 py-1">
                      <Coins size={10} />
                      {voucher.points_cost} poin
                    </span>

                    {/* Discount type */}
                    <span className={`inline-flex items-center text-[11px] font-semibold font-vietnam rounded-full px-2.5 py-1 ${discountCfg.color}`}>
                      {discountCfg.label}
                      {voucher.discount_value && ` · ${voucher.discount_value}${voucher.discount_type === 'PERCENT' ? '%' : ''}`}
                    </span>

                    {/* Scope */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium font-vietnam bg-feast-bg text-feast-dark-muted rounded-full px-2.5 py-1">
                      <ScopeIcon size={10} />
                      {scopeCfg.label}
                    </span>
                  </div>

                  {/* Valid days */}
                  <p className="text-[11px] text-feast-dark-muted font-vietnam mt-2">
                    Berlaku {voucher.valid_days} hari setelah ditukar
                  </p>

                  {/* Scope detail */}
                  {voucher.applicable_scope === 'CATEGORY' && voucher.applicable_categories?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-feast-bg">
                      <p className="text-[11px] text-feast-dark-muted font-vietnam">
                        Kategori: {voucher.applicable_categories.map((c) => c.name).join(', ')}
                      </p>
                    </div>
                  )}
                  {voucher.applicable_scope === 'PRODUCT' && voucher.applicable_products?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-feast-bg">
                      <p className="text-[11px] text-feast-dark-muted font-vietnam">
                        Produk: {voucher.applicable_products.map((p) => p.name).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <VoucherModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        editingItem={editingItem}
        onSuccess={refetch}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Hapus Voucher"
        message="Voucher yang dihapus tidak bisa dikembalikan. Customer yang sudah punya voucher ini tidak akan terpengaruh."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
