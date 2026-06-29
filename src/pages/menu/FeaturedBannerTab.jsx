import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Pencil, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { usePermission } from '../../hooks/usePermission';
import { useToast } from '../../hooks/useToast';
import { featuredBannerApi } from '../../api/catalog';
import { handleApiError } from '../../api/errorHandler';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import FeaturedBannerModal from './components/FeaturedBannerModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function FeaturedBannerTab() {
  const toast = useToast();
  const canManage = usePermission('products.update');

  const { data: bannerData, isLoading, refetch } = useApi(() => featuredBannerApi.get(), []);
  // useApi already extracts res.data?.data ?? res.data. When no banner exists the
  // backend returns { success, data: null } so useApi falls back to the envelope.
  // Guard: a real banner always has an `id` field.
  const banner = bannerData?.id != null ? bannerData : null;

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasBanner = !!banner;

  const handleToggleActive = async () => {
    if (!banner) return;
    try {
      await featuredBannerApi.update({ is_active: !banner.is_active });
      toast.success(banner.is_active ? 'Banner dinonaktifkan' : 'Banner diaktifkan');
      refetch();
    } catch (err) {
      handleApiError(err, { showError: toast.error });
    }
  };

  const handleDelete = async () => {
    try {
      await featuredBannerApi.delete();
      toast.success('Banner dihapus');
      refetch();
    } catch (err) {
      handleApiError(err, { showError: toast.error });
    } finally {
      setConfirmDelete(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-feast-dark-muted font-vietnam">
            Tampilkan satu banner promosi di halaman utama aplikasi mobile untuk menarik perhatian pelanggan.
          </p>
        </div>
        {canManage && !hasBanner && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-full hover:bg-feast-sunset-dark transition-all hover:shadow-lg hover:shadow-feast-sunset/20"
          >
            <Plus size={16} />
            Buat Banner
          </button>
        )}
      </div>

      {!hasBanner ? (
        <EmptyState
          icon={Image}
          title="Belum ada Special Offer Banner"
          description="Buat banner untuk ditampilkan di halaman utama pelanggan"
        />
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-xl">
          <motion.div variants={itemVariants} className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {/* Banner preview */}
            <div className="relative h-44 bg-gradient-to-br from-feast-amber/20 to-feast-sunset/30 overflow-hidden">
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image size={48} className="text-feast-dark-muted/30" />
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <p className="text-white font-bold font-jakarta text-xl leading-tight">{banner.title}</p>
                {banner.subtitle && (
                  <p className="text-white/80 text-sm font-vietnam mt-0.5">{banner.subtitle}</p>
                )}
              </div>
              {/* Active badge */}
              <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold font-vietnam ${banner.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                {banner.is_active ? 'Aktif' : 'Nonaktif'}
              </div>
            </div>

            {/* Info & Actions */}
            <div className="px-5 py-4">
              {banner.outlet_name && (
                <p className="text-xs text-feast-dark-muted font-vietnam mb-3">
                  Target outlet: <span className="font-semibold text-feast-dark">{banner.outlet_name}</span>
                </p>
              )}

              {canManage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleActive}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold font-vietnam rounded-xl border border-feast-bg hover:bg-feast-bg transition-colors text-feast-dark"
                  >
                    {banner.is_active
                      ? <><ToggleRight size={16} className="text-green-500" /> Nonaktifkan</>
                      : <><ToggleLeft size={16} className="text-gray-400" /> Aktifkan</>}
                  </button>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold font-vietnam rounded-xl border border-feast-bg hover:bg-feast-bg transition-colors text-feast-dark"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold font-vietnam rounded-xl border border-red-100 hover:bg-red-50 transition-colors text-red-500"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      <FeaturedBannerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingItem={hasBanner ? banner : null}
        onSuccess={refetch}
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Hapus Banner"
        message="Banner yang dihapus tidak bisa dikembalikan dan tidak akan lagi tampil di aplikasi mobile."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
