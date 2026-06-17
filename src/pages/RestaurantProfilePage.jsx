import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Upload, Pencil, Check, MapPin, ExternalLink, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import { brandsApi } from '../api/brands';
import { handleApiError } from '../api/errorHandler';
import { useToast } from '../hooks/useToast';
import brandHeroImg from '../assets/Dynamic food plating.jpg';

const DAYS = [
  { key: 'mon', label: 'Senin' },
  { key: 'tue', label: 'Selasa' },
  { key: 'wed', label: 'Rabu' },
  { key: 'thu', label: 'Kamis' },
  { key: 'fri', label: 'Jumat' },
  { key: 'sat', label: 'Sabtu' },
  { key: 'sun', label: 'Minggu' },
];

const DEFAULT_HOURS = { open: '08:00', close: '22:00' };

function normalizeOperatingHours(hours) {
  return DAYS.reduce((acc, { key }) => ({
    ...acc,
    [key]: { ...DEFAULT_HOURS, ...(hours?.[key] ?? {}) },
  }), {});
}

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
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [isEditingPin, setIsEditingPin] = useState(false);
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await brandsApi.getMe();
        const data = res.data?.data ?? res.data;
        const normalized = { ...data, operating_hours: normalizeOperatingHours(data.operating_hours) };
        setBrandData(normalized);
        setOriginalData(normalized);
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

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setHasChanges(true);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let res;
      if (logoFile || bannerFile) {
        const formData = new FormData();
        formData.append('name', brandData.name ?? '');
        formData.append('description', brandData.description ?? '');
        formData.append('cuisine_type', brandData.cuisine_type ?? '');
        formData.append('phone', brandData.phone ?? '');
        formData.append('location_address', brandData.location_address ?? '');
        formData.append('operating_hours', JSON.stringify(brandData.operating_hours ?? {}));
        formData.append('is_accepting_orders', brandData.is_accepting_orders ? 'true' : 'false');
        formData.append('tax_rate', brandData.tax_rate ?? 0);
        if (brandData.latitude != null && brandData.latitude !== '') formData.append('latitude', brandData.latitude);
        if (brandData.longitude != null && brandData.longitude !== '') formData.append('longitude', brandData.longitude);
        if (logoFile) formData.append('logo', logoFile);
        if (bannerFile) formData.append('banner', bannerFile);
        res = await brandsApi.updateMeWithImage(formData);
      } else {
        const payload = {
          description: brandData.description,
          cuisine_type: brandData.cuisine_type,
          phone: brandData.phone,
          logo_url: brandData.logo_url,
          banner_url: brandData.banner_url,
          location_address: brandData.location_address,
          operating_hours: brandData.operating_hours,
          is_accepting_orders: brandData.is_accepting_orders,
          tax_rate: brandData.tax_rate ?? 0,
          latitude: brandData.latitude || null,
          longitude: brandData.longitude || null,
        };
        res = await brandsApi.updateMe(payload);
      }
      const updated = res.data?.data ?? res.data;
      const normalized = { ...updated, operating_hours: normalizeOperatingHours(updated.operating_hours) };
      setBrandData(normalized);
      setOriginalData(normalized);
      setHasChanges(false);
      setLogoFile(null);
      setLogoPreview(null);
      setBannerFile(null);
      setBannerPreview(null);
      toast.success('Profil restoran berhasil diperbarui');
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors?.length) {
        fieldErrors.forEach(({ field, detail }) => toast.error(`${field}: ${detail}`));
      } else {
        handleApiError(err, { showError: toast.error });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setBrandData(originalData);
    setHasChanges(false);
    setLogoFile(null);
    setLogoPreview(null);
    setBannerFile(null);
    setBannerPreview(null);
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
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-feast-sunset text-white font-semibold text-sm rounded-xl hover:bg-feast-sunset-dark transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving && <Loader2 className="animate-spin w-4 h-4" />}
            Save Changes
          </button>
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
                  disabled
                  className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam opacity-60 cursor-not-allowed"
                />
                <p className="text-[10px] text-feast-dark-muted mt-1">
                  Nama restoran tidak dapat diubah. Hubungi support jika perlu perubahan.
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                  Short Description
                </label>
                <textarea
                  value={brandData?.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 resize-none"
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
                    placeholder="e.g. Modern Fusion"
                    className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
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
                    className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Brand Imagery */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold font-jakarta text-feast-dark mb-6">Brand Imagery</h3>

            {/* Banner */}
            <div className="mb-6">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                Banner
              </label>
              <div
                className="h-40 bg-feast-surface-low rounded-2xl overflow-hidden w-full relative group cursor-pointer"
                onClick={() => bannerInputRef.current?.click()}
              >
                {bannerPreview || brandData?.banner_url ? (
                  <img
                    src={bannerPreview || brandData?.banner_url}
                    alt="Banner"
                    onError={(e) => { e.target.src = brandHeroImg; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-feast-dark-muted">
                    <Upload size={20} className="opacity-40" />
                    <span className="text-[11px] font-vietnam opacity-60">Upload banner (16:9 disarankan)</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-white/90 rounded-xl px-4 py-2">
                    <Upload size={14} className="text-feast-dark" />
                    <span className="text-xs font-semibold font-vietnam text-feast-dark">Upload Banner</span>
                  </div>
                </div>
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
              />
              {bannerFile && (
                <div className="flex items-center gap-2 px-3 py-2 bg-feast-sunset/5 rounded-xl mt-2">
                  <span className="text-xs font-vietnam text-feast-sunset flex-1 truncate">{bannerFile.name}</span>
                  <button
                    type="button"
                    onClick={() => { setBannerFile(null); setBannerPreview(null); }}
                    className="text-xs text-feast-dark-muted hover:text-red-500 font-vietnam"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            {/* Logo */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                Logo
              </label>
              <div className="flex items-start gap-4">
                <div
                  className="w-24 h-24 bg-feast-surface-low rounded-2xl overflow-hidden relative group cursor-pointer shrink-0"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoPreview || brandData?.logo_url ? (
                    <img
                      src={logoPreview || brandData?.logo_url}
                      alt="Logo"
                      onError={(e) => { e.target.src = brandHeroImg; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-feast-dark-muted">
                      <Upload size={18} className="opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {logoFile ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-feast-sunset/5 rounded-xl">
                      <span className="text-xs font-vietnam text-feast-sunset flex-1 truncate">{logoFile.name}</span>
                      <button
                        type="button"
                        onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                        className="text-xs text-feast-dark-muted hover:text-red-500 font-vietnam"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-feast-surface-low rounded-xl text-xs font-semibold font-vietnam text-feast-dark hover:bg-gray-200 transition-colors"
                    >
                      <Upload size={13} />
                      Upload Logo
                    </button>
                  )}
                  <p className="text-[10px] text-feast-dark-muted">Format JPG/PNG. Disarankan 1:1 (square).</p>
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </motion.section>

          {/* Operating Hours */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-jakarta text-feast-dark">Jam Operasional</h3>
              <button
                type="button"
                onClick={() => setIsEditingHours(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-vietnam transition-colors ${
                  isEditingHours
                    ? 'bg-feast-sunset text-white'
                    : 'bg-feast-surface-low text-feast-dark hover:bg-gray-200'
                }`}
              >
                {isEditingHours
                  ? <><Check size={13} /> Selesai</>
                  : <><Pencil size={13} /> Edit Jam</>
                }
              </button>
            </div>
            <div className="divide-y divide-feast-bg">
              {DAYS.map(day => {
                const open = brandData?.operating_hours?.[day.key]?.open ?? '';
                const close = brandData?.operating_hours?.[day.key]?.close ?? '';
                return (
                  <div key={day.key} className="flex items-center gap-3 py-3">
                    <span className="w-20 font-vietnam text-sm text-feast-dark shrink-0">{day.label}</span>
                    {isEditingHours ? (
                      <>
                        <input
                          type="time"
                          value={open}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBrandData(prev => ({
                              ...prev,
                              operating_hours: {
                                ...prev.operating_hours,
                                [day.key]: { ...prev.operating_hours?.[day.key], open: val },
                              },
                            }));
                            setHasChanges(true);
                          }}
                          className="bg-feast-surface-low border border-feast-sunset/30 rounded-xl px-3 py-2 font-vietnam text-sm text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/40 focus:border-feast-sunset transition-colors"
                        />
                        <span className="font-vietnam text-feast-dark-secondary">—</span>
                        <input
                          type="time"
                          value={close}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBrandData(prev => ({
                              ...prev,
                              operating_hours: {
                                ...prev.operating_hours,
                                [day.key]: { ...prev.operating_hours?.[day.key], close: val },
                              },
                            }));
                            setHasChanges(true);
                          }}
                          className="bg-feast-surface-low border border-feast-sunset/30 rounded-xl px-3 py-2 font-vietnam text-sm text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/40 focus:border-feast-sunset transition-colors"
                        />
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingHours(true)}
                        className="flex items-center gap-2 group"
                        title="Klik untuk edit jam operasional"
                      >
                        <span className="font-vietnam text-sm text-feast-dark group-hover:text-feast-sunset transition-colors">
                          {open || '—'}
                        </span>
                        <span className="text-feast-dark-secondary">—</span>
                        <span className="font-vietnam text-sm text-feast-dark group-hover:text-feast-sunset transition-colors">
                          {close || '—'}
                        </span>
                        <Pencil size={11} className="text-feast-dark-muted opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {!isEditingHours && (
              <p className="text-[10px] text-feast-dark-muted mt-4">
                Klik jam untuk mengedit, atau tekan tombol <strong>Edit Jam</strong> di atas.
              </p>
            )}
          </motion.section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Operations */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold font-jakarta text-feast-dark mb-5">Operations</h3>
            <div
              className={`rounded-2xl p-5 flex items-center justify-between border transition-colors duration-300 ${
                brandData?.is_accepting_orders
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div>
                <p className={`text-sm font-bold font-jakarta transition-colors ${brandData?.is_accepting_orders ? 'text-green-700' : 'text-red-600'}`}>
                  {brandData?.is_accepting_orders ? 'Buka' : 'Tutup'}
                </p>
                <p className="text-[10px] text-feast-dark-muted mt-0.5">
                  {brandData?.is_accepting_orders
                    ? 'Restoran sedang menerima pesanan'
                    : 'Tidak ada pembayaran baru yang masuk'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateField('is_accepting_orders', !brandData?.is_accepting_orders)}
                className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${brandData?.is_accepting_orders ? 'bg-green-500' : 'bg-red-400'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-300 ${brandData?.is_accepting_orders ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </motion.section>

          {/* Tax & Fees */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Percent size={15} className="text-feast-sunset" />
              <h3 className="text-base font-bold font-jakarta text-feast-dark">Pajak & Biaya</h3>
            </div>
            <p className="text-[10px] text-feast-dark-muted mb-4">
              Diterapkan ke semua pesanan baru. Set ke 0 untuk menonaktifkan.
            </p>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                Tax Rate (PPN)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={brandData?.tax_rate ?? 0}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                      updateField('tax_rate', val);
                    }}
                    className="w-full bg-feast-surface-low rounded-xl px-4 py-3 pr-10 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-feast-dark-muted">
                    %
                  </span>
                </div>
              </div>
              {(brandData?.tax_rate > 0) && (
                <p className="text-[10px] text-feast-sunset mt-2 font-vietnam">
                  Contoh: pesanan Rp100.000 → pajak Rp{(100000 * (brandData.tax_rate / 100)).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </motion.section>

          {/* Location */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold font-jakarta text-feast-dark">Location</h3>
              <button
                type="button"
                onClick={() => setIsEditingPin(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold font-vietnam transition-colors ${
                  isEditingPin ? 'bg-feast-sunset text-white' : 'bg-feast-surface-low text-feast-dark hover:bg-gray-200'
                }`}
              >
                {isEditingPin ? <><Check size={11} /> Selesai</> : <><Pencil size={11} /> Edit Pin</>}
              </button>
            </div>
            <textarea
              value={brandData?.location_address || ''}
              onChange={(e) => updateField('location_address', e.target.value)}
              rows={3}
              placeholder="Alamat lengkap..."
              className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-xs text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 resize-none mb-3"
            />
            {isEditingPin ? (
              <div className="space-y-2 mb-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-feast-dark-muted mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={brandData?.latitude ?? ''}
                    onChange={(e) => updateField('latitude', e.target.value)}
                    placeholder="-6.200000"
                    className="w-full bg-feast-surface-low border border-feast-sunset/30 rounded-xl px-3 py-2 text-xs text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-feast-dark-muted mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={brandData?.longitude ?? ''}
                    onChange={(e) => updateField('longitude', e.target.value)}
                    placeholder="106.816666"
                    className="w-full bg-feast-surface-low border border-feast-sunset/30 rounded-xl px-3 py-2 text-xs text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/40"
                  />
                </div>
              </div>
            ) : null}
            <div className="h-32 bg-feast-surface-low rounded-xl w-full relative overflow-hidden">
              {brandData?.latitude && brandData?.longitude ? (
                <a
                  href={`https://www.google.com/maps?q=${brandData.latitude},${brandData.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-feast-surface transition-colors group"
                >
                  <MapPin size={20} className="text-feast-sunset" />
                  <span className="text-xs font-vietnam text-feast-dark font-medium">
                    {parseFloat(brandData.latitude).toFixed(6)}, {parseFloat(brandData.longitude).toFixed(6)}
                  </span>
                  <span className="text-[10px] font-vietnam text-feast-dark-muted flex items-center gap-1 group-hover:text-feast-sunset transition-colors">
                    Buka di Google Maps <ExternalLink size={10} />
                  </span>
                </a>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-feast-dark-muted gap-1">
                  <Pencil size={16} className="opacity-40" />
                  <span className="text-[10px] font-vietnam opacity-60">Belum ada koordinat</span>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </motion.div>
    </>
  );
};

export default RestaurantProfilePage;
