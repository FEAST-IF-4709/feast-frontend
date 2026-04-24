import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import kineticKitchenImg from '../assets/Kinetic Kitchen Action.jpg';
import chefPlatingImg from '../assets/Chef plating food.jpg';
import dynamicFoodImg from '../assets/Dynamic food plating.jpg';

const menuItems = [
  { id: 1, title: "The Kinetic Burger", price: 14.50, img: kineticKitchenImg, isPopular: true },
  { id: 2, title: "Saffron Power Bowl", price: 16.00, img: dynamicFoodImg },
  { id: 3, title: "Truffle Parm Fries", price: 8.50, img: chefPlatingImg },
  { id: 4, title: "Blistered Margherita", price: 18.00, img: kineticKitchenImg },
];

const OrderPage = () => {
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleAddToCart = (item) => {
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
  const tax = subtotal * 0.085; // 8.5% tax to match the screenshot if needed (or 8%)
  const serviceFee = cart.length > 0 ? 2.50 : 0; // matching screenshot $2.50 service fee
  const grandTotal = subtotal + tax + serviceFee;

  return (
    <>
      {/* Top Bar with Search */}
      <header className="flex items-center gap-6 px-8 py-5 bg-white sticky top-0 z-40 border-b border-feast-bg">
        <div className="flex bg-feast-bg rounded-full p-1.5">
          {['ALL ITEMS', 'MAINS', 'SIDES', 'DRINKS'].map((tab) => (
            <button
              key={tab}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-[0.1em] transition-all duration-200 ${
                tab === 'ALL ITEMS'
                  ? 'bg-feast-amber text-white shadow-sm'
                  : 'text-feast-dark-muted hover:text-feast-dark'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-feast-dark-muted/50" />
          <input
            type="text"
            placeholder="Search the kitchen..."
            className="w-full bg-feast-surface-low rounded-xl pl-12 pr-4 py-3.5 text-sm text-feast-dark font-vietnam placeholder-feast-dark-muted/50 focus:outline-none focus:ring-2 focus:ring-feast-sunset/20"
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-85px)] relative">
        {/* Main Content — Menu Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative h-48 w-full overflow-hidden">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {item.isPopular && (
                    <span className="absolute top-3 left-3 bg-white text-feast-dark text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      Popular
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col items-start gap-4">
                  <div className="flex justify-between items-start w-full gap-4 mb-1">
                    <h3 className="font-bold font-jakarta text-feast-dark text-lg leading-tight flex-1">
                      {item.title}
                    </h3>
                    <span className="font-bold text-feast-amber">${item.price.toFixed(2)}</span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-2.5 bg-feast-sunset text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    + Add to Order
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
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
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-white border-t border-feast-bg space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-feast-dark-muted font-medium">Subtotal</span>
              <span className="font-bold text-feast-dark-secondary">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-feast-dark-muted font-medium">Tax (8.5%)</span>
              <span className="font-bold text-feast-dark-secondary">${tax.toFixed(2)}</span>
            </div>
            {cart.length > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-feast-dark-muted font-medium">Service Fee</span>
                <span className="font-bold text-feast-dark-secondary">${serviceFee.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-feast-bg flex justify-between items-center">
              <span className="text-lg font-bold font-jakarta text-feast-dark">Total</span>
              <span className="text-xl font-bold text-feast-sunset">${grandTotal.toFixed(2)}</span>
            </div>
            <motion.button 
              whileHover={cart.length > 0 ? { scale: 1.02 } : {}}
              whileTap={cart.length > 0 ? { scale: 0.98 } : {}}
              onClick={() => {
                if (cart.length > 0) setShowReceipt(true);
              }}
              disabled={cart.length === 0}
              className={`w-full mt-4 py-3.5 font-semibold font-vietnam rounded-xl transition-all flex items-center justify-center gap-2 ${
                cart.length === 0 
                ? 'bg-feast-surface-low text-feast-dark-muted cursor-not-allowed'
                : 'bg-feast-amber text-white hover:bg-[#c29837]'
              }`}
            >
              Send to Kitchen <span>↗</span>
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
                  <h2 className="text-lg font-bold font-jakarta text-feast-dark leading-tight">The Kinetic Kitchen</h2>
                  <p className="text-xs text-feast-dark-muted mt-1">452 Culinary Avenue, District 9</p>
                </div>

                <div className="flex justify-between items-end border-b border-dashed border-gray-300 pb-4 mb-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-feast-dark-muted font-bold mb-1">Date & Time</p>
                    <p className="text-xs font-bold text-feast-dark">Oct 24, 2023 • 19:45</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-wider text-feast-dark-muted font-bold mb-1">Order ID</p>
                    <p className="text-xs font-bold text-feast-dark">#KK-8924</p>
                  </div>
                </div>

                {/* Left/Right semi-circles to mimic receipt cut */}
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
                      <span className="text-xs font-bold text-feast-dark">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl p-4 space-y-2 mb-2 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-feast-dark-muted font-medium">Subtotal</span>
                    <span className="font-bold text-feast-dark-secondary">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-feast-dark-muted font-medium">Tax (8.5%)</span>
                    <span className="font-bold text-feast-dark-secondary">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-3 border-b border-gray-100">
                    <span className="text-feast-dark-muted font-medium">Service Fee</span>
                    <span className="font-bold text-feast-dark-secondary">${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-bold font-jakarta text-feast-dark">Grand Total</span>
                    <span className="text-base font-bold text-[#d4581f]">${grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-feast-dark-muted">Payment Method</span>
                    <span className="font-bold text-feast-dark-secondary">Visa •••• 4242</span>
                  </div>
                </div>
              </div>

              {/* Receipt Actions */}
              <div className="p-6 pt-0 flex gap-3">
                <button 
                  onClick={() => {
                    setShowReceipt(false);
                    setCart([]); // Clear order after closing
                  }}
                  className="flex-1 py-3 bg-white text-[#d4581f] font-bold text-xs rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Close & New Order
                </button>
                <button 
                  className="flex-1 py-3 bg-[#e56832] text-white font-bold text-xs rounded-lg hover:bg-[#d4581f] transition-colors shadow-sm"
                >
                  Email Receipt
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
