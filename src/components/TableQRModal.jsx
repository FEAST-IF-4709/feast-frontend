import { QRCodeSVG } from 'qrcode.react';
import { Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QR_URL_BASE = import.meta.env.VITE_PUBLIC_APP_URL || 'https://app.feast.id';

export function TableQRModal({ table, isOpen, onClose }) {
  if (!table) return null;

  const qrUrl = `${QR_URL_BASE}/t/${table.qr_token}`;

  const handlePrint = () => {
    window.print();
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
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 print:hidden">
              <h2 className="font-jakarta text-2xl font-bold text-feast-dark">
                QR Code Meja
              </h2>
              <button onClick={onClose} className="text-feast-dark-muted hover:text-feast-dark">
                <X />
              </button>
            </div>

            <div className="printable text-center py-6">
              <h3 className="font-jakarta text-3xl font-bold text-feast-dark mb-2">
                Meja {table.label}
              </h3>
              <p className="font-vietnam text-feast-dark-secondary mb-6">
                Scan untuk memesan
              </p>

              <div className="inline-block bg-white p-4 rounded-2xl border-2 border-feast-dark/10">
                <QRCodeSVG
                  value={qrUrl}
                  size={240}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <p className="font-mono text-xs text-feast-dark-muted mt-4 break-all">
                {qrUrl}
              </p>
            </div>

            <div className="flex gap-3 mt-6 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 bg-feast-sunset hover:bg-feast-sunset-dark text-white rounded-full py-3 font-vietnam"
              >
                <Printer className="w-4 h-4" />
                Cetak QR
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-white border border-feast-dark/10 text-feast-dark rounded-full py-3 font-vietnam"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
