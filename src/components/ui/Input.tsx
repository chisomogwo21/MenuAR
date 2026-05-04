import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ className, label, id, ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-[#191C19] uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all",
          className
        )}
        {...props}
      />
    </div>
  );
};

export default Input;
