import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, UtensilsCrossed, Search, SlidersHorizontal } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { usePermission } from '../../hooks/usePermission';
import { useToast } from '../../hooks/useToast';
import { categoriesApi, brandProductsApi } from '../../api/catalog';
import { handleApiError } from '../../api/errorHandler';
import { formatIDR } from '../../utils/format';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import BrandProductModal from './components/BrandProductModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function BrandProductsTab() {
  const toast = useToast();
  const canCreate = usePermission('products.create');
  const canUpdate = usePermission('products.update');
  const canDelete = usePermission('products.delete');

  const { data: categoriesData } = useApi(() => categoriesApi.list(), []);
  const { data: productsData, isLoading, refetch } = useApi(
    () => brandProductsApi.list({ page_size: 200 }),
    []
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  const categories = categoriesData?.results ?? categoriesData ?? [];

  const filteredProducts = useMemo(() => {
    const all = productsData?.results ?? productsData ?? [];
    return all.filter((p) => {
      if (filterActiveOnly && !p.is_active) return false;
      if (filterCategory && String(p.category_id) !== String(filterCategory)) return false;
      if (filterSearch && !p.name.toLowerCase().includes(filterSearch.toLowerCase())) return false;
      return true;
    });
  }, [productsData, filterCategory, filterSearch, filterActiveOnly]);

  const getCategoryName = (catId) => categories.find((c) => String(c.id) === String(catId ?? ''))?.name ?? '-';

  const openCreate = () => { setEditingItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setModalOpen(true); };
  const handleModalClose = () => { setModalOpen(false); setEditingItem(null); };

  const handleDelete = async () => {
    try {
      await brandProductsApi.delete(confirmDeleteId);
      toast.success('Menu dihapus');
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
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-feast-dark-muted" />
          <input
            type="text"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Cari nama menu..."
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-sm font-vietnam text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-feast-dark-muted flex-shrink-0" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white rounded-xl px-3 py-2.5 text-sm font-vietnam text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <button
            onClick={() => setFilterActiveOnly(!filterActiveOnly)}
            className={`px-4 py-2.5 text-sm font-semibold font-vietnam rounded-xl transition-colors whitespace-nowrap ${
              filterActiveOnly
                ? 'bg-feast-sunset text-white'
                : 'bg-white text-feast-dark-muted hover:text-feast-dark'
            }`}
          >
            Aktif saja
          </button>

          {canCreate && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-full hover:bg-feast-sunset-dark transition-all hover:shadow-lg hover:shadow-feast-sunset/20 whitespace-nowrap"
            >
              <Plus size={16} />
              Tambah Menu
            </button>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Belum ada menu"
          description={filterSearch || filterCategory ? 'Tidak ada menu yang sesuai filter' : 'Tambah menu pertama untuk brand Anda'}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              {/* Image */}
              <div className="relative h-40 bg-feast-bg">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed size={32} className="text-feast-dark-muted/30" />
                  </div>
                )}
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canUpdate && (
                    <button
                      onClick={() => openEdit(product)}
                      className="p-1.5 bg-white/90 backdrop-blur text-feast-dark-muted hover:text-feast-sunset rounded-lg shadow transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setConfirmDeleteId(product.id)}
                      className="p-1.5 bg-white/90 backdrop-blur text-feast-dark-muted hover:text-red-500 rounded-lg shadow transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-jakarta text-sm font-bold text-feast-dark leading-tight">{product.name}</h3>
                  <StatusBadge
                    variant={product.is_active ? 'success' : 'neutral'}
                    label={product.is_active ? 'Aktif' : 'Nonaktif'}
                  />
                </div>
                <p className="text-xs text-feast-dark-muted font-vietnam mb-3">{getCategoryName(product.category_id)}</p>
                <p className="text-base font-bold text-feast-sunset font-jakarta">{formatIDR(product.base_price)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <BrandProductModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        editingItem={editingItem}
        categories={categories}
        onSuccess={refetch}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Hapus Menu"
        message="Menu yang dihapus tidak bisa dikembalikan. Outlet products yang terkait juga akan terpengaruh."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
