import React from 'react';
import { InboxIcon } from 'lucide-react';

export default function EmptyState({ icon, title, description, action }) {
  const Icon = icon || InboxIcon;
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 bg-feast-surface-low rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-feast-dark-muted" />
      </div>
      {title && (
        <h3 className="font-jakarta text-lg font-bold text-feast-dark mb-2">{title}</h3>
      )}
      {description && (
        <p className="font-vietnam text-sm text-feast-dark-muted max-w-xs">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
