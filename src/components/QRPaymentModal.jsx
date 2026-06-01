import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { paymentsApi } from '../api/payments';
import { connectOrderTracking } from '../api/websocket';
import { getAccessToken } from '../api/auth';
import { useToast } from '../hooks/useToast';
import { formatIDR } from '../utils/format';

export default function QRPaymentModal({ order, qris, isOpen, onClose, onSettled }) {
  const [status, setStatus] = useState('PENDING');
  const [currentQris, setCurrentQris] = useState(qris);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [imgError, setImgError] = useState(false);
  const settledRef = useRef(false);
  const countdownRef = useRef(null);
  const toast = useToast();

  // Sync qris prop when parent updates
  useEffect(() => {
    if (qris) {
      setCurrentQris(qris);
      setImgError(false);
      setStatus('PENDING');
      settledRef.current = false;
    }
  }, [qris]);

  // Countdown timer — resets whenever currentQris changes
  useEffect(() => {
    if (!currentQris?.expires_at || status !== 'PENDING') return;
    clearInterval(countdownRef.current);

    const expiry = new Date(currentQris.expires_at).getTime();
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff === 0) {
        setStatus('EXPIRED');
        clearInterval(countdownRef.current);
      }
    };
    tick();
    countdownRef.current = setInterval(tick, 1000);
    return () => clearInterval(countdownRef.current);
  }, [currentQris?.expires_at, status]);

  // WebSocket — reconnects when order id or status changes back to PENDING
  useEffect(() => {
    if (!isOpen || !order?.id || status !== 'PENDING') return;

    const token = getAccessToken();
    const ws = connectOrderTracking(order.id, token, {
      onMessage: (data) => {
        if (data.event !== 'payment.status_changed') return;
        const newStatus = data.data?.payment_status;
        if (newStatus === 'SETTLED' && !settledRef.current) {
          settledRef.current = true;
          setStatus('SETTLED');
          toast.success('Pembayaran berhasil!');
          setTimeout(() => onSettled(order), 1500);
        } else if (['EXPIRED', 'DENIED', 'FAILED'].includes(newStatus)) {
          setStatus('EXPIRED');
        }
      },
    });

    return () => ws.disconnect();
  }, [isOpen, order?.id, status]);

  // Polling fallback every 5s
  useEffect(() => {
    if (!isOpen || !order?.id || status !== 'PENDING') return;

    const intervalId = setInterval(async () => {
      try {
        const res = await paymentsApi.getStatus(order.id);
        const data = res.data?.data ?? res.data;
        if (data.payment_status === 'SETTLED' && !settledRef.current) {
          settledRef.current = true;
          setStatus('SETTLED');
          toast.success('Pembayaran berhasil!');
          setTimeout(() => onSettled(order), 1500);
        } else if (['EXPIRED', 'DENIED', 'FAILED'].includes(data.payment_status)) {
          setStatus('EXPIRED');
        }
      } catch {
        // silent — WS handles primary notification
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isOpen, order?.id, status]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await paymentsApi.initiateQris(order.id);
      const newQris = res.data?.data ?? res.data;
      settledRef.current = false;
      setImgError(false);
      setCurrentQris(newQris);
      setStatus('PENDING');
    } catch {
      toast.error('Gagal generate QR baru');
    } finally {
      setIsRegenerating(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-jakarta text-2xl font-bold text-feast-dark">
                Pembayaran QRIS
              </h2>
              {status !== 'PENDING' && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-feast-bg transition-colors"
                >
                  <X className="w-5 h-5 text-feast-dark-muted" />
                </button>
              )}
            </div>

            {/* SETTLED */}
            {status === 'SETTLED' && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </motion.div>
                <h3 className="font-jakarta text-xl font-bold text-feast-dark mb-2">
                  Pembayaran Berhasil
                </h3>
                <p className="font-vietnam text-feast-dark-muted">
                  Pesanan dikirim ke dapur
                </p>
              </div>
            )}

            {/* EXPIRED */}
            {status === 'EXPIRED' && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="font-jakarta text-xl font-bold text-feast-dark mb-2">
                  QR Code Kadaluarsa
                </h3>
                <p className="font-vietnam text-feast-dark-muted mb-6">
                  Generate QR baru untuk lanjut pembayaran
                </p>
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="bg-feast-sunset hover:bg-feast-sunset-dark text-white rounded-full px-6 py-3 font-vietnam flex items-center gap-2 mx-auto disabled:opacity-60 transition-colors"
                >
                  {isRegenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Generate QR Baru
                    </>
                  )}
                </button>
              </div>
            )}

            {/* PENDING */}
            {status === 'PENDING' && (
              <>
                <div className="text-center mb-6">
                  <p className="font-vietnam text-sm text-feast-dark-muted mb-1">
                    Total Pembayaran
                  </p>
                  <p className="font-jakarta text-3xl font-bold text-feast-dark">
                    {formatIDR(currentQris?.amount ?? order?.grand_total)}
                  </p>
                </div>

                <div className="bg-feast-bg rounded-2xl p-6 mb-6 flex justify-center">
                  <div className="bg-white rounded-xl p-4 inline-block">
                    {currentQris?.qr_image_url && !imgError ? (
                      <img
                        src={currentQris.qr_image_url}
                        alt="QRIS Code"
                        className="w-56 h-56 object-contain"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <QRCodeSVG
                        value={currentQris?.qr_string || ''}
                        size={224}
                        level="H"
                        includeMargin={false}
                      />
                    )}
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="font-vietnam text-sm text-feast-dark-muted">
                    Sisa waktu pembayaran
                  </p>
                  <p className="font-mono text-2xl font-bold text-feast-sunset">
                    {formatTime(secondsLeft)}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-feast-dark-muted font-vietnam mb-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menunggu pembayaran...</span>
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-white border border-feast-dark/10 text-feast-dark rounded-full py-3 font-vietnam hover:bg-feast-bg transition-colors"
                >
                  Batalkan Pembayaran
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
