import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import FormField from '../../../components/FormField';
import { outletProductsApi } from '../../../api/catalog';
import { handleApiError } from '../../../api/errorHandler';
import { useToast } from '../../../hooks/useToast';
import { formatIDR } from '../../../utils/format';

export default function OutletProductModal({ isOpen, onClose, brandProduct, outletProduct, outletId, onSuccess }) {
  const toast = useToast();
  const isEditing = !!outletProduct;

  const [form, setForm] = useState({ outlet_price: '', stock_available: true, stock_quantity: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      outletProduct
        ? {
            outlet_price: outletProduct.outlet_price ?? '',
            stock_available: outletProduct.stock_available ?? true,
            stock_quantity: outletProduct.stock_quantity ?? '',
          }
        : { outlet_price: '', stock_available: true, stock_quantity: '' }
    );
  }, [isOpen, outletProduct]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        outlet_price: form.outlet_price === '' ? null : parseFloat(form.outlet_price),
        stock_available: form.stock_available,
        stock_quantity: form.stock_quantity === '' ? null : parseInt(form.stock_quantity),
      };

      if (isEditing) {
        await outletProductsApi.update(outletProduct.id, payload);
        toast.success('Harga & stok diperbarui');
      } else {
        await outletProductsApi.create({
          brand_product: brandProduct.id,
          outlet: outletId,
          ...payload,
        });
        toast.success('Menu ditambahkan ke outlet');
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
                {isEditing ? 'Edit Harga & Stok' : 'Tambahkan ke Outlet'}
              </h2>
              <button onClick={onClose} className="p-1.5 text-feast-dark-muted hover:text-feast-dark rounded-lg hover:bg-feast-bg transition-colors">
                <X size={18} />
              </button>
            </div>

            {brandProduct && (
              <div className="flex items-center gap-3 p-3 bg-feast-bg rounded-xl mb-5">
                {brandProduct.image ? (
                  <img src={brandProduct.image} alt={brandProduct.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-feast-bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-feast-dark-muted text-xs font-bold">{brandProduct.name?.[0]}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-feast-dark font-jakarta">{brandProduct.name}</p>
                  <p className="text-xs text-feast-dark-muted font-vietnam">Harga brand: {formatIDR(brandProduct.base_price)}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Harga Outlet (Rp)"
                name="outlet_price"
                type="number"
                value={form.outlet_price}
                onChange={(e) => setForm({ ...form, outlet_price: e.target.value })}
                placeholder="Kosongkan untuk pakai harga brand"
                helperText="Biarkan kosong agar mengikuti harga dari Brand"
              />

              <div className="flex items-center justify-between py-1">
                <div>
                  <span className="text-xs font-semibold text-feast-dark-secondary font-vietnam">Stok Tersedia</span>
                  <p className="text-xs text-feast-dark-muted font-vietnam">Menu bisa dipesan</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, stock_available: !form.stock_available })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.stock_available ? 'bg-feast-sunset' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.stock_available ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <FormField
                label="Jumlah Stok"
                name="stock_quantity"
                type="number"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                placeholder="Kosongkan untuk unlimited"
                helperText="Biarkan kosong untuk stok tidak terbatas"
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
