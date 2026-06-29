import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import FormField from '../../../components/FormField';
import { featuredBannerApi } from '../../../api/catalog';
import { outletsApi } from '../../../api/outlets';
import { handleApiError } from '../../../api/errorHandler';
import { useToast } from '../../../hooks/useToast';
import { useApi } from '../../../hooks/useApi';

export default function FeaturedBannerModal({ isOpen, onClose, editingItem, onSuccess }) {
  const toast = useToast();
  const { data: outletsData } = useApi(() => outletsApi.list(), []);
  const outlets = outletsData?.results ?? outletsData ?? [];

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    target_outlet_id: '',
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    if (editingItem) {
      setForm({
        title: editingItem.title ?? '',
        subtitle: editingItem.subtitle ?? '',
        image_url: editingItem.image_url ?? '',
        target_outlet_id: editingItem.target_outlet_id ? String(editingItem.target_outlet_id) : '',
        is_active: editingItem.is_active ?? true,
      });
    } else {
      setForm({ title: '', subtitle: '', image_url: '', target_outlet_id: '', is_active: true });
    }
  }, [isOpen, editingItem]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Judul banner wajib diisi';
    if (!form.image_url.trim()) errs.image_url = 'URL gambar wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        image_url: form.image_url,
        target_outlet_id: form.target_outlet_id || null,
        is_active: form.is_active,
      };

      if (editingItem) {
        await featuredBannerApi.update(payload);
        toast.success('Banner diperbarui');
      } else {
        await featuredBannerApi.create(payload);
        toast.success('Banner dibuat');
      }
      onSuccess();
      onClose();
    } catch (err) {
      handleApiError(err, { showError: toast.error });
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
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-jakarta text-xl font-bold text-feast-dark">
                {editingItem ? 'Edit Banner' : 'Buat Banner'}
              </h2>
              <button onClick={onClose} className="p-1.5 text-feast-dark-muted hover:text-feast-dark rounded-lg hover:bg-feast-bg transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Judul Banner"
                name="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                error={errors.title}
                placeholder="cth. Promo Akhir Bulan"
                required
              />

              <FormField
                label="Subjudul (opsional)"
                name="subtitle"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="cth. Diskon hingga 30% untuk menu pilihan"
              />

              <FormField
                label="URL Gambar Banner"
                name="image_url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                error={errors.image_url}
                placeholder="https://..."
                required
              />

              {form.image_url && (
                <div className="rounded-xl overflow-hidden h-32 bg-feast-bg">
                  <img src={form.image_url} alt="preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}

              <FormField
                label="Target Outlet (opsional)"
                name="target_outlet_id"
                as="select"
                value={form.target_outlet_id}
                onChange={(e) => setForm({ ...form, target_outlet_id: e.target.value })}
              >
                <option value="">-- Tidak ada (tampilkan daftar brand) --</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </FormField>

              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-semibold text-feast-dark-secondary font-vietnam">Aktifkan Banner</span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-feast-sunset' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
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
                  className="flex-1 py-2.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-xl hover:bg-feast-sunset-dark transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
