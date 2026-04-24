import React from 'react';
import { Filter, Clock, CheckSquare, Square } from 'lucide-react';
import { motion } from 'framer-motion';

const KitchenPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <>
      <header className="flex justify-between items-center px-8 py-5 bg-feast-bg sticky top-0 z-40">
        <div>
          <h2 className="text-2xl font-bold font-jakarta text-feast-dark">Active Orders</h2>
          <p className="text-sm text-feast-dark-muted mt-1">
            12 pending · 4 preparing · 2 ready
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-feast-surface-low text-feast-dark font-semibold text-sm rounded-full hover:bg-gray-200 transition-colors">
            <Filter size={16} /> Filter
          </button>
          <button className="px-5 py-2.5 bg-feast-amber text-white font-semibold text-sm rounded-full hover:bg-[#c29837] transition-colors shadow-sm">
            Sort by Time
          </button>
        </div>
      </header>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="p-8 flex items-start gap-6 overflow-x-auto pb-12"
      >
        {/* Urgent Order */}
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="min-w-[320px] bg-[#fdf3f3] border-t-4 border-[#e54b4b] rounded-2xl p-5 shadow-sm relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="inline-block bg-[#e54b4b] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2">
                Urgent
              </span>
              <h3 className="text-xl font-bold font-jakarta text-feast-dark leading-tight">#4092</h3>
              <p className="text-xs text-feast-dark-muted mt-1">Table 12 · Dine In</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#e54b4b]">14:22</span>
              <p className="text-[10px] text-feast-dark-muted uppercase tracking-wider">Elapsed</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <OrderItem count="2x" name="Saffron Risotto" note="No dairy, extra saffron" checked={false} bg="bg-white" />
            <OrderItem count="1x" name="Truffle Pasta" checked={false} bg="bg-white" />
          </div>
          
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 bg-[#e5774b] text-white font-semibold font-vietnam text-sm rounded-xl hover:bg-[#d4653a] transition-colors">
            Bump Order
          </motion.button>
        </motion.div>

        {/* Preparing Order */}
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="min-w-[320px] bg-white border-t-4 border-feast-amber rounded-2xl p-5 shadow-sm relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="inline-block bg-feast-amber/20 text-feast-amber text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2">
                Preparing
              </span>
              <h3 className="text-xl font-bold font-jakarta text-feast-dark leading-tight">#4095</h3>
              <p className="text-xs text-feast-dark-muted mt-1">Pickup · UberEats</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-feast-dark">08:15</span>
              <p className="text-[10px] text-feast-dark-muted uppercase tracking-wider">Elapsed</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <OrderItem count="1x" name="Lamb Shank" checked={true} strikethrough={true} bg="bg-feast-surface-lowest" />
            <OrderItem count="1x" name="Mint Sauce Side" checked={false} bg="bg-feast-surface-lowest" />
          </div>
          
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 bg-feast-surface-low text-feast-dark font-semibold font-vietnam text-sm rounded-xl hover:bg-gray-200 transition-colors">
            Mark Complete
          </motion.button>
        </motion.div>

        {/* New Order 1 */}
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="min-w-[320px] bg-white rounded-2xl p-5 shadow-sm border border-feast-bg relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="inline-block bg-feast-surface-low text-feast-dark-muted text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2">
                New
              </span>
              <h3 className="text-xl font-bold font-jakarta text-feast-dark leading-tight">#4098</h3>
              <p className="text-xs text-feast-dark-muted mt-1">Table 4 · Dine In</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-feast-dark">01:12</span>
              <p className="text-[10px] text-feast-dark-muted uppercase tracking-wider">Elapsed</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <OrderItem count="3x" name="Wagyu Sliders" note="Allergy: Peanuts" noteColor="bg-[#fdf3f3] text-[#e54b4b]" checked={false} bg="bg-feast-surface-lowest" hideCheckbox={true} rightLabel="x3" />
          </div>
          
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 bg-[#806b1b] text-white font-semibold font-vietnam text-sm rounded-xl hover:bg-[#6e5a14] transition-colors mt-[72px]">
            Start Prep
          </motion.button>
        </motion.div>

        {/* New Order 2 */}
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="min-w-[320px] bg-white rounded-2xl p-5 shadow-sm border border-feast-bg relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="inline-block bg-feast-surface-low text-feast-dark-muted text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2">
                New
              </span>
              <h3 className="text-xl font-bold font-jakarta text-feast-dark leading-tight">#4099</h3>
              <p className="text-xs text-feast-dark-muted mt-1">Table 22 · Dine In</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-feast-dark">00:45</span>
              <p className="text-[10px] text-feast-dark-muted uppercase tracking-wider">Elapsed</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <OrderItem count="1x" name="Caesar Salad" checked={false} bg="bg-feast-surface-lowest" hideCheckbox={true} />
            <OrderItem count="1x" name="Garlic Bread" checked={false} bg="bg-feast-surface-lowest" hideCheckbox={true} />
          </div>
          
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 bg-[#806b1b] text-white font-semibold font-vietnam text-sm rounded-xl hover:bg-[#6e5a14] transition-colors">
            Start Prep
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
};

const OrderItem = ({ count, name, note, noteColor = "bg-[#fff7e6] text-feast-amber", checked, strikethrough, bg, hideCheckbox, rightLabel }) => (
  <div className={`${bg} rounded-xl p-3 flex items-start justify-between border border-feast-bg`}>
    <div className="flex gap-3 items-start">
      <span className={`text-sm font-bold ${strikethrough ? 'text-feast-dark-muted line-through' : 'text-feast-dark'}`}>
        {count}
      </span>
      <div>
        <h4 className={`text-sm font-semibold leading-tight ${strikethrough ? 'text-feast-dark-muted line-through' : 'text-feast-dark'}`}>
          {name}
        </h4>
        {note && (
          <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${noteColor}`}>
            {note}
          </span>
        )}
      </div>
    </div>
    {hideCheckbox ? (
      rightLabel && <span className="text-xs font-bold text-feast-dark-muted">{rightLabel}</span>
    ) : (
      checked ? (
        <CheckSquare size={16} className="text-feast-sunset mt-0.5 flex-shrink-0" />
      ) : (
        <Square size={16} className="text-feast-dark-muted mt-0.5 flex-shrink-0" />
      )
    )}
  </div>
);

export default KitchenPage;
