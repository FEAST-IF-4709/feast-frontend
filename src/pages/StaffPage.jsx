import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Users, ShieldCheck, Store, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { usePermission } from '../hooks/usePermission';
import { useToast } from '../hooks/useToast';
import { employeesApi } from '../api/employees';
import { outletsApi } from '../api/outlets';
import { rbacApi } from '../api/rbac';
import { handleApiError } from '../api/errorHandler';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import FormField from '../components/FormField';
import StatusBadge from '../components/StatusBadge';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const EMPTY_FORM = {
  full_name: '',
  email: '',
  password: '',
  role: '',
  outlet: '',
  is_active: true,
};

function StaffModal({ isOpen, onClose, editingItem, roles, outlets, onSuccess }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setShowPassword(false);
      setForm(editingItem ? {
        full_name: editingItem.full_name ?? '',
        email: editingItem.email ?? '',
        password: '',
        role: editingItem.role_id ?? '',
        outlet: editingItem.outlet_id ?? '',
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
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      role_id: form.role || undefined,
      outlet_id: form.outlet || null,
      is_active: form.is_active,
    };
    if (!editingItem || form.password) {
      payload.password = form.password;
    }
    try {
      if (editingItem) {
        await employeesApi.update(editingItem.id, payload);
        toast.success('Staff diperbarui');
      } else {
        await employeesApi.create(payload);
        toast.success('Staff ditambahkan');
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
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-jakarta text-xl font-bold text-feast-dark mb-5">
              {editingItem ? 'Edit Staff' : 'Tambah Staff'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Nama Lengkap"
                name="full_name"
                value={form.full_name}
                onChange={set('full_name')}
                placeholder="cth. Budi Santoso"
                required
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="budi@restoran.com"
                required
              />

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-feast-dark-secondary font-vietnam">
                  Password{editingItem && <span className="text-feast-dark-muted font-normal"> (kosongkan jika tidak diubah)</span>}
                  {!editingItem && <span className="text-feast-beetroot ml-0.5">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder={editingItem ? '••••••••' : 'Min. 8 karakter'}
                    required={!editingItem}
                    className="w-full bg-feast-bg rounded-xl px-4 py-3 pr-10 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-feast-dark-muted hover:text-feast-dark"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <FormField
                label="Role"
                name="role"
                as="select"
                value={form.role}
                onChange={set('role')}
                required={!editingItem}
              >
                <option value="">-- Pilih Role --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </FormField>

              <FormField
                label="Outlet Penugasan"
                name="outlet"
                as="select"
                value={form.outlet}
                onChange={set('outlet')}
              >
                <option value="">-- Semua Outlet --</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </FormField>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={set('is_active')}
                  className="w-4 h-4 accent-feast-sunset"
                />
                <span className="text-sm font-vietnam text-feast-dark">Staff Aktif</span>
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

export default function StaffPage() {
  const toast = useToast();
  const canCreate = usePermission('staff.create');
  const canUpdate = usePermission('staff.update');
  const canDelete = usePermission('staff.delete');

  const { data: staffData, isLoading, refetch } = useApi(() => employeesApi.list(), []);
  const { data: rolesData } = useApi(() => rbacApi.roles.list(), []);
  const { data: outletsData } = useApi(() => outletsApi.list(), []);

  const staff = staffData?.results ?? (Array.isArray(staffData) ? staffData : []);
  const roles = rolesData?.results ?? (Array.isArray(rolesData) ? rolesData : []);
  const outlets = outletsData?.results ?? (Array.isArray(outletsData) ? outletsData : []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const openCreate = () => { setEditingItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); };

  const handleDelete = async () => {
    try {
      await employeesApi.delete(confirmDeleteId);
      toast.success('Staff dihapus');
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
        title="Staff"
        subtitle="Manajemen"
        actions={
          canCreate && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-feast-sunset hover:bg-feast-sunset-dark text-white text-sm font-semibold font-vietnam rounded-full transition-all hover:shadow-lg hover:shadow-feast-sunset/20"
            >
              <Plus size={16} />
              Tambah Staff
            </button>
          )
        }
      />

      <div className="p-8">
        {isLoading ? (
          <LoadingSpinner fullPage />
        ) : staff.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada staff"
            description="Tambahkan staff untuk mulai mengelola tim Anda"
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
                    <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Nama</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Email</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Role</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Outlet</th>
                    <th className="text-center px-5 py-4 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Status</th>
                    <th className="text-right px-5 py-4 text-xs font-semibold uppercase tracking-wider text-feast-dark-muted font-vietnam">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <motion.tr
                      key={member.id}
                      variants={itemVariants}
                      className="border-b border-feast-bg last:border-0 hover:bg-feast-bg/40 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-feast-sunset/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-feast-sunset">
                              {member.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-feast-dark font-jakarta">{member.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-feast-dark-secondary font-vietnam">{member.email}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck size={13} className="text-feast-dark-muted" />
                          <span className="text-sm text-feast-dark-secondary font-vietnam">
                            {member.role_name ?? '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Store size={13} className="text-feast-dark-muted" />
                          <span className="text-sm text-feast-dark-secondary font-vietnam">
                            {member.outlet_name ?? 'Semua Outlet'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <StatusBadge
                          variant={member.is_active ? 'success' : 'neutral'}
                          label={member.is_active ? 'Aktif' : 'Nonaktif'}
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && (
                            <button
                              onClick={() => openEdit(member)}
                              className="p-1.5 text-feast-dark-muted hover:text-feast-sunset hover:bg-feast-sunset/5 rounded-lg transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setConfirmDeleteId(member.id)}
                              className="p-1.5 text-feast-dark-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>

      <StaffModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingItem={editingItem}
        roles={roles}
        outlets={outlets}
        onSuccess={refetch}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Hapus Staff"
        message="Akun staff akan dihapus permanen. Aksi ini tidak bisa dibatalkan."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
