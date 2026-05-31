import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import FormField from '../../../components/FormField';
import { categoriesApi } from '../../../api/catalog';
import { handleApiError } from '../../../api/errorHandler';
import { useToast } from '../../../hooks/useToast';

export default function CategoryModal({ isOpen, onClose, editingItem, onSuccess }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', display_order: 0 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      editingItem
        ? { name: editingItem.name, display_order: editingItem.display_order ?? 0 }
        : { name: '', display_order: 0 }
    );
  }, [isOpen, editingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingItem) {
        await categoriesApi.update(editingItem.id, form);
        toast.success('Kategori diperbarui');
      } else {
        await categoriesApi.create(form);
        toast.success('Kategori ditambahkan');
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
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-jakarta text-xl font-bold text-feast-dark">
                {editingItem ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              <button onClick={onClose} className="p-1.5 text-feast-dark-muted hover:text-feast-dark rounded-lg hover:bg-feast-bg transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Nama Kategori"
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="cth. Minuman, Makanan Utama"
                required
              />
              <FormField
                label="Urutan Tampil"
                name="display_order"
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                helperText="Angka lebih kecil tampil lebih dulu"
              />
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
