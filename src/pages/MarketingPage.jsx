import { motion } from 'framer-motion';
import { Megaphone, Sparkles } from 'lucide-react';

export default function MarketingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-feast-bg flex items-center justify-center p-8"
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-10 text-center">
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-feast-sunset/10 mb-6"
        >
          <Megaphone className="w-10 h-10 text-feast-sunset" />
        </motion.div>

        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-feast-amber" />
          <span className="text-xs font-vietnam uppercase tracking-wider text-feast-amber font-semibold">
            Coming Soon
          </span>
          <Sparkles className="w-5 h-5 text-feast-amber" />
        </div>

        <h1 className="font-jakarta text-3xl font-bold text-feast-dark mb-3">
          Marketing Hub
        </h1>

        <p className="font-vietnam text-feast-dark-secondary leading-relaxed mb-6">
          Voucher, kampanye, dan program membership akan hadir di versi
          berikutnya. Pantau terus update dari kami.
        </p>

        <div className="space-y-2 text-left bg-feast-bg rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-vietnam text-feast-dark-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-feast-sunset" />
            Voucher &amp; Diskon
          </div>
          <div className="flex items-center gap-2 text-sm font-vietnam text-feast-dark-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-feast-sunset" />
            Kampanye Promosi
          </div>
          <div className="flex items-center gap-2 text-sm font-vietnam text-feast-dark-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-feast-sunset" />
            Membership Program
          </div>
        </div>
      </div>
    </motion.div>
  );
}
