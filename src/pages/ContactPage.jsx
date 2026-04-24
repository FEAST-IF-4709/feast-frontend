import React, { useState } from 'react';
import LandingLayout from '../components/LandingLayout';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, ChevronDown } from 'lucide-react';
import contactDecoImg from '../assets/Kinetic Kitchen Action.jpg';
import officeImg from '../assets/Epicurean District Location.jpg';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    topic: 'General Inquiry',
    message: '',
  });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! (Connect to backend to actually send)');
  };

  return (
    <LandingLayout>
      {/* ============================================= */}
      {/* HERO SECTION */}
      {/* ============================================= */}
      <section id="contact-hero" className="bg-feast-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <h1 className="text-5xl lg:text-6xl font-bold font-jakarta text-feast-dark leading-[1.05] mb-6">
                Connect with the<br />
                <span className="text-feast-sunset">Kitchen</span>
              </h1>
              <p className="text-feast-dark-muted font-vietnam text-base lg:text-lg leading-relaxed max-w-lg">
                Whether you have a question about our culinary ecosystem, want to partner with us, or simply want to say hello, we're ready to plate up some answers.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="hidden lg:flex justify-end">
              <img src={contactDecoImg} alt="Culinary art" className="w-64 h-64 object-cover rounded-full shadow-xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* CONTACT FORM + HEADQUARTERS */}
      {/* ============================================= */}
      <section id="contact-form" className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left — Form (3 cols) */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-3">
              <div className="bg-feast-bg rounded-3xl p-8 lg:p-10 relative overflow-hidden">
                {/* Decorative warm glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-feast-amber/15 rounded-full blur-3xl -translate-y-8 translate-x-8" />

                <h2 className="text-2xl font-bold font-jakarta text-feast-dark mb-8 relative z-10">
                  Send a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  {/* Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-feast-dark-muted font-vietnam mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Julia"
                        className="w-full bg-feast-surface-low rounded-xl px-5 py-3.5 text-feast-dark font-vietnam text-sm placeholder-feast-dark-muted/50 focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-feast-dark-muted font-vietnam mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Child"
                        className="w-full bg-feast-surface-low rounded-xl px-5 py-3.5 text-feast-dark font-vietnam text-sm placeholder-feast-dark-muted/50 focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-feast-dark-muted font-vietnam mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="hello@feast.com"
                      className="w-full bg-feast-surface-low rounded-xl px-5 py-3.5 text-feast-dark font-vietnam text-sm placeholder-feast-dark-muted/50 focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all"
                      required
                    />
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-feast-dark-muted font-vietnam mb-2">
                      Topic
                    </label>
                    <div className="relative">
                      <select
                        name="topic"
                        value={formData.topic}
                        onChange={handleChange}
                        className="w-full bg-feast-surface-low rounded-xl px-5 py-3.5 text-feast-dark font-vietnam text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all cursor-pointer"
                      >
                        <option>General Inquiry</option>
                        <option>Partnership</option>
                        <option>Support</option>
                        <option>Career</option>
                        <option>Press & Media</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-feast-dark-muted pointer-events-none" />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-feast-dark-muted font-vietnam mb-2">
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help plate your ideas?"
                      rows={5}
                      className="w-full bg-feast-surface-low rounded-xl px-5 py-3.5 text-feast-dark font-vietnam text-sm placeholder-feast-dark-muted/50 focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all resize-none"
                      required
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-full hover:bg-feast-sunset-dark transition-all duration-300 hover:shadow-xl hover:shadow-feast-sunset/20"
                  >
                    Send Message
                    <Send size={16} />
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Right — Headquarters (2 cols) */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="lg:col-span-2 space-y-8">
              {/* HQ Card */}
              <div className="bg-feast-bg rounded-3xl p-8">
                <h2 className="text-2xl font-bold font-jakarta text-feast-dark mb-2">
                  Headquarters
                </h2>
                <p className="text-feast-sunset font-semibold text-sm uppercase tracking-[0.15em] font-vietnam mb-6">
                  The Epicurean District
                </p>
                <div className="text-feast-dark-secondary font-vietnam text-sm leading-relaxed mb-6">
                  100 Culinary Avenue, Suite 400<br />
                  Saffron Tower<br />
                  New York, NY 10011
                </div>

                {/* Divider — using tonal shift, no hard line */}
                <div className="w-12 h-1 bg-feast-sunset rounded-full mb-6" />

                <h3 className="text-lg font-bold font-jakarta text-feast-dark mb-4">
                  Connect
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-feast-surface-lowest rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail size={16} className="text-feast-sunset" />
                    </div>
                    <span className="text-feast-dark-secondary font-vietnam text-sm">concierge@feast.eco</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-feast-surface-lowest rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone size={16} className="text-feast-sunset" />
                    </div>
                    <span className="text-feast-dark-secondary font-vietnam text-sm">+1 (555) 867-5309</span>
                  </div>
                </div>
              </div>

              {/* Office Image */}
              <div className="rounded-3xl overflow-hidden relative group">
                <img src={officeImg} alt="FEAST headquarters" className="w-full aspect-[5/3.5] object-cover" />

                {/* View on Map overlay */}
                <div className="absolute bottom-4 left-4 bg-feast-dark/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-white text-xs font-vietnam">
                  <MapPin size={14} className="text-feast-sunset" />
                  View on Map
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default ContactPage;
