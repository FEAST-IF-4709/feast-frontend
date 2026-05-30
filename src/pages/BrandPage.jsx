import React from 'react';
import LandingLayout from '../components/LandingLayout';
import { motion } from 'framer-motion';
import brandHeroImg from '../assets/Dynamic food plating.jpg';

const BrandPage = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <LandingLayout>
      {/* ============================================= */}
      {/* HERO SECTION — VISUAL IDENTITY */}
      {/* ============================================= */}
      <section id="brand-hero" className="bg-feast-bg">
        <div className="bg-white min-h-screen pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
              {/* Left — Text */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-xl">
                <p className="text-[#a87430] font-bold text-[10px] uppercase tracking-[0.15em] font-vietnam mb-4">
                  VISUAL IDENTITY
                </p>
                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold font-jakarta text-[#a0360a] leading-[1.05] mb-6">
                  The Kinetic<br />Kitchen.
                </h1>
                <p className="text-feast-dark-muted font-vietnam text-base lg:text-lg leading-relaxed">
                  Our aesthetic captures the heat, movement, and vibrancy of a professional kitchen, maintaining the sophisticated clarity of a luxury food magazine.
                </p>
              </motion.div>

              {/* Right — Hero Image with Stack Effect */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative group">
                {/* Background card / shadow block */}
                <div className="absolute inset-0 bg-white rounded-2xl shadow-xl transform rotate-3 translate-x-4 translate-y-4 transition-transform duration-700 group-hover:rotate-6 group-hover:translate-x-6 group-hover:translate-y-6" />
                {/* Main image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl transform -rotate-2 transition-transform duration-700 group-hover:-rotate-1 z-10">
                  <img
                    src={brandHeroImg}
                    alt="Brand Identity"
                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SENSORY DEPTH PALETTE */}
      {/* ============================================= */}
      <section id="color-palette" className="bg-feast-surface-lowest">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-jakarta text-feast-dark mb-4">
              Sensory Depth Palette
            </h2>
            <p className="text-feast-dark-muted font-vietnam text-base max-w-2xl">
              Colors designed to stimulate the appetite and evoke warmth, utilizing a sophisticated Material Design tonal hierarchy.
            </p>
          </motion.div>

          {/* Color Swatches */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sunset Core */}
            <div className="bg-feast-surface-low rounded-3xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="w-full h-36 rounded-2xl mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #C4501A 0%, #D4622E 50%, #E88B5A 100%)' }}>
                <span className="absolute bottom-4 left-5 text-white font-jakarta font-semibold text-sm">Sunset Core</span>
              </div>
              <h3 className="font-bold font-jakarta text-feast-dark mb-2">Primary / Container</h3>
              <p className="text-feast-dark-muted font-vietnam text-sm leading-relaxed mb-4">
                Used to draw the eye to high-value actions and brand moments. Represents heat and passion.
              </p>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-feast-sunset-dark" title="#A3400F" />
                <div className="w-8 h-8 rounded-full bg-feast-sunset" title="#C4501A" />
              </div>
            </div>

            {/* Warm Amber */}
            <div className="bg-feast-surface-low rounded-3xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="w-full h-36 rounded-2xl mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #B8922F 0%, #D4A843 50%, #E0BE6A 100%)' }}>
                <span className="absolute bottom-4 left-5 text-white font-jakarta font-semibold text-sm">Warm Amber</span>
              </div>
              <h3 className="font-bold font-jakarta text-feast-dark mb-2">Secondary / Container</h3>
              <p className="text-feast-dark-muted font-vietnam text-sm leading-relaxed mb-4">
                Provides a welcoming glow. Highlights secondary information like tags or categories.
              </p>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-[#3D3520]" title="Dark Amber" />
                <div className="w-8 h-8 rounded-full bg-feast-amber" title="#D4A843" />
              </div>
            </div>

            {/* Beetroot */}
            <div className="bg-feast-surface-low rounded-3xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="w-full h-36 rounded-2xl mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7A4582 0%, #9B5BA5 50%, #C78DD0 100%)' }}>
                <span className="absolute bottom-4 left-5 text-white font-jakarta font-semibold text-sm">Beetroot</span>
              </div>
              <h3 className="font-bold font-jakarta text-feast-dark mb-2">Tertiary / Accent</h3>
              <p className="text-feast-dark-muted font-vietnam text-sm leading-relaxed mb-4">
                A deep plum used sparingly for curated or premium features to add unexpected depth.
              </p>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-feast-beetroot" title="#9B5BA5" />
                <div className="w-8 h-8 rounded-full bg-feast-beetroot-light" title="#C78DD0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* EDITORIAL AUTHORITY — TYPOGRAPHY */}
      {/* ============================================= */}
      <section id="typography" className="bg-feast-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left — Typography */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold font-jakarta text-feast-dark mb-12">
                Editorial Authority
              </h2>

              <div className="space-y-10">
                {/* Plus Jakarta Sans */}
                <div>
                  <h3 className="text-4xl lg:text-5xl font-bold font-jakarta text-feast-dark italic mb-2">
                    Plus Jakarta Sans
                  </h3>
                  <p className="text-feast-dark-muted font-vietnam text-xs uppercase tracking-[0.2em]">
                    Display & Headlines
                  </p>
                </div>

                {/* Be Vietnam Pro */}
                <div>
                  <h3 className="text-2xl lg:text-3xl font-medium font-vietnam text-feast-dark mb-2">
                    Be Vietnam Pro
                  </h3>
                  <p className="text-feast-dark-muted font-vietnam text-xs uppercase tracking-[0.2em]">
                    Body Copy & Labels
                  </p>
                </div>
              </div>
            </div>

            {/* Right — The No-Line Rule */}
            <div>
              <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm">
                <h3 className="text-xl font-bold font-jakarta text-feast-dark mb-4">
                  The "No-Line" Rule
                </h3>
                <p className="text-feast-dark-muted font-vietnam text-sm leading-relaxed mb-8">
                  We do not use 1px solid borders. Structure is defined through tonal shifts and intentional negative space, creating a physical layering effect.
                </p>

                {/* Layered Backgrounds Demo */}
                <div className="space-y-4">
                  <div className="bg-feast-bg rounded-xl px-6 py-4">
                    <span className="text-feast-dark-secondary font-vietnam text-sm">
                      Background <span className="text-feast-dark-muted">(#f6f6f6)</span>
                    </span>
                  </div>
                  <div className="bg-feast-surface-low rounded-xl px-6 py-4">
                    <span className="text-feast-dark-secondary font-vietnam text-sm">
                      Surface Container Low
                    </span>
                  </div>
                  <div className="bg-feast-surface-lowest rounded-xl px-6 py-4 relative">
                    <span className="text-feast-sunset font-vietnam text-sm font-medium">
                      Surface Container Lowest (Hero)
                    </span>
                    {/* Warm glow */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-feast-amber/20 rounded-full blur-xl -translate-y-2 translate-x-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default BrandPage;
