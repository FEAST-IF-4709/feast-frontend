import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import brandHeroImg from '../assets/Dynamic food plating.jpg';
import locationImg from '../assets/Epicurean District Location.jpg';

const RestaurantProfilePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

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
          <button className="px-5 py-2.5 bg-feast-surface-low text-feast-dark font-semibold text-sm rounded-xl hover:bg-gray-200 transition-colors">
            Discard
          </button>
          <button className="px-5 py-2.5 bg-feast-sunset text-white font-semibold text-sm rounded-xl hover:bg-feast-sunset-dark transition-colors shadow-sm">
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
                  defaultValue="The Kinetic Kitchen"
                  className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                  Short Description
                </label>
                <textarea
                  defaultValue="Modern fusion cuisine blending traditional techniques with bold, energetic flavors."
                  rows={3}
                  className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                    Cuisine Type
                  </label>
                  <div className="relative">
                    <select className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam appearance-none focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 cursor-pointer">
                      <option>Modern Fusion</option>
                      <option>Italian</option>
                      <option>Asian</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-feast-dark-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-feast-dark-muted mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    defaultValue="(555) 123-4567"
                    className="w-full bg-feast-surface-low rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/30"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Brand Imagery */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-jakarta text-feast-dark">Brand Imagery</h3>
              <button className="text-xs font-semibold text-feast-sunset hover:underline">
                Replace
              </button>
            </div>
            <div className="h-48 bg-feast-surface-low rounded-2xl overflow-hidden w-full relative group cursor-pointer">
              <img src={brandHeroImg} alt="Brand" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          </motion.section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Operations */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold font-jakarta text-feast-dark mb-5">Operations</h3>
            <div className="space-y-4">
              {/* Toggle Item */}
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
            <p className="text-xs text-feast-dark-muted leading-relaxed mb-4 pr-4">
              123 Culinary Lane, Epicurean District, Saffron City, 90210
            </p>
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
