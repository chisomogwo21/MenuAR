import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Link, useParams } from 'react-router-dom';

const Header: React.FC = () => {
  const { restaurant, cart } = useAppContext();
  const { slug } = useParams<{ slug: string }>();
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="flex items-center justify-between px-5 py-4 bg-white sticky top-0 z-30 border-b border-surface-container">
      <div className="flex items-center gap-3">
        {restaurant?.logo_url && (
          <img 
            src={restaurant.logo_url} 
            alt={restaurant?.name} 
            className="w-10 h-10 rounded-full object-cover border border-surface-container"
          />
        )}
        <div className="flex flex-col">
          <h1 className="text-sm font-headline font-bold leading-tight">{restaurant?.name || 'Loading...'}</h1>
          <div className="bg-[#D4A843]/10 text-[#D4A843] text-[10px] font-bold px-2 py-0.5 rounded-full w-fit">
            TABLE 05
          </div>
        </div>
      </div>

      <Link to={`/${slug}/cart`} className="relative p-2 text-surface-dim hover:bg-surface-container rounded-full transition-colors">
        <ShoppingBag size={24} />
        {cartCount > 0 && (
          <span className="absolute top-1 right-1 bg-secondary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
            {cartCount}
          </span>
        )}
      </Link>
    </header>
  );
};

export default Header;
