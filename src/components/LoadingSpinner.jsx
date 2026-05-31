import React from 'react';
import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 40,
};

export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const spinner = (
    <Loader2
      size={sizeMap[size]}
      className="animate-spin text-feast-sunset"
    />
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {spinner}
      </div>
    );
  }

  return spinner;
}
