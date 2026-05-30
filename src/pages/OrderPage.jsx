import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { getOutletId } from '../api/auth';

const OrderPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Fetch menu from API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const outletId = getOutletId();
        const res = await api.get(`/public/outlets/${outletId}/menu/`);
        const menuData = res.data.data?.menu || [];

        // Extract categories
        const cats = menuData.map((cat) => ({
          id: cat.category_id,
          name: cat.category_name,
        }));
        setCategories(cats);

        // Flatten all items with category info
        const allItems = menuData.flatMap((cat) =>
          (cat.items || []).map((item) => ({
            id: item.id,
            title: item.name,
            description: item.description,
            price: parseFloat(item.price),
            image_url: item.image_url,
            category_id: cat.category_id,
            category_name: cat.category_name,
            stock_available: item.stock_available,
            promotion: item.active_promotion,
          }))
        );
        setMenuItems(allItems);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setIsLoadingMenu(false);
      }
    };
    fetchMenu();
  }, []);

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'ALL' || item.category_id === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item) => {
    if (!item.stock_available) return;
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% PPN
  const grandTotal = subtotal + tax;

  // Send to Kitchen — creates order via API
  const handleSendToKitchen = async () => {
    if (cart.length === 0 || isSending) return;
    setIsSending(true);

    try {
      const outletId = getOutletId();

      // 1. Create order via cashier POS
      const orderRes = await api.post('/orders/cashier-pos/', {
        outlet_id: outletId,
        payment_method: 'CASH',
        items: cart.map((item) => ({
          outlet_product_id: item.id,
          quantity: item.quantity,
          item_notes: '',
        })),
        notes: '',
      });

      const orderData = orderRes.data.data;

      // 2. Settle payment as CASH
      try {
        await api.post('/payments/manual-settle/', {
          order_id: orderData.order_id || orderData.id,
          payment_method: 'CASH',
          amount_received: parseFloat(orderData.grand_total || grandTotal),
          change_given: 0,
        });
      } catch (settleErr) {
        // Payment might already be settled or not required — still show receipt
        console.warn('Payment settle warning:', settleErr);
      }

      // 3. Show receipt with real data
      setReceiptData({
        orderNumber: orderData.order_number || `#${(orderData.order_id || orderData.id || '').slice(0, 8)}`,
        grandTotal: parseFloat(orderData.grand_total || grandTotal),
        placedAt: orderData.placed_at || new Date().toISOString(),
      });
      setShowReceipt(true);
    } catch (err) {
      console.error('Failed to create order:', err);
      const msg = err.response?.data?.message || 'Gagal membuat order. Coba lagi.';
      alert(msg);
    } finally {
      setIsSending(false);
    }
  };

  const formatCurrency = (val) => `Rp${val.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;

  return (
    <>
      {/* Top Bar with Category Tabs & Search */}
      <header className="flex items-center gap-6 px-8 py-5 bg-white sticky top-0 z-40 border-b border-feast-bg">
        <div className="flex bg-feast-bg rounded-full p-1.5 overflow-x-auto">
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
        <div className="relative flex-1 max-w-xl">
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
        {/* Main Content — Menu Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          {isLoadingMenu ? (
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
            <h2 className="text-xl font-bold font-jakarta text-feast-dark pb-4 border-b border-feast-bg">
              Current Order
            </h2>
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
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex justify-between items-start"
                  >
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded bg-feast-surface-low text-feast-dark text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {item.quantity}x
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-feast-dark leading-tight">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-feast-dark-secondary">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-white border-t border-feast-bg space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-feast-dark-muted font-medium">Subtotal</span>
              <span className="font-bold text-feast-dark-secondary">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-feast-dark-muted font-medium">PPN (10%)</span>
              <span className="font-bold text-feast-dark-secondary">{formatCurrency(tax)}</span>
            </div>
            <div className="pt-3 border-t border-feast-bg flex justify-between items-center">
              <span className="text-lg font-bold font-jakarta text-feast-dark">Total</span>
              <span className="text-xl font-bold text-feast-sunset">{formatCurrency(grandTotal)}</span>
            </div>
            <motion.button
              whileHover={cart.length > 0 ? { scale: 1.02 } : {}}
              whileTap={cart.length > 0 ? { scale: 0.98 } : {}}
              onClick={handleSendToKitchen}
              disabled={cart.length === 0 || isSending}
              className={`w-full mt-4 py-3.5 font-semibold font-vietnam rounded-xl transition-all flex items-center justify-center gap-2 ${
                cart.length === 0 || isSending
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

        {/* Receipt Overlay (Modal) */}
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
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#f9f9f9] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col relative"
              >
                {/* Receipt Content */}
                <div className="p-8 pb-6 flex-1 overflow-y-auto">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-[#fbdfce] text-[#d4581f] rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold font-jakarta text-feast-dark leading-tight">FEAST Kitchen</h2>
                    <p className="text-xs text-feast-dark-muted mt-1">Order Confirmed</p>
                  </div>

                  <div className="flex justify-between items-end border-b border-dashed border-gray-300 pb-4 mb-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-feast-dark-muted font-bold mb-1">Date & Time</p>
                      <p className="text-xs font-bold text-feast-dark">
                        {receiptData?.placedAt
                          ? new Date(receiptData.placedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                          : new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider text-feast-dark-muted font-bold mb-1">Order ID</p>
                      <p className="text-xs font-bold text-feast-dark">{receiptData?.orderNumber || '#—'}</p>
                    </div>
                  </div>

                  {/* Semi-circles */}
                  <div className="absolute top-[180px] -left-3 w-6 h-6 bg-black/30 rounded-full" />
                  <div className="absolute top-[180px] -right-3 w-6 h-6 bg-black/30 rounded-full" />

                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div className="flex gap-3">
                          <span className="text-xs font-bold text-feast-dark-muted">{item.quantity}x</span>
                          <div>
                            <p className="text-xs font-bold text-feast-dark leading-tight">{item.title}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-feast-dark">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl p-4 space-y-2 mb-2 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-feast-dark-muted font-medium">Subtotal</span>
                      <span className="font-bold text-feast-dark-secondary">{formatCurrency(subtotal)}</span>
                    </div>
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
                      <span className="font-bold text-feast-dark-secondary">CASH</span>
                    </div>
                  </div>
                </div>

                {/* Receipt Actions */}
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
    </>
  );
};

export default OrderPage;
