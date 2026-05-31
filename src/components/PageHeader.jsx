import React from 'react';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="flex items-center justify-between px-8 py-5 bg-white sticky top-0 z-40 border-b border-feast-bg">
      <div>
        {subtitle && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-feast-dark-muted font-vietnam mb-1">
            {subtitle}
          </p>
        )}
        <h2 className="text-2xl font-bold font-jakarta text-feast-dark">{title}</h2>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}
