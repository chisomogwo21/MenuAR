import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { Menu, Camera, MessageCircle, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BottomNav: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lastViewedDishId, setIsAIAssistantOpen } = useAppContext();
  const location = useLocation();

  const navItems = [
    { 
      label: 'Menu', 
      icon: Menu, 
      path: `/${slug}/menu` 
    },
    { 
      label: 'AR View', 
      icon: Camera, 
      path: lastViewedDishId ? `/${slug}/ar/${lastViewedDishId}` : '#',
      onClick: (e: React.MouseEvent) => {
        if (!lastViewedDishId) {
          e.preventDefault();
          // In a real app we'd use a toast library here
          console.error("View a dish first to see it in AR!");
        }
      }
    },
    { 
      label: 'AI Chat', 
      icon: MessageCircle, 
      onClick: () => setIsAIAssistantOpen(true),
      path: '#'
    },
    { 
      label: 'Order', 
      icon: ShoppingBag, 
      path: `/${slug}/cart` 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-container pb-safe">
      <div className="max-w-sm mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={item.onClick}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-primary" : "text-[#707971]"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
