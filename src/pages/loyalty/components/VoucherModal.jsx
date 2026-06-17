import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ImagePlus, Check } from 'lucide-react';
import FormField from '../../../components/FormField';
import { voucherTemplatesApi } from '../../../api/loyalty';
import { categoriesApi, brandProductsApi } from '../../../api/catalog';
import { handleApiError } from '../../../api/errorHandler';
import { useToast } from '../../../hooks/useToast';

const DISCOUNT_TYPE_LABELS = {
  PERCENT: 'Persen (%)',
  FIXED: 'Potongan Harga (Rp)',
  FREE_ITEM: 'Item Gratis',
};

const SCOPE_LABELS = {
  ALL: 'Semua Produk',
  CATEGORY: 'Kategori Tertentu',
  PRODUCT: 'Produk Tertentu',
};

function MultiCheckList({ items, selected, onToggle, labelKey = 'name' }) {
  return (
    <div className="max-h-44 overflow-y-auto border border-feast-bg rounded-xl divide-y divide-feast-bg">
      {items.length === 0 ? (
        <p className="text-xs text-feast-dark-muted font-vietnam px-4 py-3">Tidak ada data</p>
      ) : (
        items.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-feast-bg/60 transition-colors text-left"
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                isSelected ? 'bg-feast-sunset' : 'border border-gray-300'
              }`}>
                {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
              </div>
              <span className="text-sm font-vietnam text-feast-dark">{item[labelKey]}</span>
            </button>
          );
        })
      )}
    </div>
  );
}

export default function VoucherModal({ isOpen, onClose, editingItem, onSuccess }) {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    points_cost: '',
    discount_type: 'FREE_ITEM',
    discount_value: '',
    applicable_scope: 'ALL',
    valid_days: 30,
    is_active: true,
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    categoriesApi.list().then((res) => {
      const list = res.data?.data ?? res.data ?? [];
      setCategories(Array.isArray(list) ? list : list.results ?? []);
    }).catch(() => {});

    brandProductsApi.list({ is_active: true }).then((res) => {
      const list = res.data?.data ?? res.data ?? [];
      setProducts(Array.isArray(list) ? list : list.results ?? []);
    }).catch(() => {});

    if (editingItem) {
      setForm({
        title: editingItem.title ?? '',
        description: editingItem.description ?? '',
        points_cost: editingItem.points_cost ?? '',
        discount_type: editingItem.discount_type ?? 'FREE_ITEM',
        discount_value: editingItem.discount_value ?? '',
        applicable_scope: editingItem.applicable_scope ?? 'ALL',
        valid_days: editingItem.valid_days ?? 30,
        is_active: editingItem.is_active ?? true,
      });
      setSelectedCategories((editingItem.applicable_categories ?? []).map((c) => c.id));
      setSelectedProducts((editingItem.applicable_products ?? []).map((p) => p.id));
      setImagePreview(editingItem.image_url ?? null);
    } else {
      setForm({ title: '', description: '', points_cost: '', discount_type: 'FREE_ITEM', discount_value: '', applicable_scope: 'ALL', valid_days: 30, is_active: true });
      setSelectedCategories([]);
      setSelectedProducts([]);
      setImagePreview(null);
    }
    setImageFile(null);
  }, [isOpen, editingItem]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Ukuran gambar maksimal 2MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleCategory = (id) =>
    setSelectedCategories((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleProduct = (id) =>
    setSelectedProducts((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Judul voucher wajib diisi'); return; }
    if (!form.points_cost || parseInt(form.points_cost) <= 0) { toast.error('Jumlah poin harus lebih dari 0'); return; }

    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description || '');
      fd.append('points_cost', form.points_cost);
      fd.append('discount_type', form.discount_type);
      if (form.discount_value) fd.append('discount_value', form.discount_value);
      fd.append('applicable_scope', form.applicable_scope);
      fd.append('valid_days', form.valid_days);
      fd.append('is_active', form.is_active);
      if (imageFile) fd.append('image', imageFile);

      if (form.applicable_scope === 'CATEGORY') {
        selectedCategories.forEach((id) => fd.append('applicable_categories', id));
      }
      if (form.applicable_scope === 'PRODUCT') {
        selectedProducts.forEach((id) => fd.append('applicable_products', id));
      }

      if (editingItem) {
        await voucherTemplatesApi.update(editingItem.id, fd);
        toast.success('Voucher diperbarui');
      } else {
        await voucherTemplatesApi.create(fd);
        toast.success('Voucher dibuat');
      }
      onSuccess();
      onClose();
    } catch (err) {
      handleApiError(err, { showError: toast.error });
    } finally {
      setIsSaving(false);
    }
  };

  const showDiscountValue = form.discount_type === 'PERCENT' || form.discount_type === 'FIXED';

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
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-jakarta text-xl font-bold text-feast-dark">
                {editingItem ? 'Edit Voucher' : 'Buat Voucher Baru'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-feast-dark-muted hover:text-feast-dark rounded-lg hover:bg-feast-bg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-feast-dark-secondary font-vietnam">
                  Gambar Voucher
                </label>
                <div
                  className="relative w-full h-36 bg-feast-bg rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-feast-bg hover:border-feast-sunset/40 transition-colors flex items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-feast-dark-muted">
                      <ImagePlus size={24} />
                      <span className="text-xs font-vietnam">Klik untuk upload</span>
                      <span className="text-xs font-vietnam text-feast-dark-muted/60">Maks. 2MB</span>
                    </div>
                  )}
                  {imagePreview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-vietnam font-semibold">Ganti gambar</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </div>

              <FormField
                label="Judul Voucher"
                name="title"
                value={form.title}
                onChange={set('title')}
                placeholder="cth. Gratis 1 Cup Minuman"
                required
              />

              <FormField
                label="Deskripsi"
                name="description"
                as="textarea"
                value={form.description}
                onChange={set('description')}
                placeholder="Jelaskan detail voucher ini kepada customer..."
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Biaya Poin"
                  name="points_cost"
                  type="number"
                  min="1"
                  value={form.points_cost}
                  onChange={set('points_cost')}
                  placeholder="cth. 50"
                  helperText="Jumlah poin untuk redeem"
                  required
                />
                <FormField
                  label="Masa Berlaku (hari)"
                  name="valid_days"
                  type="number"
                  min="1"
                  value={form.valid_days}
                  onChange={set('valid_days')}
                  helperText="Sejak tanggal redeem"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Jenis Reward"
                  name="discount_type"
                  as="select"
                  value={form.discount_type}
                  onChange={set('discount_type')}
                >
                  {Object.entries(DISCOUNT_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </FormField>

                {showDiscountValue && (
                  <FormField
                    label={form.discount_type === 'PERCENT' ? 'Nilai (%)' : 'Nilai (Rp)'}
                    name="discount_value"
                    type="number"
                    min="0"
                    value={form.discount_value}
                    onChange={set('discount_value')}
                    placeholder={form.discount_type === 'PERCENT' ? 'cth. 20' : 'cth. 15000'}
                  />
                )}
              </div>

              <FormField
                label="Berlaku Untuk"
                name="applicable_scope"
                as="select"
                value={form.applicable_scope}
                onChange={set('applicable_scope')}
              >
                {Object.entries(SCOPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </FormField>

              {form.applicable_scope === 'CATEGORY' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-feast-dark-secondary font-vietnam">
                    Pilih Kategori
                    <span className="text-feast-beetroot ml-0.5">*</span>
                  </label>
                  <MultiCheckList
                    items={categories}
                    selected={selectedCategories}
                    onToggle={toggleCategory}
                  />
                  {selectedCategories.length > 0 && (
                    <p className="text-xs text-feast-dark-muted font-vietnam">{selectedCategories.length} kategori dipilih</p>
                  )}
                </div>
              )}

              {form.applicable_scope === 'PRODUCT' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-feast-dark-secondary font-vietnam">
                    Pilih Produk
                    <span className="text-feast-beetroot ml-0.5">*</span>
                  </label>
                  <MultiCheckList
                    items={products}
                    selected={selectedProducts}
                    onToggle={toggleProduct}
                  />
                  {selectedProducts.length > 0 && (
                    <p className="text-xs text-feast-dark-muted font-vietnam">{selectedProducts.length} produk dipilih</p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-semibold text-feast-dark-secondary font-vietnam">Status Aktif</span>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
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
