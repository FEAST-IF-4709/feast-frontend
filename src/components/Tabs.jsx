import React from 'react';
import { motion } from 'framer-motion';

export default function Tabs({ tabs, activeKey, onChange }) {
  return (
    <div className="flex gap-1 border-b border-feast-bg">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative px-4 py-3 text-sm font-semibold font-vietnam transition-colors ${
              isActive ? 'text-feast-sunset' : 'text-feast-dark-muted hover:text-feast-dark'
            }`}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="tabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-feast-sunset rounded-full"
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
