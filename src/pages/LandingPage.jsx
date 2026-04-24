import React from 'react';
import LandingLayout from '../components/LandingLayout';
import { Lightbulb, Handshake, Star, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import heroKitchenImg from '../assets/Professional kitchen in motion.jpg';
import missionImg from '../assets/Chef plating food.jpg';

const LandingPage = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <LandingLayout>
      {/* ============================================= */}
      {/* HERO SECTION */}
      {/* ============================================= */}
      <section id="hero" className="bg-feast-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <div>
              <p className="text-feast-sunset font-semibold text-sm uppercase tracking-[0.2em] font-vietnam mb-4">
                The Kinetic Kitchen
              </p>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold font-jakarta text-feast-dark leading-[1.05] mb-6">
                Uniting the<br />
                F&B Ecosystem.
              </h1>
              <p className="text-feast-dark-muted font-vietnam text-base lg:text-lg leading-relaxed max-w-lg mb-8">
                FEAST (Food Ecosystem Alliance & Smart) is more than a platform. It's a culinary movement powered by technology, connecting passionate tenants with eager diners in a seamless, vibrant experience.
              </p>
              <a
                href="#roots-vision"
                className="inline-flex items-center px-8 py-3.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-full hover:bg-feast-sunset-dark transition-all duration-300 hover:shadow-xl hover:shadow-feast-sunset/20 hover:-translate-y-0.5"
              >
                Join the Alliance
              </a>
            </div>

            {/* Right — Hero Image */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img src={heroKitchenImg} alt="Chef in kitchen" className="w-full aspect-[4/3] object-cover" />
              </div>
              {/* Decorative warm glow */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-feast-amber/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-feast-sunset/15 rounded-full blur-2xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================= */}
      {/* OUR ROOTS & VISION */}
      {/* ============================================= */}
      <section id="roots-vision" className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          {/* Section Header */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-jakarta text-feast-sunset mb-4">
              Our Roots & Vision
            </h2>
            <p className="text-feast-dark-muted font-vietnam text-base max-w-lg mx-auto">
              From a single idea to a thriving network of culinary innovators.
            </p>
          </motion.div>

          {/* Two Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Our Mission */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-feast-surface-lowest rounded-3xl p-8 lg:p-10 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
              <div className="relative z-10">
                <div className="text-feast-sunset mb-4">
                  <UtensilsCrossed size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold font-jakarta text-feast-sunset mb-4">
                  Our Mission
                </h3>
                <p className="text-feast-dark-secondary font-vietnam text-sm leading-relaxed">
                  To empower independent F&B businesses with enterprise-grade technology, creating a synergistic environment where quality food and seamless service intersect. We believe in elevating the dining experience through smart collaboration.
                </p>
              </div>
              {/* Subtle warm gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-feast-amber/10 to-transparent rounded-full translate-x-10 -translate-y-10" />
            </motion.div>

            {/* The Beginning */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { delay: 0.2 } } }} className="bg-feast-surface-lowest rounded-3xl overflow-hidden group hover:shadow-lg transition-shadow duration-300">
              <img src={missionImg} alt="Chef at work" className="w-full h-48 object-cover" />
              <div className="p-8 lg:p-10">
                <h3 className="text-xl lg:text-2xl font-bold font-jakarta text-feast-sunset mb-4">
                  The Beginning
                </h3>
                <p className="text-feast-dark-secondary font-vietnam text-sm leading-relaxed">
                  Founded in 2020 out of a necessity to support local eateries during challenging times, FEAST quickly evolved into a robust ecosystem.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* CORE INGREDIENTS */}
      {/* ============================================= */}
      <section id="core-ingredients" className="bg-feast-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          {/* Section Header */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-jakarta text-feast-sunset mb-4">
              Core Ingredients
            </h2>
          </motion.div>

          {/* Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Lightbulb size={28} />,
                iconColor: 'text-feast-sunset',
                iconBg: 'bg-feast-sunset/10',
                title: 'Innovation',
                description: 'Pushing the boundaries of food-tech to streamline operations and enhance the customer journey.',
                delay: 0.1
              },
              {
                icon: <Handshake size={28} />,
                iconColor: 'text-feast-amber',
                iconBg: 'bg-feast-amber/10',
                title: 'Synergy',
                description: 'Fostering collaboration among tenants, creating a diverse and interconnected culinary hub.',
                delay: 0.2
              },
              {
                icon: <Star size={28} />,
                iconColor: 'text-feast-beetroot',
                iconBg: 'bg-feast-beetroot/10',
                title: 'Quality',
                description: 'An uncompromising commitment to excellence in both the technology we build and the food our partners serve.',
                delay: 0.3
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: item.delay } } }}
                className="bg-feast-surface-lowest rounded-3xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`w-12 h-12 ${item.iconBg} rounded-2xl flex items-center justify-center mb-5 ${item.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold font-jakarta text-feast-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-feast-dark-muted font-vietnam text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default LandingPage;
