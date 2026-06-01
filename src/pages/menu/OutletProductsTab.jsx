import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Plus, Trash2, UtensilsCrossed, Store, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { usePermission } from '../../hooks/usePermission';
import { useToast } from '../../hooks/useToast';
import { categoriesApi, brandProductsApi, outletProductsApi } from '../../api/catalog';
import { outletsApi } from '../../api/outlets';
import { handleApiError } from '../../api/errorHandler';
import { formatIDR } from '../../utils/format';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import OutletProductModal from './components/OutletProductModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function OutletProductsTab() {
  const toast = useToast();
  const canUpdate = usePermission('products.update');
  const canCreate = usePermission('products.create');
  const canDelete = usePermission('outlet_products.delete');

  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBrandProduct, setSelectedBrandProduct] = useState(null);
  const [selectedOutletProduct, setSelectedOutletProduct] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Track whether we've done the initial load for the current outlet,
  // so we can show a full spinner only on first selection (not on refetch).
  const initialLoadedOutletRef = useRef('');

  const { data: outletsData } = useApi(() => outletsApi.list(), []);
  const { data: categoriesData } = useApi(() => categoriesApi.list(), []);
  const { data: brandProductsData, isLoading: loadingBp } = useApi(
    () => brandProductsApi.list(),
    []
  );
  const { data: outletProductsData, isLoading: loadingOp, refetch } = useApi(
    () =>
      selectedOutletId
        ? outletProductsApi.list(selectedOutletId)
        : Promise.resolve({ data: { data: null } }),
    [selectedOutletId]
  );

  // Mark the outlet as initially loaded once data arrives
  if (selectedOutletId && !loadingOp) {
    initialLoadedOutletRef.current = selectedOutletId;
  }

  const outlets = outletsData?.results ?? outletsData ?? [];
  const categories = categoriesData?.results ?? categoriesData ?? [];

  const mergedList = useMemo(() => {
    const bps = Array.isArray(brandProductsData) ? brandProductsData
      : brandProductsData?.results ?? [];
    const ops = Array.isArray(outletProductsData) ? outletProductsData
      : outletProductsData?.results ?? [];
    return bps.map((bp) => ({
      ...bp,
      outletProduct: ops.find((op) => String(op.brand_product_id) === String(bp.id)) ?? null,
    }));
  }, [brandProductsData, outletProductsData]);

  const getCategoryName = (catId) => categories.find((c) => String(c.id) === String(catId))?.name ?? '-';

  const openModal = (bp, op) => {
    setSelectedBrandProduct(bp);
    setSelectedOutletProduct(op);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBrandProduct(null);
    setSelectedOutletProduct(null);
  };

  const handleDelete = async () => {
    try {
      await outletProductsApi.delete(confirmDeleteId);
      toast.success('Menu dihapus dari outlet');
      refetch();
    } catch (err) {
      handleApiError(err, { showError: toast.error });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // Show full spinner only for initial brand-product load or first outlet selection.
  // During refetch (outlet already loaded once), keep the table visible.
  const isInitialOutletLoad = selectedOutletId && loadingOp
    && initialLoadedOutletRef.current !== selectedOutletId;
  const isLoading = loadingBp || isInitialOutletLoad;
  const isRefreshing = selectedOutletId && loadingOp && !isInitialOutletLoad;

  return (
    <div className="pb-10">
      {/* Outlet selector */}
      <div className="flex items-center gap-3 mb-5">
        <Store size={18} className="text-feast-dark-muted flex-shrink-0" />
        <select
          value={selectedOutletId}
          onChange={(e) => setSelectedOutletId(e.target.value)}
          className="bg-white rounded-xl px-4 py-2.5 text-sm font-vietnam text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 min-w-[220px]"
        >
          <option value="">-- Pilih Outlet --</option>
          {outlets.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        {selectedOutletId && (
          isRefreshing
            ? <Loader2 size={16} className="animate-spin text-feast-sunset" />
            : <span className="text-xs text-feast-dark-muted font-vietnam">{mergedList.length} menu brand</span>
        )}
      </div>

      {!selectedOutletId ? (
        <EmptyState
          icon={Store}
          title="Pilih outlet terlebih dahulu"
          description="Pilih outlet untuk melihat dan mengelola harga serta ketersediaan menu"
        />
      ) : isLoading ? (
        <LoadingSpinner fullPage />
      ) : mergedList.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Belum ada menu brand"
          description="Tambahkan menu di tab Menu Brand terlebih dahulu"
        />
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-feast-bg">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Menu</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Kategori</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Harga Brand</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Harga Outlet</th>
                    <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Stok</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedList.map((item) => {
                    const op = item.outletProduct;
                    const hasOutletPrice = op && op.outlet_price != null;
                    const effectivePrice = hasOutletPrice ? op.outlet_price : item.base_price;

                    return (
                      <motion.tr
                        key={item.id}
                        variants={itemVariants}
                        className="border-b border-feast-bg last:border-0 hover:bg-feast-bg/40 transition-colors group"
                      >
                        {/* Menu */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-feast-bg flex items-center justify-center flex-shrink-0">
                                <UtensilsCrossed size={14} className="text-feast-dark-muted/50" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-feast-dark font-jakarta leading-tight">{item.name}</p>
                              {!item.is_active && (
                                <span className="text-xs text-feast-dark-muted font-vietnam">(nonaktif di brand)</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Kategori */}
                        <td className="px-5 py-3.5 text-sm text-feast-dark-secondary font-vietnam">
                          {getCategoryName(item.category_id)}
                        </td>

                        {/* Harga brand */}
                        <td className="px-5 py-3.5 text-right text-sm text-feast-dark-muted font-vietnam">
                          {formatIDR(item.base_price)}
                        </td>

                        {/* Harga outlet */}
                        <td className="px-5 py-3.5 text-right">
                          {hasOutletPrice ? (
                            <span className="text-sm font-bold text-feast-sunset font-jakarta">
                              {formatIDR(op.outlet_price)}
                            </span>
                          ) : (
                            <span className="text-xs text-feast-dark-muted font-vietnam italic">
                              {formatIDR(effectivePrice)} (dari brand)
                            </span>
                          )}
                        </td>

                        {/* Stok */}
                        <td className="px-5 py-3.5 text-center">
                          {op ? (
                            <div>
                              <StatusBadge
                                variant={op.stock_available ? 'success' : 'danger'}
                                label={op.stock_available ? 'Tersedia' : 'Habis'}
                              />
                              {op.stock_quantity != null && (
                                <p className="text-xs text-feast-dark-muted font-vietnam mt-0.5">{op.stock_quantity} unit</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-feast-dark-muted font-vietnam">-</span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="px-5 py-3.5 text-right">
                          {op ? (
                            <div className="inline-flex items-center gap-1.5">
                              {canUpdate && (
                                <button
                                  onClick={() => openModal(item, op)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold font-vietnam text-feast-sunset border border-feast-sunset/30 rounded-lg hover:bg-feast-sunset/5 transition-colors"
                                >
                                  <Pencil size={12} />
                                  Edit
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => setConfirmDeleteId(op.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold font-vietnam text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={12} />
                                  Hapus
                                </button>
                              )}
                            </div>
                          ) : (
                            canCreate && (
                              <button
                                onClick={() => openModal(item, null)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold font-vietnam text-white bg-feast-sunset rounded-lg hover:bg-feast-sunset-dark transition-colors"
                              >
                                <Plus size={12} />
                                Tambahkan
                              </button>
                            )
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      <OutletProductModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        brandProduct={selectedBrandProduct}
        outletProduct={selectedOutletProduct}
        outletId={selectedOutletId}
        onSuccess={refetch}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Hapus dari Outlet"
        message="Menu ini akan dihapus dari outlet. Data harga dan stok outlet akan hilang, tapi menu brand tetap ada."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
