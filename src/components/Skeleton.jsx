export function SkeletonBox({ className = '' }) {
  return (
    <div className={`bg-feast-bg animate-pulse rounded-xl ${className}`} />
  );
}

export function SkeletonText({ width = 'w-full' }) {
  return (
    <div className={`h-4 bg-feast-bg animate-pulse rounded ${width}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-3">
      <SkeletonText width="w-2/3" />
      <SkeletonText width="w-full" />
      <SkeletonText width="w-1/2" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonText width="w-1/3" />
        <SkeletonBox className="w-10 h-10" />
      </div>
      <SkeletonBox className="h-8 w-1/2" />
      <SkeletonText width="w-1/4" />
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
      <SkeletonBox className="w-12 h-12 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonText width="w-1/2" />
        <SkeletonText width="w-3/4" />
      </div>
      <SkeletonBox className="w-20 h-8 flex-shrink-0" />
    </div>
  );
}
