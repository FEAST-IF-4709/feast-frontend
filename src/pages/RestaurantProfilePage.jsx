import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { brandsApi } from '../api/brands';
import { handleApiError } from '../api/errorHandler';
import { useToast } from '../hooks/useToast';
import { usePermission } from '../hooks/usePermission';
import brandHeroImg from '../assets/Dynamic food plating.jpg';
import locationImg from '../assets/Epicurean District Location.jpg';

const DAYS = [
  { key: 'mon', label: 'Senin' },
  { key: 'tue', label: 'Selasa' },
  { key: 'wed', label: 'Rabu' },
  { key: 'thu', label: 'Kamis' },
  { key: 'fri', label: 'Jumat' },
  { key: 'sat', label: 'Sabtu' },
  { key: 'sun', label: 'Minggu' },
];

const RestaurantProfilePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const [brandData, setBrandData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const toast = useToast();
  const canUpdate = usePermission('brand.update');

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await brandsApi.getMe();
        const data = res.data?.data ?? res.data;
        setBrandData(data);
        setOriginalData(data);
      } catch (err) {
        handleApiError(err, { showError: toast.error });
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrand();
  }, []);

  const updateField = (field, value) => {
    setBrandData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await brandsApi.updateMe(brandData);
      const updated = res.data?.data ?? res.data;
      setBrandData(updated);
      setOriginalData(updated);
      setHasChanges(false);
      toast.success('Profil restoran berhasil diperbarui');
    } catch (err) {
      handleApiError(err, { showError: toast.error });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setBrandData(originalData);
    setHasChanges(false);
    toast.info('Perubahan dibatalkan');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-feast-bg">
        <Loader2 className="animate-spin w-8 h-8 text-feast-sunset" />
      </div>
    );
  }

  return (
    <>
      <header className="flex justify-between items-center px-8 py-5 bg-feast-bg sticky top-0 z-40">
        <div>
          <h2 className="text-2xl font-bold font-jakarta text-feast-dark">Restaurant Settings</h2>
          <p className="text-sm text-feast-dark-muted mt-1">
            Manage your restaurant details, operating hours, and location preferences.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDiscard}
            disabled={!hasChanges}
            className="px-5 py-2.5 bg-feast-surface-low text-feast-dark font-semibold text-sm rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Discard
          </button>
          {canUpdate && (
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-feast-sunset text-white font-semibold text-sm rounded-xl hover:bg-feast-sunset-dark transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving && <Loader2 className="animate-spin w-4 h-4" />}
              Save Changes
            </button>
          )}
        </div>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-feast-sunset/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-lg font-bold font-jakarta text-feast-dark mb-6 relative z-10">
              General Information
            </h3>
            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={brandData?.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  disabled={!canUpdate}
                  className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                  Short Description
                </label>
                <textarea
                  value={brandData?.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  disabled={!canUpdate}
                  rows={3}
                  className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                    Cuisine Type
                  </label>
                  <input
                    type="text"
                    value={brandData?.cuisine_type || ''}
                    onChange={(e) => updateField('cuisine_type', e.target.value)}
                    disabled={!canUpdate}
                    placeholder="e.g. Modern Fusion"
                    className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={brandData?.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    disabled={!canUpdate}
                    className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Brand Imagery */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold font-jakarta text-feast-dark mb-6">Brand Imagery</h3>
            <div className="h-48 bg-feast-surface-low rounded-2xl overflow-hidden w-full relative group cursor-pointer mb-4">
              <img
                src={brandData?.logo_url || brandHeroImg}
                alt="Brand"
                onError={(e) => { e.target.src = brandHeroImg; }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={brandData?.logo_url || ''}
                onChange={(e) => updateField('logo_url', e.target.value)}
                disabled={!canUpdate}
                placeholder="https://..."
                className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </motion.section>

          {/* Operating Hours */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold font-jakarta text-feast-dark mb-6">Jam Operasional</h3>
            <div className="divide-y divide-feast-bg">
              {DAYS.map(day => (
                <div key={day.key} className="flex items-center gap-3 py-3">
                  <span className="w-20 font-vietnam text-sm text-feast-dark">{day.label}</span>
                  <input
                    type="time"
                    value={brandData?.operating_hours?.[day.key]?.open || '08:00'}
                    onChange={(e) => updateField('operating_hours', {
                      ...brandData?.operating_hours,
                      [day.key]: {
                        ...brandData?.operating_hours?.[day.key],
                        open: e.target.value,
                      },
                    })}
                    disabled={!canUpdate}
                    className="bg-feast-surface-low rounded-xl px-3 py-2 font-vietnam text-sm text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <span className="font-vietnam text-feast-dark-secondary">—</span>
                  <input
                    type="time"
                    value={brandData?.operating_hours?.[day.key]?.close || '22:00'}
                    onChange={(e) => updateField('operating_hours', {
                      ...brandData?.operating_hours,
                      [day.key]: {
                        ...brandData?.operating_hours?.[day.key],
                        close: e.target.value,
                      },
                    })}
                    disabled={!canUpdate}
                    className="bg-feast-surface-low rounded-xl px-3 py-2 font-vietnam text-sm text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Operations */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold font-jakarta text-feast-dark mb-5">Operations</h3>
            <div className="space-y-4">
              <div className="bg-white border border-feast-bg rounded-2xl p-4 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-feast-dark">Accepting Orders</p>
                  <p className="text-[10px] text-feast-dark-muted mt-0.5">Currently taking new requests</p>
                </div>
                <div className="w-10 h-6 bg-feast-sunset rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
                </div>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-medium text-feast-dark-secondary">Auto-accept Orders</span>
                <div className="w-10 h-6 bg-feast-surface-low rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm" />
                </div>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-medium text-feast-dark-secondary">Busy Mode</span>
                <div className="w-10 h-6 bg-feast-surface-low rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm" />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Location */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold font-jakarta text-feast-dark mb-3">Location</h3>
            <textarea
              value={brandData?.location_address || ''}
              onChange={(e) => updateField('location_address', e.target.value)}
              disabled={!canUpdate}
              rows={3}
              placeholder="Alamat lengkap..."
              className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-xs text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 resize-none mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <div className="h-32 bg-feast-surface-low rounded-xl w-full relative overflow-hidden group">
              <img src={locationImg} alt="Map" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
              <button className="absolute bottom-2 right-2 bg-white text-feast-sunset text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                Edit Pin
              </button>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </>
  );
};

export default RestaurantProfilePage;
