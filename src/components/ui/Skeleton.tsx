import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-[#E8E8E4] rounded-xl ${className}`} />
);

export const MenuCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#F2F2F0]">
    <Skeleton className="w-full h-40 mb-4" />
    <Skeleton className="w-3/4 h-5 mb-2" />
    <Skeleton className="w-1/2 h-4 mb-4" />
    <div className="flex justify-between items-center">
      <Skeleton className="w-16 h-6" />
      <Skeleton className="w-10 h-10 rounded-full" />
    </div>
  </div>
);

export const DishDetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-background">
    <Skeleton className="w-full h-[45vh]" />
    <div className="px-6 py-10 space-y-6">
      <Skeleton className="w-3/4 h-8" />
      <Skeleton className="w-full h-20" />
      <div className="flex gap-4">
        <Skeleton className="w-24 h-10 rounded-full" />
        <Skeleton className="w-24 h-10 rounded-full" />
      </div>
    </div>
  </div>
);

export const AdminDashboardSkeleton: React.FC = () => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <Skeleton className="lg:col-span-3 h-[400px]" />
      <Skeleton className="lg:col-span-2 h-[400px]" />
    </div>
  </div>
);
