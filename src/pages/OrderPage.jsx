import React, { useState, useEffect } from 'react';
import { Search, Loader2, Banknote, QrCode, Store, ChevronDown, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { ordersApi } from '../api/orders';
import { paymentsApi } from '../api/payments';
import { outletsApi } from '../api/outlets';
import { getOutletId } from '../api/auth';
import { handleApiError } from '../api/errorHandler';
import { useToast } from '../hooks/useToast';
import QRPaymentModal from '../components/QRPaymentModal';
import { formatIDR, formatDateTime } from '../utils/format';

const PAYMENT_METHODS = [
  { key: 'CASH', label: 'Tunai', icon: Banknote },
  { key: 'QRIS_MIDTRANS', label: 'QRIS', icon: QrCode },
];

const OrderPage = () => {
  // Determine if current user is an owner (no fixed outlet) or cashier (fixed outlet)
  const fixedOutletId = getOutletId();
  const isOwner = !fixedOutletId;

  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState(fixedOutletId || '');
  const [isLoadingOutlets, setIsLoadingOutlets] = useState(isOwner);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(!isOwner);
  const [isSending, setIsSending] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [qrisModalData, setQrisModalData] = useState(null);
  const [brandName, setBrandName] = useState('');
  const toast = useToast();

  // Fetch brand name once on mount
  useEffect(() => {
    api.get('/brands/').then((res) => {
      const data = res.data?.data ?? res.data ?? {};
      setBrandName(data.name ?? '');
    }).catch(() => {});
  }, []);

  // Fetch outlet list for owners
  useEffect(() => {
    if (!isOwner) return;
    const loadOutlets = async () => {
      try {
        const res = await outletsApi.list();
        const data = res.data?.data ?? res.data ?? [];
        const list = Array.isArray(data) ? data : [];
        setOutlets(list);
        if (list.length === 1) {
          setSelectedOutletId(list[0].id);
        }
      } catch (err) {
        toast.error('Gagal memuat daftar outlet');
      } finally {
        setIsLoadingOutlets(false);
      }
    };
    loadOutlets();
  }, [isOwner]);

  // Fetch menu when outletId is known
  useEffect(() => {
    if (!selectedOutletId) return;

    const fetchMenu = async () => {
      setIsLoadingMenu(true);
      setMenuItems([]);
      setCategories([]);
      setActiveCategory('ALL');
      setCart([]);
      try {
        const res = await api.get(`/public/outlets/${selectedOutletId}/menu/`);
        const groupedMenu = res.data?.data?.menu ?? [];

        setCategories(groupedMenu.map((cat) => ({ id: cat.category_id, name: cat.category_name })));

        const allItems = groupedMenu.flatMap((cat) =>
          cat.items.map((item) => ({
            id: item.id,
            title: item.name,
            description: item.description,
            price: parseFloat(item.price),
            image_url: item.image_url,
            category_id: item.category_id,
            category_name: item.category_name,
            stock_available: item.stock_available,
            promotion: item.active_promotion,
          }))
        );
        setMenuItems(allItems);
      } catch (err) {
        toast.error('Gagal memuat menu');
      } finally {
        setIsLoadingMenu(false);
      }
    };

    fetchMenu();
  }, [selectedOutletId]);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'ALL' || item.category_id === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getEffectivePrice = (item) => {
    if (!item.promotion) return item.price;
    const val = parseFloat(item.promotion.discount_value);
    if (item.promotion.discount_type === 'percent') {
      return item.price * (1 - val / 100);
    }
    return Math.max(0, item.price - val);
  };

  const handleAddToCart = (item) => {
    if (!item.stock_available) return;
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      const effectivePrice = getEffectivePrice(item);
      return [...prev, { ...item, effectivePrice, quantity: 1 }];
    });
  };

  const handleDecreaseCart = (itemId) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((cartItem) => cartItem.id !== itemId);
      return prev.map((cartItem) =>
        cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
      );
    });
  };

  const originalSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.effectivePrice ?? item.price) * item.quantity, 0);
  const discountTotal = originalSubtotal - subtotal;
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;

  const handleSendToKitchen = async () => {
    if (cart.length === 0 || isSending || !selectedOutletId) return;
    setIsSending(true);

    try {
      // Step 1: Create order
      const orderRes = await ordersApi.createCashierPos({
        outlet_id: selectedOutletId,
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          outlet_product_id: item.id,
          quantity: item.quantity,
          item_notes: '',
        })),
        notes: '',
      });

      const orderData = orderRes.data?.data ?? orderRes.data;

      if (paymentMethod === 'QRIS_MIDTRANS') {
        const qrisRes = await paymentsApi.initiateQris(orderData.order_id || orderData.id);
        const qrisData = qrisRes.data?.data ?? qrisRes.data;
        setQrisModalData({ order: orderData, qris: qrisData });
      } else {
        try {
          await paymentsApi.manualSettle({
            order_id: orderData.order_id || orderData.id,
            payment_method: paymentMethod,
            amount_received: parseFloat(orderData.grand_total || grandTotal),
            change_given: 0,
          });
        } catch (settleErr) {
          console.warn('Payment settle warning:', settleErr);
        }

        setReceiptData({
          orderNumber: orderData.order_number || `#${(orderData.order_id || orderData.id || '').toString().slice(0, 8)}`,
          grandTotal: parseFloat(orderData.grand_total || grandTotal),
          placedAt: orderData.placed_at || new Date().toISOString(),
          paymentMethod,
        });
        setShowReceipt(true);
      }
    } catch (err) {
      handleApiError(err, { showError: (msg) => toast.error(msg) });
    } finally {
      setIsSending(false);
    }
  };

  const handleQrisSettled = (order) => {
    setQrisModalData(null);
    setReceiptData({
      orderNumber: order.order_number || `#${(order.order_id || order.id || '').toString().slice(0, 8)}`,
      grandTotal: parseFloat(order.grand_total || grandTotal),
      placedAt: order.placed_at || new Date().toISOString(),
      paymentMethod: 'QRIS_MIDTRANS',
    });
    setShowReceipt(true);
  };

  const handleQrisClose = () => setQrisModalData(null);

  const handlePrint = () => {
    if (!receiptData) return;

    const fmt = (val) => formatIDR(val);
    const pmLabel = { CASH: 'Tunai', QRIS_MIDTRANS: 'QRIS', EDC: 'EDC' };

    const itemRows = cart.map((item) => {
      const ep = item.effectivePrice ?? item.price;
      const hasDisc = item.promotion;
      const discLabel = hasDisc
        ? item.promotion.discount_type === 'percent'
          ? ` (-${parseFloat(item.promotion.discount_value)}%)`
          : ` (-${fmt(parseFloat(item.promotion.discount_value))})`
        : '';
      return `
        <tr>
          <td style="padding:4px 0;vertical-align:top">${item.quantity}x ${item.title}${discLabel}</td>
          <td style="padding:4px 0;text-align:right;vertical-align:top;white-space:nowrap">${fmt(ep * item.quantity)}</td>
        </tr>`;
    }).join('');

    const discountRow = discountTotal > 0
      ? `<tr><td style="padding:2px 0;color:#888">Diskon</td><td style="padding:2px 0;text-align:right;color:#d4581f">- ${fmt(discountTotal)}</td></tr>`
      : '';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt ${receiptData.orderNumber}</title>
  <style>
    @media print { @page { margin: 8mm; size: 80mm auto; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      color: #1a1a1a;
      background: #fff;
      width: 80mm;
      padding: 8px 0;
    }
    .center { text-align: center; }
    .brand { font-size: 16px; font-weight: 700; letter-spacing: 1px; }
    .outlet { font-size: 11px; color: #d4581f; margin-top: 2px; }
    .divider-solid { border-top: 1px solid #1a1a1a; margin: 8px 0; }
    .divider-dash  { border-top: 1px dashed #999;  margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { font-size: 12px; }
    .label { color: #555; }
    .total-row td { font-size: 13px; font-weight: 700; padding-top: 6px; }
    .grand td { font-size: 15px; font-weight: 700; }
    .grand td:last-child { color: #d4581f; }
    .footer { font-size: 10px; color: #888; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="center">
    <div class="brand">${brandName || 'FEAST'}</div>
    ${selectedOutletName ? `<div class="outlet">${selectedOutletName}</div>` : ''}
  </div>

  <div class="divider-solid"></div>

  <table>
    <tr>
      <td class="label">Tanggal</td>
      <td style="text-align:right">${formatDateTime(receiptData.placedAt)}</td>
    </tr>
    <tr>
      <td class="label">No. Order</td>
      <td style="text-align:right;font-weight:700">${receiptData.orderNumber}</td>
    </tr>
  </table>

  <div class="divider-dash"></div>

  <table>${itemRows}</table>

  <div class="divider-dash"></div>

  <table>
    <tr>
      <td class="label">Subtotal</td>
      <td style="text-align:right">${fmt(subtotal)}</td>
    </tr>
    ${discountRow}
    <tr>
      <td class="label">PPN (10%)</td>
      <td style="text-align:right">${fmt(tax)}</td>
    </tr>
  </table>

  <div class="divider-solid"></div>

  <table>
    <tr class="grand">
      <td>TOTAL</td>
      <td style="text-align:right">${fmt(receiptData.grandTotal)}</td>
    </tr>
    <tr class="total-row">
      <td class="label" style="font-weight:400;font-size:11px">Pembayaran</td>
      <td style="text-align:right;font-size:11px">${pmLabel[receiptData.paymentMethod] || receiptData.paymentMethod}</td>
    </tr>
  </table>

  <div class="divider-dash"></div>

  <div class="center footer">
    <p>Terima kasih atas kunjungan Anda!</p>
    <p style="margin-top:4px">Powered by FEAST</p>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=400,height=600');
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const formatCurrency = (val) => formatIDR(val);

  const paymentMethodLabel = {
    CASH: 'Tunai',
    QRIS_MIDTRANS: 'QRIS',
  };

  const selectedOutletName = outlets.find((o) => o.id === selectedOutletId)?.name ?? '';

  return (
    <>
      {/* Top Bar */}
      <header className="flex items-center gap-4 px-8 py-5 bg-white sticky top-0 z-40 border-b border-feast-bg">
        {/* Owner outlet selector */}
        {isOwner && (
          <div className="relative flex-shrink-0">
            {isLoadingOutlets ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-feast-bg rounded-xl text-sm text-feast-dark-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memuat outlet...</span>
              </div>
            ) : (
              <div className="relative">
                <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-feast-sunset pointer-events-none" />
                <select
                  value={selectedOutletId}
                  onChange={(e) => setSelectedOutletId(e.target.value)}
                  className="appearance-none bg-feast-bg rounded-xl pl-9 pr-9 py-2.5 text-sm font-semibold font-vietnam text-feast-dark focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 min-w-[180px] cursor-pointer"
                >
                  <option value="">-- Pilih Outlet --</option>
                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-feast-dark-muted pointer-events-none" />
              </div>
            )}
          </div>
        )}

        {/* Category tabs */}
        <div className="flex bg-feast-bg rounded-full p-1.5 overflow-x-auto flex-1">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-[0.1em] transition-all duration-200 whitespace-nowrap ${
              activeCategory === 'ALL'
                ? 'bg-feast-amber text-white shadow-sm'
                : 'text-feast-dark-muted hover:text-feast-dark'
            }`}
          >
            ALL ITEMS
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-[0.1em] transition-all duration-200 whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-feast-amber text-white shadow-sm'
                  : 'text-feast-dark-muted hover:text-feast-dark'
              }`}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-shrink-0 w-72">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-feast-dark-muted/50" />
          <input
            type="text"
            placeholder="Search the kitchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-feast-surface-low rounded-xl pl-12 pr-4 py-3.5 text-sm text-feast-dark font-vietnam placeholder-feast-dark-muted/50 focus:outline-none focus:ring-2 focus:ring-feast-sunset/20"
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-85px)] relative">
        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          {isOwner && !selectedOutletId ? (
            <div className="flex flex-col items-center justify-center py-20 text-feast-dark-muted">
              <Store className="w-14 h-14 mb-4 text-feast-sunset/40" />
              <p className="text-lg font-semibold">Pilih outlet terlebih dahulu</p>
              <p className="text-sm mt-1">Gunakan dropdown di atas untuk memilih outlet yang ingin dipesan.</p>
            </div>
          ) : isLoadingMenu ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin w-8 h-8 text-feast-sunset" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-feast-dark-muted">
              <p className="text-lg font-semibold">Tidak ada menu ditemukan</p>
              <p className="text-sm mt-1">Coba ubah kategori atau kata kunci pencarian.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="relative h-48 w-full overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-feast-sunset/20 to-feast-amber/20 flex items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    {item.promotion && (
                      <span className="absolute top-3 left-3 bg-feast-sunset text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                        {item.promotion.discount_type === 'percent' ? `${parseFloat(item.promotion.discount_value)}% OFF` : 'Promo'}
                      </span>
                    )}
                    {!item.stock_available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-sm bg-black/60 px-4 py-2 rounded-full">Habis</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col items-start gap-4">
                    <div className="flex justify-between items-start w-full gap-4 mb-1">
                      <div className="flex-1">
                        <h3 className="font-bold font-jakarta text-feast-dark text-lg leading-tight">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-feast-dark-muted mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      <span className="font-bold text-feast-amber whitespace-nowrap">{formatCurrency(item.price)}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.stock_available}
                      className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                        item.stock_available
                          ? 'bg-feast-sunset text-white'
                          : 'bg-feast-surface-low text-feast-dark-muted cursor-not-allowed'
                      }`}
                    >
                      + Add to Order
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar — Current Order */}
        <aside className="w-80 bg-white border-l border-feast-bg flex flex-col h-full sticky top-0">
          <div className="p-6">
            <h2 className="text-xl font-bold font-jakarta text-feast-dark pb-1 border-b border-feast-bg">
              Current Order
            </h2>
            {selectedOutletName && (
              <p className="text-xs text-feast-sunset font-semibold mt-2 flex items-center gap-1">
                <Store size={12} />
                {selectedOutletName}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 space-y-5">
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-sm text-feast-dark-muted mt-10"
                >
                  No items in order yet.
                </motion.p>
              ) : (
                cart.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex items-center gap-3"
                  >
                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleDecreaseCart(item.id)}
                        className="w-6 h-6 rounded-full bg-feast-bg flex items-center justify-center text-feast-dark hover:bg-feast-sunset hover:text-white transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-feast-dark tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-6 h-6 rounded-full bg-feast-sunset flex items-center justify-center text-white hover:bg-[#c94e2a] transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    {/* Name + diskon badge */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-feast-dark leading-tight truncate">
                        {item.title}
                      </h4>
                      {item.promotion && (
                        <span className="text-[10px] text-feast-sunset font-semibold">
                          {item.promotion.discount_type === 'percent'
                            ? `${parseFloat(item.promotion.discount_value)}% off`
                            : `- ${formatCurrency(parseFloat(item.promotion.discount_value))}`}
                        </span>
                      )}
                    </div>

                    {/* Subtotal pakai effectivePrice */}
                    <span className="text-sm font-bold text-feast-dark-secondary flex-shrink-0">
                      {formatCurrency((item.effectivePrice ?? item.price) * item.quantity)}
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-white border-t border-feast-bg space-y-3">
            {/* Totals */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-feast-dark-muted font-medium">Subtotal</span>
              <span className="font-bold text-feast-dark-secondary">{formatCurrency(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-feast-sunset font-medium">Diskon</span>
                <span className="font-bold text-feast-sunset">- {formatCurrency(discountTotal)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-feast-dark-muted font-medium">PPN (10%)</span>
              <span className="font-bold text-feast-dark-secondary">{formatCurrency(tax)}</span>
            </div>
            <div className="pt-3 border-t border-feast-bg flex justify-between items-center">
              <span className="text-lg font-bold font-jakarta text-feast-dark">Total</span>
              <span className="text-xl font-bold text-feast-sunset">{formatCurrency(grandTotal)}</span>
            </div>

            {/* Payment Method Selector — Tunai & QRIS only */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-feast-dark-muted uppercase tracking-wider mb-2">
                Metode Pembayaran
              </p>
              <div className="grid grid-cols-2 gap-1.5 bg-feast-bg rounded-xl p-1">
                {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPaymentMethod(key)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      paymentMethod === key
                        ? 'bg-feast-sunset text-white shadow-sm'
                        : 'text-feast-dark-muted hover:text-feast-dark'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={cart.length > 0 && selectedOutletId ? { scale: 1.02 } : {}}
              whileTap={cart.length > 0 && selectedOutletId ? { scale: 0.98 } : {}}
              onClick={handleSendToKitchen}
              disabled={cart.length === 0 || isSending || !selectedOutletId}
              className={`w-full mt-2 py-3.5 font-semibold font-vietnam rounded-xl transition-all flex items-center justify-center gap-2 ${
                cart.length === 0 || isSending || !selectedOutletId
                  ? 'bg-feast-surface-low text-feast-dark-muted cursor-not-allowed'
                  : 'bg-feast-amber text-white hover:bg-[#c29837]'
              }`}
            >
              {isSending ? (
                <><Loader2 className="animate-spin w-4 h-4" /> Processing...</>
              ) : (
                <>Send to Kitchen <span>↗</span></>
              )}
            </motion.button>
          </div>
        </aside>

        {/* Receipt Overlay */}
        <AnimatePresence>
          {showReceipt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-[#f9f9f9] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col relative"
              >
                <div id="receipt-print-area" className="p-8 pb-6 flex-1 overflow-y-auto">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-[#fbdfce] text-[#d4581f] rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold font-jakarta text-feast-dark leading-tight">{brandName || 'FEAST'}</h2>
                    {selectedOutletName && (
                      <p className="text-xs text-feast-sunset font-semibold mt-0.5">{selectedOutletName}</p>
                    )}
                    <p className="text-xs text-feast-dark-muted mt-1">Order Confirmed</p>
                  </div>

                  <div className="flex justify-between items-end border-b border-dashed border-gray-300 pb-4 mb-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-feast-dark-muted font-bold mb-1">Date & Time</p>
                      <p className="text-xs font-bold text-feast-dark">
                        {formatDateTime(receiptData?.placedAt || new Date().toISOString())}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider text-feast-dark-muted font-bold mb-1">Order ID</p>
                      <p className="text-xs font-bold text-feast-dark">{receiptData?.orderNumber || '#—'}</p>
                    </div>
                  </div>

                  <div className="absolute top-[195px] -left-3 w-6 h-6 bg-black/30 rounded-full" />
                  <div className="absolute top-[195px] -right-3 w-6 h-6 bg-black/30 rounded-full" />

                  <div className="space-y-4 mb-6">
                    {cart.map((item) => {
                      const ep = item.effectivePrice ?? item.price;
                      return (
                        <div key={item.id} className="flex justify-between items-start gap-4">
                          <div className="flex gap-3">
                            <span className="text-xs font-bold text-feast-dark-muted">{item.quantity}x</span>
                            <div>
                              <p className="text-xs font-bold text-feast-dark leading-tight">{item.title}</p>
                              {item.promotion && (
                                <p className="text-[10px] text-feast-sunset">
                                  {item.promotion.discount_type === 'percent'
                                    ? `${parseFloat(item.promotion.discount_value)}% off`
                                    : `- ${formatCurrency(parseFloat(item.promotion.discount_value))}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-feast-dark">{formatCurrency(ep * item.quantity)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-white rounded-xl p-4 space-y-2 mb-2 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-feast-dark-muted font-medium">Subtotal</span>
                      <span className="font-bold text-feast-dark-secondary">{formatCurrency(subtotal)}</span>
                    </div>
                    {discountTotal > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-feast-sunset font-medium">Diskon</span>
                        <span className="font-bold text-feast-sunset">- {formatCurrency(discountTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs pb-3 border-b border-gray-100">
                      <span className="text-feast-dark-muted font-medium">PPN (10%)</span>
                      <span className="font-bold text-feast-dark-secondary">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm font-bold font-jakarta text-feast-dark">Grand Total</span>
                      <span className="text-base font-bold text-[#d4581f]">
                        {formatCurrency(receiptData?.grandTotal || grandTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="text-feast-dark-muted">Payment Method</span>
                      <span className="font-bold text-feast-dark-secondary">
                        {paymentMethodLabel[receiptData?.paymentMethod] || receiptData?.paymentMethod || 'Tunai'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex gap-3">
                  <button
                    onClick={() => {
                      setShowReceipt(false);
                      setCart([]);
                      setReceiptData(null);
                    }}
                    className="flex-1 py-3 bg-white text-[#d4581f] font-bold text-xs rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Close & New Order
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex-1 py-3 bg-[#e56832] text-white font-bold text-xs rounded-lg hover:bg-[#d4581f] transition-colors shadow-sm"
                  >
                    Print Receipt
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* QRIS Payment Modal */}
      <QRPaymentModal
        isOpen={!!qrisModalData}
        order={qrisModalData?.order}
        qris={qrisModalData?.qris}
        onClose={handleQrisClose}
        onSettled={handleQrisSettled}
      />
    </>
  );
};

export default OrderPage;
