import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import CustomerLayout from '../../components/customer/CustomerLayout';
import CategoryPills from '../../components/customer/CategoryPills';
import DishCard from '../../components/customer/DishCard';
import { MenuCardSkeleton } from '../../components/ui/Skeleton';
import { useAppContext } from '../../context/AppContext';
import { fetchRestaurantBySlug, fetchCategories, fetchMenuItems } from '../../services/db';
import type { Category, MenuItem } from '../../types';
import { formatPrice } from '../../utils/formatters';

const ALL_ID = 'cat-all';

const MenuHome: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { restaurant, setRestaurant, cart } = useAppContext();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState(ALL_ID);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const rest = await fetchRestaurantBySlug(slug);
        if (!rest) { setError('Restaurant not found.'); setLoading(false); return; }
        if (!cancelled) setRestaurant(rest);

        const [cats, items] = await Promise.all([
          fetchCategories(rest.id),
          fetchMenuItems(rest.id, true),
        ]);

        if (!cancelled) {
          setCategories(cats);
          setMenuItems(items);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load menu');
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="px-6 pt-10 pb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E8E8E4] animate-pulse" />
            <div className="h-8 w-40 bg-[#E8E8E4] animate-pulse rounded-lg" />
          </div>
          <div className="h-6 w-full bg-[#E8E8E4] animate-pulse rounded-lg" />
        </header>
        <div className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <MenuCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6 opacity-20" />
        <h2 className="text-xl font-headline font-bold text-[#191C19] mb-2">Something went wrong</h2>
        <p className="text-[#707971] text-sm mb-8">We couldn't load the menu. Please try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all"
        >
          <RefreshCw size={18} /> Try Again
        </button>
      </div>
    );
  }

  const allCategories = [{ id: ALL_ID, name: 'All', restaurant_id: '', sort_order: -1 }, ...categories];

  const filtered = activeCategoryId === ALL_ID
    ? menuItems
    : menuItems.filter(i => i.category_id === activeCategoryId);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CustomerLayout>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-container">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-headline font-bold text-primary">
              {restaurant?.name ?? slug}
            </h1>
            <p className="text-[10px] font-bold text-[#707971] uppercase tracking-[0.2em]">Digital Menu</p>
          </div>
          {restaurant?.logo_url && (
            <img src={restaurant.logo_url} alt={restaurant.name} className="w-10 h-10 rounded-full object-cover" />
          )}
        </div>

        {/* Category pills */}
        {!error && (
          <CategoryPills
            categories={allCategories}
            activeCategoryId={activeCategoryId}
            onSelect={setActiveCategoryId}
          />
        )}
      </header>

      {/* Content */}
      <main className="px-4 pt-4 pb-36">
        {error && (
          <div className="mt-20 text-center">
            <p className="text-red-500 font-bold">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-primary text-sm underline">
              Try again
            </button>
          </div>
        )}



        {!loading && !error && filtered.length === 0 && (
          <div className="mt-20 text-center text-[#707971]">
            <p className="font-bold">No dishes in this category</p>
            <button onClick={() => setActiveCategoryId(ALL_ID)} className="mt-2 text-primary text-sm underline">
              View all
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map(dish => <DishCard key={dish.id} dish={dish} />)}
          </div>
        )}
      </main>

      {/* Floating order bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-30">
          <div className="bg-primary text-white px-5 py-3 rounded-2xl flex items-center justify-between shadow-xl shadow-primary/30">
            <span className="text-sm font-bold">{cartCount} item{cartCount > 1 ? 's' : ''}</span>
            <span className="text-sm font-bold">{formatPrice(cartTotal)}</span>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default MenuHome;
