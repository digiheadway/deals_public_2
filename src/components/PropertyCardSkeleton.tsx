export function PropertyCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-lg shadow-md p-3 sm:p-4 border-l-4 border-l-gray-300 border-t border-r border-b border-gray-200 relative">
      <div className="flex items-start gap-2 sm:gap-3 mb-1 sm:mb-0">
        <div className="flex-1 min-w-0">
          <div className="h-5 sm:h-6 bg-gray-200 rounded animate-shimmer mb-2 w-3/4"></div>
        </div>
        <div className="flex-shrink-0">
          <div className="h-6 sm:h-8 bg-gray-200 rounded animate-shimmer w-20 sm:w-24"></div>
        </div>
      </div>
      <div className="space-y-2 mb-2 sm:mb-3">
        <div className="h-3 sm:h-4 bg-gray-200 rounded animate-shimmer w-full"></div>
        <div className="h-3 sm:h-4 bg-gray-200 rounded animate-shimmer w-5/6"></div>
        <div className="h-3 sm:h-4 bg-gray-200 rounded animate-shimmer w-4/6"></div>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex flex-wrap gap-1">
          <div className="h-5 sm:h-6 bg-gray-200 rounded animate-shimmer w-16 sm:w-20"></div>
          <div className="h-5 sm:h-6 bg-gray-200 rounded animate-shimmer w-20 sm:w-24"></div>
          <div className="h-5 sm:h-6 bg-gray-200 rounded animate-shimmer w-18 sm:w-22"></div>
        </div>
      </div>
      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
        <div className="h-3 sm:h-4 bg-gray-200 rounded animate-shimmer w-16 sm:w-20"></div>
      </div>
    </div>
  );
}

