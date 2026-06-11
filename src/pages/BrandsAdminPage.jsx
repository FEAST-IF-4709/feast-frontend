import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Building2, ToggleLeft, ToggleRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminBrandsApi } from '../api/brands';
import { handleApiError } from '../api/errorHandler';
import { useToast } from '../hooks/useToast';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const SUBSCRIPTION_OPTIONS = ['TRIAL', 'ACTIVE', 'SUSPENDED'];

const EMPTY_FORM = {
  name: '',
  slug: '',
  owner_email: '',
  subscription_status: 'TRIAL',
  is_active: true,
  description: '',
  phone: '',
  cuisine_type: '',
  location_address: '',
};

function toSlug(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function BrandModal({ isOpen, onClose, editingBrand, onSuccess }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingBrand) {
      setForm({
        name: editingBrand.name ?? '',
        slug: editingBrand.slug ?? '',
        owner_email: editingBrand.owner_email ?? '',
        subscription_status: editingBrand.subscription_status ?? 'TRIAL',
        is_active: editingBrand.is_active ?? true,
        description: editingBrand.description ?? '',
        phone: editingBrand.phone ?? '',
        cuisine_type: editingBrand.cuisine_type ?? '',
        location_address: editingBrand.location_address ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [isOpen, editingBrand]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((f) => ({
      ...f,
      name,
      slug: editingBrand ? f.slug : toSlug(name),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      owner_email: form.owner_email.trim(),
      subscription_status: form.subscription_status,
      is_active: form.is_active,
      description: form.description.trim(),
      phone: form.phone.trim(),
      cuisine_type: form.cuisine_type.trim(),
      location_address: form.location_address.trim(),
    };
    try {
      if (editingBrand) {
        await adminBrandsApi.update(editingBrand.id, payload);
        toast.success('Brand diperbarui');
      } else {
        await adminBrandsApi.create(payload);
        toast.success('Brand ditambahkan');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingBrand ? 'Edit Brand' : 'Tambah Brand'} size="lg">
      <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Nama Brand"
            name="name"
            value={form.name}
            onChange={handleNameChange}
            placeholder="The Kinetic Kitchen"
            required
          />
          <FormField
            label="Slug"
            name="slug"
            value={form.slug}
            onChange={set('slug')}
            placeholder="the-kinetic-kitchen"
            required
          />
        </div>
        <FormField
          label="Email Owner"
          name="owner_email"
          type="email"
          value={form.owner_email}
          onChange={set('owner_email')}
          placeholder="owner@brand.com"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tipe Masakan" name="cuisine_type" value={form.cuisine_type} onChange={set('cuisine_type')} placeholder="Indonesian, Western…" />
          <FormField label="No. Telepon" name="phone" value={form.phone} onChange={set('phone')} placeholder="+6281234567890" />
        </div>
        <FormField label="Deskripsi" name="description" value={form.description} onChange={set('description')} as="textarea" placeholder="Deskripsi singkat brand…" />
        <FormField label="Alamat" name="location_address" value={form.location_address} onChange={set('location_address')} as="textarea" placeholder="Jl. …" />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Status Subscription" name="subscription_status" as="select" value={form.subscription_status} onChange={set('subscription_status')}>
            {SUBSCRIPTION_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </FormField>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-feast-dark-secondary font-vietnam">Status Brand</label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold font-vietnam transition-colors w-full ${
                form.is_active ? 'bg-green-50 text-green-700' : 'bg-feast-bg text-feast-dark-muted'
              }`}
            >
              {form.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {form.is_active ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-feast-bg text-feast-dark text-sm font-semibold font-vietnam rounded-xl hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-xl hover:bg-feast-sunset-dark transition-colors disabled:opacity-60"
          >
            {isSaving ? 'Menyimpan…' : editingBrand ? 'Simpan Perubahan' : 'Tambah Brand'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function OwnerModal({ isOpen, onClose, brand }) {
  const toast = useToast();
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ full_name: '', email: '', password: '' });
  }, [isOpen]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await adminBrandsApi.createOwner(brand.id, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success(res.data?.message || 'Akun owner berhasil dibuat');
      onClose();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Buat Akun Owner — ${brand?.name ?? ''}`} size="md">
      <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
        <p className="text-xs text-feast-dark-muted font-vietnam">
          Akun ini akan login sebagai <span className="font-semibold text-feast-sunset">BRAND_OWNER</span> dan memiliki akses penuh ke brand ini.
        </p>
        <FormField
          label="Nama Lengkap"
          name="full_name"
          value={form.full_name}
          onChange={set('full_name')}
          placeholder="John Doe"
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="owner@brand.com"
          required
        />
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-feast-dark-secondary font-vietnam">
            Password <span className="text-feast-beetroot">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder="Min. 8 karakter"
              required
              minLength={8}
              className="w-full bg-feast-bg rounded-xl px-4 py-3 pr-11 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-feast-dark-muted hover:text-feast-dark transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-feast-bg text-feast-dark text-sm font-semibold font-vietnam rounded-xl hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-xl hover:bg-feast-sunset-dark transition-colors disabled:opacity-60"
          >
            {isSaving ? 'Membuat…' : 'Buat Akun Owner'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function BrandsAdminPage() {
  const toast = useToast();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [ownerTarget, setOwnerTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminBrandsApi.list();
      setBrands(res.data?.data ?? []);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingBrand(null); setModalOpen(true); };
  const openEdit = (brand) => { setEditingBrand(brand); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminBrandsApi.delete(deleteTarget.id);
      toast.success(`Brand "${deleteTarget.name}" dihapus`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const subscriptionColor = {
    ACTIVE: 'text-green-700 bg-green-50',
    TRIAL: 'text-amber-700 bg-amber-50',
    SUSPENDED: 'text-red-600 bg-red-50',
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Manajemen Brand"
        subtitle="Kelola semua brand terdaftar dalam sistem FEAST"
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-xl hover:bg-feast-sunset-dark transition-colors"
          >
            <Plus size={16} />
            Tambah Brand
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : brands.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Belum ada brand"
          description="Klik Tambah Brand untuk mendaftarkan brand pertama."
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="bg-white rounded-2xl overflow-hidden shadow-sm"
        >
          <table className="w-full text-sm font-vietnam">
            <thead>
              <tr className="bg-feast-bg text-feast-dark-secondary text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Brand</th>
                <th className="px-5 py-3 text-left">Owner</th>
                <th className="px-5 py-3 text-left">Subscription</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Cuisine</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {brands.map((brand) => (
                  <motion.tr
                    key={brand.id}
                    variants={itemVariants}
                    className="border-t border-feast-bg hover:bg-feast-bg/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {brand.logo_url ? (
                          <img src={brand.logo_url} alt={brand.name} className="w-9 h-9 rounded-xl object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-feast-sunset/10 flex items-center justify-center">
                            <Building2 size={16} className="text-feast-sunset" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-feast-dark">{brand.name}</p>
                          <p className="text-xs text-feast-dark-muted">{brand.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-feast-dark-secondary">{brand.owner_email}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${subscriptionColor[brand.subscription_status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {brand.subscription_status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        variant={brand.is_active ? 'success' : 'neutral'}
                        label={brand.is_active ? 'Aktif' : 'Nonaktif'}
                      />
                    </td>
                    <td className="px-5 py-4 text-feast-dark-secondary">{brand.cuisine_type || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setOwnerTarget(brand)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-feast-dark-muted hover:text-blue-600 transition-colors"
                          title="Buat Akun Owner"
                        >
                          <UserPlus size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(brand)}
                          className="p-2 rounded-lg hover:bg-feast-bg text-feast-dark-muted hover:text-feast-dark transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(brand)}
                          className="p-2 rounded-lg hover:bg-red-50 text-feast-dark-muted hover:text-red-500 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      )}

      <BrandModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingBrand={editingBrand}
        onSuccess={load}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Brand"
        message={`Yakin ingin menghapus brand "${deleteTarget?.name}"? Semua data terkait (outlet, produk, staff) mungkin ikut terhapus.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmText="Hapus Brand"
      />

      <OwnerModal
        isOpen={!!ownerTarget}
        onClose={() => setOwnerTarget(null)}
        brand={ownerTarget}
      />
    </div>
  );
}
