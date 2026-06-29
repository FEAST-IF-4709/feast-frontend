import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import FeaturedBannerTab from './menu/FeaturedBannerTab';
import FormField from '../components/FormField';
import { advertisementApi } from '../api/catalog';
import { handleApiError } from '../api/errorHandler';
import { useToast } from '../hooks/useToast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const TABS = [
  { key: 'special-offer', label: 'Special Offer' },
  { key: 'push-notification', label: 'Push Notification' },
];

export default function AdvertisementPage() {
  const [activeTab, setActiveTab] = useState('special-offer');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-feast-bg"
    >
      <div className="px-8 pt-8 pb-4">
        <PageHeader
          title="Advertisement"
          subtitle="Kelola banner promosi dan kirim notifikasi langsung ke pelanggan brand kamu."
        />
        <motion.div variants={itemVariants} className="mt-6">
          <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="px-8 pb-10 pt-6">
        {activeTab === 'special-offer' && <FeaturedBannerTab />}
        {activeTab === 'push-notification' && <PushNotificationTab />}
      </motion.div>
    </motion.div>
  );
}

function PushNotificationTab() {
  const toast = useToast();
  const [form, setForm] = useState({ title: '', body: '' });
  const [errors, setErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Judul notifikasi wajib diisi';
    if (!form.body.trim()) errs.body = 'Isi pesan wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSending(true);
    setLastResult(null);
    try {
      const res = await advertisementApi.sendPush({ title: form.title.trim(), body: form.body.trim() });
      const payload = res.data?.data ?? res.data;
      const sent = payload?.sent ?? 0;
      setLastResult(sent);
      toast.success(`Notifikasi terkirim ke ${sent} perangkat`);
      setForm({ title: '', body: '' });
    } catch (err) {
      handleApiError(err, { showError: toast.error });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-xl pt-2">
      {/* Info card */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
        <Bell size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 font-vietnam leading-relaxed">
          Notifikasi akan dikirim ke semua pelanggan yang pernah memesan dari brand ini dan sudah mengaktifkan notifikasi di aplikasi mobile.
        </p>
      </div>

      <form onSubmit={handleSend} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <FormField
          label="Judul Notifikasi"
          name="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          error={errors.title}
          placeholder="cth. Promo Spesial Hari Ini!"
          required
        />

        <div>
          <label className="block text-xs font-semibold text-feast-dark-secondary font-vietnam mb-1.5">
            Isi Pesan <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="cth. Dapatkan diskon 20% untuk semua menu hari ini. Jangan sampai ketinggalan!"
            rows={4}
            className={`w-full bg-feast-bg rounded-xl px-4 py-3 text-sm font-vietnam text-feast-dark placeholder-feast-dark-muted resize-none focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 ${errors.body ? 'ring-2 ring-red-400' : ''}`}
          />
          {errors.body && <p className="text-xs text-red-500 mt-1 font-vietnam">{errors.body}</p>}
          <p className="text-xs text-feast-dark-muted font-vietnam mt-1">{form.body.length}/200 karakter</p>
        </div>

        {/* Preview */}
        {(form.title || form.body) && (
          <div className="bg-feast-bg rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-feast-dark-muted font-vietnam mb-2">Preview Notifikasi</p>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-feast-bg">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-feast-sunset rounded-lg flex-shrink-0 flex items-center justify-center">
                  <Bell size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-feast-dark font-vietnam truncate">
                    {form.title || 'Judul notifikasi'}
                  </p>
                  <p className="text-xs text-feast-dark-secondary font-vietnam line-clamp-2 mt-0.5">
                    {form.body || 'Isi pesan...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {lastResult !== null && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700 font-vietnam">
            ✓ Notifikasi terakhir terkirim ke <strong>{lastResult}</strong> perangkat.
          </div>
        )}

        <button
          type="submit"
          disabled={isSending}
          className="flex items-center justify-center gap-2 w-full py-3 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-xl hover:bg-feast-sunset-dark transition-all disabled:opacity-50"
        >
          <Send size={15} />
          {isSending ? 'Mengirim...' : 'Kirim Notifikasi'}
        </button>
      </form>
    </div>
  );
}
