import React, { useState } from 'react';
import { Plus, RefreshCw, QrCode, Pencil, Trash2, RotateCw, Grid3x3, Building2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { usePermission } from '../hooks/usePermission';
import { useToast } from '../hooks/useToast';
import { tablesApi, outletsApi } from '../api/outlets';
import { handleApiError } from '../api/errorHandler';
import { formatDateTime } from '../utils/format';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';
import { TableQRModal } from '../components/TableQRModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const EMPTY_FORM = { label: '', capacity: 4, is_active: true };

function TableModal({ isOpen, onClose, editingItem, outletId, onSuccess }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setForm(editingItem
        ? { label: editingItem.label ?? '', capacity: editingItem.capacity ?? 4, is_active: editingItem.is_active ?? true }
        : EMPTY_FORM
      );
    }
  }, [isOpen, editingItem]);

  const set = (field) => (e) => setForm((f) => ({
    ...f,
    [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) return;
    setIsSaving(true);
    const payload = {
      label: form.label.trim(),
      capacity: parseInt(form.capacity) || 1,
      is_active: form.is_active,
    };
    try {
      if (editingItem) {
        await tablesApi.update(editingItem.id, payload);
        toast.success('Meja diperbarui');
      } else {
        await tablesApi.create(outletId, payload);
        toast.success('Meja ditambahkan');
      }
      onSuccess();
      onClose();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

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
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-jakarta text-xl font-bold text-feast-dark mb-5">
              {editingItem ? 'Edit Meja' : 'Tambah Meja'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Label Meja"
                name="label"
                value={form.label}
                onChange={set('label')}
                placeholder="cth. Meja 5"
                required
              />
              <FormField
                label="Kapasitas"
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={set('capacity')}
                min={1}
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={set('is_active')}
                  className="w-4 h-4 accent-feast-sunset"
                />
                <span className="text-sm font-vietnam text-feast-dark">Meja Aktif</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-feast-sunset hover:bg-feast-sunset-dark text-white text-sm font-semibold font-vietnam rounded-full transition-all disabled:opacity-60"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-feast-bg hover:bg-gray-200 text-feast-dark text-sm font-semibold font-vietnam rounded-full transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OutletTableSection({ outlet, canCreate, canUpdate, canDelete }) {
  const toast = useToast();
  const [isExpanded, setIsExpanded] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [qrModalTable, setQrModalTable] = useState(null);
  const [rotatingId, setRotatingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const { data: tablesData, isLoading, refetch } = useApi(
    () => tablesApi.list(outlet.id),
    [outlet.id]
  );
  const tables = tablesData?.results ?? (Array.isArray(tablesData) ? tablesData : []);

  const openCreate = () => { setEditingItem(null); setModalOpen(true); };
  const openEdit = (table) => { setEditingItem(table); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); };

  const handleRotateQR = async (tableId) => {
    setRotatingId(tableId);
    try {
      await tablesApi.rotateQr(tableId);
      toast.success('QR code diperbarui');
      refetch();
    } catch (err) {
      handleApiError(err);
    } finally {
      setRotatingId(null);
    }
  };

  const handleToggleStatus = async (table) => {
    setTogglingId(table.id);
    try {
      await tablesApi.update(table.id, { is_active: !table.is_active });
      toast.success(table.is_active ? 'Meja dinonaktifkan' : 'Meja diaktifkan');
      refetch();
    } catch (err) {
      handleApiError(err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    try {
      await tablesApi.delete(confirmDeleteId);
      toast.success('Meja dihapus');
      refetch();
    } catch (err) {
      handleApiError(err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Outlet header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-feast-bg/30 transition-colors select-none"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-feast-sunset/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 size={16} className="text-feast-sunset" />
          </div>
          <div>
            <h3 className="font-jakarta font-bold text-feast-dark text-sm leading-tight">{outlet.name}</h3>
            <p className="text-xs text-feast-dark-muted font-vietnam mt-0.5">
              {isLoading ? 'Memuat...' : `${tables.length} meja terdaftar`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            variant={outlet.is_active ? 'success' : 'neutral'}
            label={outlet.is_active ? 'Aktif' : 'Nonaktif'}
          />
          {canCreate && (
            <button
              onClick={(e) => { e.stopPropagation(); openCreate(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-feast-sunset hover:bg-feast-sunset-dark text-white text-xs font-semibold font-vietnam rounded-full transition-all hover:shadow-md hover:shadow-feast-sunset/20"
            >
              <Plus size={12} /> Tambah Meja
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-feast-dark-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Collapsible table list */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-feast-bg">
              {isLoading ? (
                <div className="py-10 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : tables.length === 0 ? (
                <EmptyState
                  icon={Grid3x3}
                  title="Belum ada meja"
                  description="Tambah meja untuk mulai mengelola QR dine-in di outlet ini"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-feast-bg bg-feast-bg/40">
                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">QR Token</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Meja</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Kapasitas</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Dibuat</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Diperbarui</th>
                        <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Status</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tables.map((table) => (
                        <motion.tr
                          key={table.id}
                          variants={rowVariants}
                          initial="hidden"
                          animate="show"
                          className="border-b border-feast-bg last:border-0 hover:bg-feast-bg/40 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-mono font-semibold text-feast-sunset">
                              {table.qr_token ? `${table.qr_token.slice(0, 12)}…` : '-'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-sm font-bold text-feast-dark font-jakarta">{table.label}</td>
                          <td className="px-5 py-3.5 text-sm text-feast-dark-secondary font-vietnam">{table.capacity} kursi</td>
                          <td className="px-5 py-3.5 text-sm text-feast-dark-secondary font-vietnam">{formatDateTime(table.created_at)}</td>
                          <td className="px-5 py-3.5 text-sm text-feast-dark-secondary font-vietnam">{formatDateTime(table.updated_at)}</td>
                          <td className="px-5 py-3.5 text-center">
                            {canUpdate ? (
                              <button
                                onClick={() => handleToggleStatus(table)}
                                disabled={togglingId === table.id}
                                title="Klik untuk ubah status"
                                className="disabled:opacity-50 transition-opacity hover:opacity-75"
                              >
                                <StatusBadge
                                  variant={table.is_active ? 'success' : 'neutral'}
                                  label={togglingId === table.id ? '...' : table.is_active ? 'Aktif' : 'Nonaktif'}
                                />
                              </button>
                            ) : (
                              <StatusBadge
                                variant={table.is_active ? 'success' : 'neutral'}
                                label={table.is_active ? 'Aktif' : 'Nonaktif'}
                              />
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setQrModalTable(table)}
                                className="p-1.5 text-feast-dark-muted hover:text-feast-sunset hover:bg-feast-sunset/5 rounded-lg transition-colors"
                                title="Lihat QR"
                              >
                                <QrCode size={14} />
                              </button>
                              {canUpdate && (
                                <>
                                  <button
                                    onClick={() => openEdit(table)}
                                    className="p-1.5 text-feast-dark-muted hover:text-feast-sunset hover:bg-feast-sunset/5 rounded-lg transition-colors"
                                    title="Edit Meja"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleRotateQR(table.id)}
                                    disabled={rotatingId === table.id}
                                    className="p-1.5 text-feast-dark-muted hover:text-feast-amber hover:bg-feast-amber/5 rounded-lg transition-colors disabled:opacity-50"
                                    title="Regenerate QR"
                                  >
                                    <RotateCw size={14} className={rotatingId === table.id ? 'animate-spin' : ''} />
                                  </button>
                                </>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => setConfirmDeleteId(table.id)}
                                  className="p-1.5 text-feast-dark-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Hapus Meja"
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TableModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingItem={editingItem}
        outletId={outlet.id}
        onSuccess={refetch}
      />
      <TableQRModal
        table={qrModalTable}
        isOpen={!!qrModalTable}
        onClose={() => setQrModalTable(null)}
      />
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Hapus Meja"
        message="Data meja beserta QR code-nya akan dihapus permanen."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

export default function TablePage() {
  const canCreate = usePermission('tables.create');
  const canUpdate = usePermission('tables.update');
  const canDelete = usePermission('tables.delete');

  const { data: outletsData, isLoading, refetch } = useApi(() => outletsApi.list(), []);
  const outlets = outletsData?.results ?? (Array.isArray(outletsData) ? outletsData : []);

  return (
    <div className="min-h-screen bg-feast-bg">
      <PageHeader
        title="Scan QR & Labeling"
        subtitle="Manajemen"
        actions={
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-feast-dark text-sm font-semibold font-vietnam rounded-full border border-feast-bg hover:bg-feast-bg transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      <div className="p-8">
        {isLoading ? (
          <LoadingSpinner fullPage />
        ) : outlets.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Tidak ada outlet"
            description="Tambahkan outlet terlebih dahulu sebelum mengelola meja"
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {outlets.map((outlet) => (
              <motion.div key={outlet.id} variants={itemVariants}>
                <OutletTableSection
                  outlet={outlet}
                  canCreate={canCreate}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
