import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ImagePlus } from 'lucide-react';
import FormField from '../../../components/FormField';
import { brandProductsApi } from '../../../api/catalog';
import { handleApiError } from '../../../api/errorHandler';
import { useToast } from '../../../hooks/useToast';

export default function BrandProductModal({ isOpen, onClose, editingItem, categories, onSuccess }) {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ name: '', category: '', description: '', base_price: '', is_active: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      setForm({
        name: editingItem.name ?? '',
        category: editingItem.category ?? '',
        description: editingItem.description ?? '',
        base_price: editingItem.base_price ?? '',
        is_active: editingItem.is_active ?? true,
      });
      setImagePreview(editingItem.image ?? null);
    } else {
      setForm({ name: '', category: '', description: '', base_price: '', is_active: true });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [isOpen, editingItem]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nama produk wajib diisi'); return; }
    if (!form.category) { toast.error('Kategori wajib dipilih'); return; }
    if (!form.base_price || parseFloat(form.base_price) <= 0) { toast.error('Harga dasar harus lebih dari 0'); return; }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('category', form.category);
      formData.append('description', form.description || '');
      formData.append('base_price', form.base_price);
      formData.append('is_active', form.is_active);
      if (imageFile) formData.append('image', imageFile);

      if (editingItem) {
        await brandProductsApi.updateWithImage(editingItem.id, formData);
        toast.success('Menu diperbarui');
      } else {
        await brandProductsApi.createWithImage(formData);
        toast.success('Menu ditambahkan');
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
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-jakarta text-xl font-bold text-feast-dark">
                {editingItem ? 'Edit Menu' : 'Tambah Menu'}
              </h2>
              <button onClick={onClose} className="p-1.5 text-feast-dark-muted hover:text-feast-dark rounded-lg hover:bg-feast-bg transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-feast-dark-secondary font-vietnam">
                  Foto Menu
                </label>
                <div
                  className="relative w-full h-40 bg-feast-bg rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-feast-bg hover:border-feast-sunset/40 transition-colors flex items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-feast-dark-muted">
                      <ImagePlus size={28} />
                      <span className="text-xs font-vietnam">Klik untuk upload foto</span>
                      <span className="text-xs font-vietnam text-feast-dark-muted/60">Maks. 2MB</span>
                    </div>
                  )}
                  {imagePreview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-vietnam font-semibold">Ganti foto</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </div>

              <FormField
                label="Nama Menu"
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="cth. Nasi Goreng Spesial"
                required
              />

              <FormField
                label="Kategori"
                name="category"
                as="select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </FormField>

              <FormField
                label="Deskripsi"
                name="description"
                as="textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi singkat menu (opsional)"
              />

              <FormField
                label="Harga Dasar (Rp)"
                name="base_price"
                type="number"
                value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                placeholder="cth. 25000"
                helperText="Harga ini berlaku jika outlet tidak set harga khusus"
                required
              />

              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-semibold text-feast-dark-secondary font-vietnam">Status Aktif</span>
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
