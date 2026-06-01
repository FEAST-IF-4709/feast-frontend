import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Building2, MapPin, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { usePermission } from '../hooks/usePermission';
import { useToast } from '../hooks/useToast';
import { outletsApi } from '../api/outlets';
import { handleApiError } from '../api/errorHandler';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const EMPTY_FORM = {
  name: '',
  address: '',
  phone: '',
  latitude: '',
  longitude: '',
  is_active: true,
};

function OutletModal({ isOpen, onClose, editingItem, onSuccess }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setForm(editingItem ? {
        name: editingItem.name ?? '',
        address: editingItem.address ?? '',
        phone: editingItem.phone ?? '',
        latitude: editingItem.latitude ?? '',
        longitude: editingItem.longitude ?? '',
        is_active: editingItem.is_active ?? true,
      } : EMPTY_FORM);
    }
  }, [isOpen, editingItem]);

  const set = (field) => (e) => setForm((f) => ({
    ...f,
    [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      is_active: form.is_active,
      ...(form.latitude !== '' && { latitude: parseFloat(form.latitude) }),
      ...(form.longitude !== '' && { longitude: parseFloat(form.longitude) }),
    };
    try {
      if (editingItem) {
        await outletsApi.update(editingItem.id, payload);
        toast.success('Outlet diperbarui');
      } else {
        await outletsApi.create(payload);
        toast.success('Outlet ditambahkan');
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
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-jakarta text-xl font-bold text-feast-dark mb-5">
              {editingItem ? 'Edit Outlet' : 'Tambah Outlet'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Nama Outlet"
                name="name"
                value={form.name}
                onChange={set('name')}
                placeholder="cth. Cabang Sudirman"
                required
              />
              <FormField
                label="Alamat"
                name="address"
                as="textarea"
                value={form.address}
                onChange={set('address')}
                placeholder="Jl. Sudirman No. 1, Jakarta Selatan"
              />
              <FormField
                label="Nomor Telepon"
                name="phone"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+62 21 1234567"
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={set('latitude')}
                  placeholder="-6.2088"
                />
                <FormField
                  label="Longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={set('longitude')}
                  placeholder="106.8456"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={set('is_active')}
                  className="w-4 h-4 accent-feast-sunset"
                />
                <span className="text-sm font-vietnam text-feast-dark">Outlet Aktif</span>
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

export default function OutletsPage() {
  const toast = useToast();
  const canCreate = usePermission('outlet.create');
  const canUpdate = usePermission('outlet.update');
  const canDelete = usePermission('outlet.delete');

  const { data: outletsData, isLoading, refetch } = useApi(() => outletsApi.list(), []);
  const outlets = outletsData?.results ?? (Array.isArray(outletsData) ? outletsData : []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const openCreate = () => { setEditingItem(null); setModalOpen(true); };
  const openEdit = (outlet) => { setEditingItem(outlet); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); };

  const handleDelete = async () => {
    try {
      await outletsApi.delete(confirmDeleteId);
      toast.success('Outlet dihapus');
      refetch();
    } catch (err) {
      handleApiError(err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-feast-bg">
      <PageHeader
        title="Outlets"
        subtitle="Manajemen"
        actions={
          canCreate && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-feast-sunset hover:bg-feast-sunset-dark text-white text-sm font-semibold font-vietnam rounded-full transition-all hover:shadow-lg hover:shadow-feast-sunset/20"
            >
              <Plus size={16} />
              Tambah Outlet
            </button>
          )
        }
      />

      <div className="p-8">
        {isLoading ? (
          <LoadingSpinner fullPage />
        ) : outlets.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Belum ada outlet"
            description="Tambahkan outlet pertama untuk mulai mengelola cabang bisnis Anda"
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {outlets.map((outlet) => (
              <motion.div
                key={outlet.id}
                variants={itemVariants}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-feast-sunset/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 size={18} className="text-feast-sunset" />
                    </div>
                    <div>
                      <h3 className="font-jakarta font-bold text-feast-dark text-sm leading-tight">{outlet.name}</h3>
                      <StatusBadge
                        variant={outlet.is_active ? 'success' : 'neutral'}
                        label={outlet.is_active ? 'Aktif' : 'Nonaktif'}
                      />
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canUpdate && (
                      <button
                        onClick={() => openEdit(outlet)}
                        className="p-1.5 text-feast-dark-muted hover:text-feast-sunset hover:bg-feast-sunset/5 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setConfirmDeleteId(outlet.id)}
                        className="p-1.5 text-feast-dark-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mt-4">
                  {outlet.address && (
                    <div className="flex items-start gap-2">
                      <MapPin size={13} className="text-feast-dark-muted mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-feast-dark-secondary font-vietnam leading-snug line-clamp-2">
                        {outlet.address}
                      </p>
                    </div>
                  )}
                  {outlet.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-feast-dark-muted flex-shrink-0" />
                      <p className="text-xs text-feast-dark-secondary font-vietnam">{outlet.phone}</p>
                    </div>
                  )}
                  {outlet.latitude && outlet.longitude && (
                    <p className="text-xs text-feast-dark-muted font-mono ml-5">
                      {parseFloat(outlet.latitude).toFixed(4)}, {parseFloat(outlet.longitude).toFixed(4)}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <OutletModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingItem={editingItem}
        onSuccess={refetch}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Hapus Outlet"
        message="Data outlet akan dihapus permanen. Aksi ini tidak bisa dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
