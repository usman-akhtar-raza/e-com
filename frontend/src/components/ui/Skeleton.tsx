export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm p-4 space-y-4">
      <Skeleton className="w-full aspect-square rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}
