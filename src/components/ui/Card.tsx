import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-[#E8E8E4] overflow-hidden",
        className
      )}
      {...props}
    />
  );
};

export default Card;
