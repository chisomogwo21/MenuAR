import React, { useEffect, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children, title }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className={cn(
          "relative w-full max-w-sm bg-white rounded-t-2xl transition-transform duration-300 transform ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Drag Handle */}
        <div className="flex justify-center p-3">
          <div className="w-12 h-1.5 bg-surface-container rounded-full" />
        </div>

        {title && (
          <div className="px-5 py-2 border-b border-surface-container">
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
        )}

        <div className="px-5 pb-8 pt-2 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
