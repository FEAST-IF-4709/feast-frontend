import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import FormField from '../../../components/FormField';
import { promotionsApi, brandProductsApi } from '../../../api/catalog';
import { handleApiError } from '../../../api/errorHandler';
import { useToast } from '../../../hooks/useToast';
import { useApi } from '../../../hooks/useApi';

const toLocalDatetimeValue = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function PromotionModal({ isOpen, onClose, editingItem, onSuccess }) {
  const toast = useToast();

  const [form, setForm] = useState({
    brand_product: '', discount_type: 'PERCENT', discount_value: '', starts_at: '', ends_at: '', is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: productsData } = useApi(() => brandProductsApi.list({ page_size: 200, is_active: true }), []);
  const products = productsData?.results ?? productsData ?? [];

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    if (editingItem) {
      setForm({
        brand_product: String(editingItem.brand_product ?? ''),
        discount_type: editingItem.discount_type ?? 'PERCENT',
        discount_value: editingItem.discount_value ?? '',
        starts_at: toLocalDatetimeValue(editingItem.starts_at),
        ends_at: toLocalDatetimeValue(editingItem.ends_at),
        is_active: editingItem.is_active ?? true,
      });
    } else {
      setForm({ brand_product: '', discount_type: 'PERCENT', discount_value: '', starts_at: '', ends_at: '', is_active: true });
    }
  }, [isOpen, editingItem]);

  const validate = () => {
    const errs = {};
    if (!form.brand_product) errs.brand_product = 'Pilih menu terlebih dahulu';
    if (!form.discount_value || parseFloat(form.discount_value) <= 0) errs.discount_value = 'Nilai diskon harus lebih dari 0';
    if (form.discount_type === 'PERCENT' && parseFloat(form.discount_value) > 100) errs.discount_value = 'Diskon persen maksimal 100';
    if (!form.starts_at) errs.starts_at = 'Tanggal mulai wajib diisi';
    if (!form.ends_at) errs.ends_at = 'Tanggal selesai wajib diisi';
    if (form.starts_at && form.ends_at && new Date(form.ends_at) <= new Date(form.starts_at)) {
      errs.ends_at = 'Tanggal selesai harus setelah tanggal mulai';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = {
        brand_product: parseInt(form.brand_product),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        is_active: form.is_active,
      };

      if (editingItem) {
        await promotionsApi.update(editingItem.id, payload);
        toast.success('Promosi diperbarui');
      } else {
        await promotionsApi.create(payload);
        toast.success('Promosi ditambahkan');
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
                {editingItem ? 'Edit Promosi' : 'Tambah Promosi'}
              </h2>
              <button onClick={onClose} className="p-1.5 text-feast-dark-muted hover:text-feast-dark rounded-lg hover:bg-feast-bg transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Menu"
                name="brand_product"
                as="select"
                value={form.brand_product}
                onChange={(e) => setForm({ ...form, brand_product: e.target.value })}
                error={errors.brand_product}
                required
              >
                <option value="">-- Pilih Menu --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </FormField>

              {/* Discount type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-feast-dark-secondary font-vietnam">
                  Tipe Diskon <span className="text-feast-beetroot">*</span>
                </label>
                <div className="flex gap-3">
                  {['PERCENT', 'FIXED'].map((type) => (
                    <label
                      key={type}
                      className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                        form.discount_type === type
                          ? 'border-feast-sunset bg-feast-sunset/5'
                          : 'border-feast-bg hover:border-feast-sunset/30'
                      }`}
                    >
                      <input
                        type="radio"
                        value={type}
                        checked={form.discount_type === type}
                        onChange={() => setForm({ ...form, discount_type: type })}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.discount_type === type ? 'border-feast-sunset' : 'border-feast-dark-muted/30'}`}>
                        {form.discount_type === type && <div className="w-2 h-2 rounded-full bg-feast-sunset" />}
                      </div>
                      <span className="text-sm font-semibold font-vietnam text-feast-dark">
                        {type === 'PERCENT' ? '% Persen' : 'Rp Nominal'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <FormField
                label={form.discount_type === 'PERCENT' ? 'Nilai Diskon (%)' : 'Nilai Diskon (Rp)'}
                name="discount_value"
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                placeholder={form.discount_type === 'PERCENT' ? 'cth. 15 (untuk 15%)' : 'cth. 5000'}
                error={errors.discount_value}
                helperText={form.discount_type === 'PERCENT' ? 'Maksimal 100' : ''}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Mulai"
                  name="starts_at"
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  error={errors.starts_at}
                  required
                />
                <FormField
                  label="Selesai"
                  name="ends_at"
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                  error={errors.ends_at}
                  required
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-semibold text-feast-dark-secondary font-vietnam">Aktifkan Promosi</span>
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
