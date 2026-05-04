import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { OrderStatus } from '../../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const configs: Record<OrderStatus, { label: string; classes: string }> = {
    received:  { label: 'Received',  classes: 'bg-amber-100 text-amber-700' },
    preparing: { label: 'Preparing', classes: 'bg-blue-100 text-blue-700' },
    ready:     { label: 'Ready',     classes: 'bg-green-100 text-green-700' },
    served:    { label: 'Completed', classes: 'bg-gray-100 text-gray-600' },
    cancelled: { label: 'Cancelled', classes: 'bg-red-100 text-red-700' },
  };

  const config = configs[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
