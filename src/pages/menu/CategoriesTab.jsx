import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { usePermission } from '../../hooks/usePermission';
import { useToast } from '../../hooks/useToast';
import { categoriesApi } from '../../api/catalog';
import { handleApiError } from '../../api/errorHandler';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import CategoryModal from './components/CategoryModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function CategoriesTab() {
  const toast = useToast();
  const canCreate = usePermission('products.create');
  const canUpdate = usePermission('products.update');
  const canDelete = usePermission('products.delete');

  const { data, isLoading, refetch } = useApi(() => categoriesApi.list(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const categories = data?.results ?? data ?? [];

  const openCreate = () => { setEditingItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setModalOpen(true); };
  const handleModalClose = () => { setModalOpen(false); setEditingItem(null); };

  const handleDelete = async () => {
    try {
      await categoriesApi.delete(confirmDeleteId);
      toast.success('Kategori dihapus');
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
      <div className="flex justify-end mb-4">
        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-full hover:bg-feast-sunset-dark transition-all hover:shadow-lg hover:shadow-feast-sunset/20"
          >
            <Plus size={16} />
            Tambah Kategori
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Belum ada kategori"
          description="Tambah kategori untuk mengelompokkan menu Anda"
        />
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-feast-bg">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam w-12">No.</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam w-24">Urutan</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Nama Kategori</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <motion.tr
                    key={cat.id}
                    variants={itemVariants}
                    className="border-b border-feast-bg last:border-0 hover:bg-feast-bg/50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm text-feast-dark-muted font-vietnam">{i + 1}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-feast-bg rounded-lg text-sm font-bold text-feast-dark font-jakarta">
                        {cat.sequence ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-feast-dark font-jakarta">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canUpdate && (
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-1.5 text-feast-dark-muted hover:text-feast-sunset rounded-lg hover:bg-feast-bg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setConfirmDeleteId(cat.id)}
                            className="p-1.5 text-feast-dark-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        editingItem={editingItem}
        onSuccess={refetch}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Hapus Kategori"
        message="Kategori yang dihapus tidak bisa dikembalikan. Menu yang menggunakan kategori ini mungkin terpengaruh."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
