import React, { useEffect, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children, title }) => {
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
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "relative w-full max-w-xs bg-white h-full transition-transform duration-300 transform ease-out shadow-xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-surface-container">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-container rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
