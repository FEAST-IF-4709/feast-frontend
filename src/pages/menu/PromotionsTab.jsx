import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { usePermission } from '../../hooks/usePermission';
import { useToast } from '../../hooks/useToast';
import { promotionsApi, brandProductsApi } from '../../api/catalog';
import { handleApiError } from '../../api/errorHandler';
import { formatDate, formatIDR } from '../../utils/format';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import PromotionModal from './components/PromotionModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const STATUS_FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Aktif' },
  { key: 'upcoming', label: 'Akan Datang' },
  { key: 'expired', label: 'Berakhir' },
];

const getPromotionStatus = (promo) => {
  const now = new Date();
  if (!promo.is_active) return { label: 'Nonaktif', variant: 'neutral', key: 'expired' };
  if (now < new Date(promo.starts_at)) return { label: 'Akan Datang', variant: 'info', key: 'upcoming' };
  if (now > new Date(promo.ends_at)) return { label: 'Berakhir', variant: 'neutral', key: 'expired' };
  return { label: 'Aktif', variant: 'success', key: 'active' };
};

const formatDiscount = (promo) => {
  if (promo.discount_type === 'PERCENT') return `${parseFloat(promo.discount_value)}% OFF`;
  return `${formatIDR(promo.discount_value)} OFF`;
};

export default function PromotionsTab() {
  const toast = useToast();
  const canCreate = usePermission('products.create');
  const canUpdate = usePermission('products.update');
  const canDelete = usePermission('products.delete');

  const { data: promotionsData, isLoading, refetch } = useApi(() => promotionsApi.list(), []);
  const { data: productsData } = useApi(() => brandProductsApi.list({ page_size: 200 }), []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const products = productsData?.results ?? productsData ?? [];

  const getProductName = (productId) =>
    products.find((p) => String(p.id) === String(productId))?.name ?? `#${productId}`;
  const getProductImage = (productId) =>
    products.find((p) => String(p.id) === String(productId))?.image ?? null;

  const filteredPromotions = useMemo(() => {
    const all = promotionsData?.results ?? promotionsData ?? [];
    if (statusFilter === 'all') return all;
    return all.filter((p) => getPromotionStatus(p).key === statusFilter);
  }, [promotionsData, statusFilter]);

  const openCreate = () => { setEditingItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setModalOpen(true); };
  const handleModalClose = () => { setModalOpen(false); setEditingItem(null); };

  const handleDelete = async () => {
    try {
      await promotionsApi.delete(confirmDeleteId);
      toast.success('Promosi dihapus');
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
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        {/* Status filter pills */}
        <div className="flex gap-1 bg-white rounded-xl p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-1.5 text-sm font-semibold font-vietnam rounded-lg transition-colors ${
                statusFilter === f.key
                  ? 'bg-feast-sunset text-white shadow-sm'
                  : 'text-feast-dark-muted hover:text-feast-dark'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-full hover:bg-feast-sunset-dark transition-all hover:shadow-lg hover:shadow-feast-sunset/20"
          >
            <Plus size={16} />
            Tambah Promosi
          </button>
        )}
      </div>

      {filteredPromotions.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Belum ada promosi"
          description={statusFilter !== 'all' ? `Tidak ada promosi dengan status ini` : 'Buat promosi untuk menarik lebih banyak pelanggan'}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredPromotions.map((promo) => {
            const status = getPromotionStatus(promo);
            const productImage = getProductImage(promo.brand_product);

            return (
              <motion.div
                key={promo.id}
                variants={itemVariants}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Header banner */}
                <div className="relative h-28 bg-gradient-to-br from-feast-amber/20 to-feast-sunset/20 flex items-center justify-between px-5">
                  <div>
                    <p className="text-3xl font-bold font-jakarta text-feast-sunset">{formatDiscount(promo)}</p>
                    <p className="text-xs text-feast-dark-muted font-vietnam mt-0.5">{getProductName(promo.brand_product)}</p>
                  </div>
                  {productImage && (
                    <img src={productImage} alt="" className="w-16 h-16 rounded-xl object-cover shadow-md" />
                  )}
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canUpdate && (
                      <button
                        onClick={() => openEdit(promo)}
                        className="p-1.5 bg-white/90 backdrop-blur text-feast-dark-muted hover:text-feast-sunset rounded-lg shadow transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setConfirmDeleteId(promo.id)}
                        className="p-1.5 bg-white/90 backdrop-blur text-feast-dark-muted hover:text-red-500 rounded-lg shadow transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge variant={status.variant} label={status.label} />
                  </div>
                  <p className="text-xs text-feast-dark-muted font-vietnam">
                    {formatDate(promo.starts_at)} — {formatDate(promo.ends_at)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <PromotionModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        editingItem={editingItem}
        onSuccess={refetch}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Hapus Promosi"
        message="Promosi yang dihapus tidak bisa dikembalikan."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
