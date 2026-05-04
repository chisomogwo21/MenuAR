import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Tablet, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar: React.FC = () => {
  const { restaurant } = useAppContext();

  const navLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Menu Manager', icon: UtensilsCrossed, path: '/admin/menu' },
    { label: 'Tables & QRs', icon: Tablet, path: '/admin/tables' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <aside className="w-[240px] bg-[#191C19] text-white h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">M</span>
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">MenuAR</span>
        </div>

        <nav className="space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              className={({ isActive }) => cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-[#707971] hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <link.icon size={20} />
                <span className="text-sm font-medium">{link.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-white/10">
        {restaurant && (
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer mb-2">
            {restaurant.logo_url && (
              <img 
                src={restaurant.logo_url} 
                alt={restaurant.name} 
                className="w-10 h-10 rounded-full object-cover border border-white/20"
              />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate">{restaurant.name}</span>
              <span className="text-[10px] text-[#707971] uppercase font-bold tracking-wider">Administrator</span>
            </div>
          </div>
        )}
        
        <button 
          onClick={async () => {
            const { supabase } = await import('../../lib/supabase');
            await supabase.auth.signOut();
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 mt-2 text-[#BA1A1A] hover:bg-[#BA1A1A]/10 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
