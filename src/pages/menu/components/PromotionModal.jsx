import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import FormField from '../../../components/FormField';
import { promotionsApi, brandProductsApi } from '../../../api/catalog';
import { handleApiError } from '../../../api/errorHandler';
import { useToast } from '../../../hooks/useToast';
import { useApi } from '../../../hooks/useApi';

const pad = (n) => String(n).padStart(2, '0');

const toLocalDate = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toLocalTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function PromotionModal({ isOpen, onClose, editingItem, onSuccess }) {
  const toast = useToast();

  const [form, setForm] = useState({
    brand_product_id: '', discount_type: 'PERCENT', discount_value: '',
    starts_date: '', starts_time: '00:00',
    ends_date: '', ends_time: '23:59',
    is_active: true,
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
        brand_product_id: String(editingItem.brand_product_id ?? ''),
        discount_type: editingItem.discount_type ?? 'PERCENT',
        discount_value: editingItem.discount_value ?? '',
        starts_date: toLocalDate(editingItem.starts_at),
        starts_time: toLocalTime(editingItem.starts_at) || '00:00',
        ends_date: toLocalDate(editingItem.ends_at),
        ends_time: toLocalTime(editingItem.ends_at) || '23:59',
        is_active: editingItem.is_active ?? true,
      });
    } else {
      setForm({
        brand_product_id: '', discount_type: 'PERCENT', discount_value: '',
        starts_date: '', starts_time: '00:00',
        ends_date: '', ends_time: '23:59',
        is_active: true,
      });
    }
  }, [isOpen, editingItem]);

  const validate = () => {
    const errs = {};
    if (!form.brand_product_id) errs.brand_product_id = 'Pilih menu terlebih dahulu';
    const discountNum = parseFloat(form.discount_value);
    if (!form.discount_value || isNaN(discountNum) || discountNum <= 0) {
      errs.discount_value = 'Nilai diskon harus lebih dari 0';
    } else if (form.discount_type === 'PERCENT' && discountNum > 100) {
      errs.discount_value = 'Diskon persen maksimal 100';
    }
    if (!form.starts_date) errs.starts_date = 'Tanggal mulai wajib diisi';
    if (!form.ends_date) errs.ends_date = 'Tanggal selesai wajib diisi';
    if (form.starts_date && form.ends_date) {
      const start = new Date(`${form.starts_date}T${form.starts_time || '00:00'}`);
      const end = new Date(`${form.ends_date}T${form.ends_time || '23:59'}`);
      if (end <= start) errs.ends_date = 'Tanggal selesai harus setelah tanggal mulai';
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
        brand_product_id: form.brand_product_id,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        starts_at: new Date(`${form.starts_date}T${form.starts_time || '00:00'}`).toISOString(),
        ends_at: new Date(`${form.ends_date}T${form.ends_time || '23:59'}`).toISOString(),
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
                name="brand_product_id"
                as="select"
                value={form.brand_product_id}
                onChange={(e) => setForm({ ...form, brand_product_id: e.target.value })}
                error={errors.brand_product_id}
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
                min="0"
                step="0.01"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                placeholder={form.discount_type === 'PERCENT' ? 'cth. 15 (untuk 15%)' : 'cth. 5000'}
                error={errors.discount_value}
                helperText={form.discount_type === 'PERCENT' ? 'Maksimal 100' : ''}
                required
              />

              {/* Tanggal mulai */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-feast-dark-secondary font-vietnam">
                  Tanggal Mulai <span className="text-feast-beetroot">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={form.starts_date}
                    onChange={(e) => setForm({ ...form, starts_date: e.target.value })}
                    className="bg-feast-bg rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all"
                  />
                  <input
                    type="time"
                    value={form.starts_time}
                    onChange={(e) => setForm({ ...form, starts_time: e.target.value })}
                    className="bg-feast-bg rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all"
                  />
                </div>
                {errors.starts_date && (
                  <p className="text-xs text-feast-beetroot font-vietnam">{errors.starts_date}</p>
                )}
              </div>

              {/* Tanggal selesai */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-feast-dark-secondary font-vietnam">
                  Tanggal Selesai <span className="text-feast-beetroot">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={form.ends_date}
                    onChange={(e) => setForm({ ...form, ends_date: e.target.value })}
                    className="bg-feast-bg rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all"
                  />
                  <input
                    type="time"
                    value={form.ends_time}
                    onChange={(e) => setForm({ ...form, ends_time: e.target.value })}
                    className="bg-feast-bg rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all"
                  />
                </div>
                {errors.ends_date && (
                  <p className="text-xs text-feast-beetroot font-vietnam">{errors.ends_date}</p>
                )}
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
