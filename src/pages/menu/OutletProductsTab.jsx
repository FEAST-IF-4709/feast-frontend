import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Plus, UtensilsCrossed, Store } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { usePermission } from '../../hooks/usePermission';
import { categoriesApi, brandProductsApi, outletProductsApi } from '../../api/catalog';
import { outletsApi } from '../../api/outlets';
import { formatIDR } from '../../utils/format';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
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
  const canUpdate = usePermission('products.update');
  const canCreate = usePermission('products.create');

  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBrandProduct, setSelectedBrandProduct] = useState(null);
  const [selectedOutletProduct, setSelectedOutletProduct] = useState(null);

  const { data: outletsData } = useApi(() => outletsApi.list(), []);
  const { data: categoriesData } = useApi(() => categoriesApi.list(), []);
  const { data: brandProductsData, isLoading: loadingBp } = useApi(
    () => brandProductsApi.list({ page_size: 200 }),
    []
  );
  const { data: outletProductsData, isLoading: loadingOp, refetch } = useApi(
    () =>
      selectedOutletId
        ? outletProductsApi.list(selectedOutletId)
        : Promise.resolve({ data: { data: null } }),
    [selectedOutletId]
  );

  const outlets = outletsData?.results ?? outletsData ?? [];
  const categories = categoriesData?.results ?? categoriesData ?? [];

  const mergedList = useMemo(() => {
    const bps = brandProductsData?.results ?? brandProductsData ?? [];
    const ops = outletProductsData?.results ?? outletProductsData ?? [];
    return bps.map((bp) => ({
      ...bp,
      outletProduct: Array.isArray(ops)
        ? ops.find((op) => String(op.brand_product) === String(bp.id)) ?? null
        : null,
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

  const isLoading = loadingBp || (selectedOutletId && loadingOp);

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
          <span className="text-xs text-feast-dark-muted font-vietnam">
            {mergedList.length} menu brand
          </span>
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
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
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
                          {getCategoryName(item.category)}
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
                            canUpdate && (
                              <button
                                onClick={() => openModal(item, op)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold font-vietnam text-feast-sunset border border-feast-sunset/30 rounded-lg hover:bg-feast-sunset/5 transition-colors"
                              >
                                <Pencil size={12} />
                                Edit
                              </button>
                            )
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
    </div>
  );
}
