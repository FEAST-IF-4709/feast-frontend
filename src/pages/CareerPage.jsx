import React from 'react';
import LandingLayout from '../components/LandingLayout';
import { motion } from 'framer-motion';
import { Code2, Sparkles, FlaskConical, Users, ArrowRight, MapPin, Clock } from 'lucide-react';
import heroImg from '../assets/Culinary team in action.jpg';
import innovationLabImg from '../assets/Professional kitchen in motion.jpg';

const CareerPage = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const jobCategories = [
    {
      icon: <Code2 size={22} />,
      category: 'Tech & Engineering',
      jobs: [
        {
          title: 'Senior Full Stack Developer',
          tags: ['REMOTE / NY', 'FULL-TIME'],
        },
        {
          title: 'UX/UI Designer',
          tags: ['NEW YORK', 'FULL-TIME'],
        },
        {
          title: 'DevOps Engineer',
          tags: ['REMOTE', 'FULL-TIME'],
        },
      ],
    },
    {
      icon: <Users size={22} />,
      category: 'Operations & Culinary',
      jobs: [
        {
          title: 'Culinary Operations Manager',
          tags: ['NEW YORK', 'FULL-TIME'],
        },
        {
          title: 'Supply Chain Analyst',
          tags: ['REMOTE / NY', 'CONTRACT'],
        },
      ],
    },
  ];

  return (
    <LandingLayout>
      {/* ============================================= */}
      {/* HERO BANNER — FULL WIDTH DARK OVERLAY */}
      {/* ============================================= */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-feast-dark overflow-hidden">
        <div className="absolute inset-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={heroImg} 
            alt="Culinary team" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-feast-bg via-feast-dark/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-feast-sunset font-semibold text-sm uppercase tracking-[0.2em] font-vietnam mb-4">
            Join the Kitchen
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl md:text-6xl font-bold font-jakarta text-white mb-6">
            Fuel Your Culinary Career
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg text-white/80 font-vietnam max-w-2xl mx-auto mb-8">
            We are always looking for passionate individuals who thrive in a fast-paced, kinetic environment. 
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <a
              href="#openings"
              className="inline-flex items-center px-8 py-3.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-full hover:bg-feast-sunset-dark transition-all duration-300 hover:shadow-xl hover:shadow-feast-sunset/30 hover:-translate-y-0.5"
            >
              View Open Roles
            </a>
          </motion.div>
        </div>
      </section>

      {/* ============================================= */}
      {/* WHY COOK WITH US? */}
      {/* ============================================= */}
      <section className="py-20 lg:py-28 bg-feast-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold font-jakarta text-feast-dark mb-4">Why Work With Us?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Dynamic Environment', desc: 'No two days are the same. Experience the rush of a truly kinetic kitchen.' },
              { title: 'Growth Opportunities', desc: 'We invest in our people with continuous training and clear paths for advancement.' },
              { title: 'Competitive Benefits', desc: 'Enjoy top-tier health coverage, paid time off, and exclusive dining perks.' }
            ].map((benefit, i) => (
              <motion.div 
                key={i} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } } }}
                className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-feast-sunset/10 rounded-xl flex items-center justify-center mb-6">
                  <div className="w-4 h-4 bg-feast-sunset rounded-full" />
                </div>
                <h3 className="text-xl font-bold font-jakarta text-feast-dark mb-3">{benefit.title}</h3>
                <p className="text-feast-dark-muted font-vietnam leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* CURRENT OPENINGS */}
      {/* ============================================= */}
      <section id="openings" className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold font-jakarta text-feast-dark mb-3">
              Current Openings
            </h2>
            <p className="text-feast-dark-muted font-vietnam text-base">
              Find your station in the kinetic kitchen.
            </p>
          </div>

          <div className="space-y-8">
            {jobCategories.map((category, ci) => (
              <div key={ci} className="bg-feast-bg rounded-3xl p-6 lg:p-8">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-feast-surface-lowest rounded-xl flex items-center justify-center text-feast-sunset">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold font-jakarta text-feast-dark">
                    {category.category}
                  </h3>
                </div>

                {/* Job Listings */}
                <div className="space-y-4">
                  {category.jobs.map((job, ji) => (
                    <div
                      key={ji}
                      className="bg-white rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        <h4 className="text-base font-semibold font-jakarta text-feast-dark mb-2">
                          {job.title}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {job.tags.map((tag, ti) => (
                            <span
                              key={ti}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-feast-bg rounded-full text-xs font-medium text-feast-dark-muted font-vietnam"
                            >
                              {tag.includes('REMOTE') || tag.includes('NY') || tag.includes('NEW YORK') ? (
                                <MapPin size={10} />
                              ) : (
                                <Clock size={10} />
                              )}
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-feast-sunset text-feast-sunset text-sm font-semibold font-vietnam rounded-full hover:bg-feast-sunset hover:text-white transition-all duration-300 whitespace-nowrap group-hover:shadow-sm">
                        Apply Now
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default CareerPage;
