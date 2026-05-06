import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { fetchCategories, fetchMenuItems, updateMenuItem } from '../../services/db';
import { useAppContext } from '../../context/AppContext';
import { Plus, Pencil, Camera, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import DishDrawer from '../../components/admin/DishDrawer';
import type { MenuItem, Category } from '../../types';
import { formatPrice } from '../../utils/formatters';

const MenuManager: React.FC = () => {
  const { restaurant } = useAppContext();
  const [activeCategoryId, setActiveCategoryId] = useState('cat-all');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  const loadData = async () => {
    if (!restaurant) return;
    setLoading(true);
    try {
      const [cats, menuItems] = await Promise.all([
        fetchCategories(restaurant.id),
        fetchMenuItems(restaurant.id)
      ]);
      setCategories(cats);
      setItems(menuItems);
    } catch (error) {
      console.error('MenuManager: Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurant]);

  const openAddDrawer = () => {
    setSelectedDish(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (dish: MenuItem) => {
    setSelectedDish(dish);
    setIsDrawerOpen(true);
  };

  const allCategories = [{ id: 'cat-all', name: 'All', restaurant_id: restaurant?.id || '' }, ...categories];

  const filtered = activeCategoryId === 'cat-all'
    ? items
    : items.filter(i => i.category_id === activeCategoryId);

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, is_available: !currentStatus } : item
    ));

    const success = await updateMenuItem(id, { is_available: !currentStatus });
    
    // Revert if failed
    if (!success) {
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, is_available: currentStatus } : item
      ));
      console.error("Failed to update availability");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="md:ml-64 min-h-screen pb-24">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#FAFAF8]/80 backdrop-blur-md flex items-center justify-between px-6 h-16 border-b border-[#E8E8E4]">
          <h1 className="text-xl font-headline font-bold text-primary">Menu Manager</h1>
          <Button onClick={openAddDrawer} className="gap-2 h-10 px-4 text-sm font-bold shadow-sm">
            <Plus size={18} />
            Add new item
          </Button>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Category Filters */}
            <div className="px-6 py-5 overflow-x-auto flex items-center gap-3 border-b border-[#E8E8E4]">
              {allCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    activeCategoryId === cat.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container text-[#707971] border border-surface-container hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={item.photo_url ?? undefined}
                      alt={item.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!item.is_available ? 'grayscale opacity-70' : ''}`}
                    />
                    {/* AR Badge */}
                    {item.model_url && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                          <Camera size={10} />
                          3D model ✓
                        </span>
                      </div>
                    )}
                    {/* Sold Out Overlay */}
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                        <span className="bg-surface-container/90 text-[#707971] text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm uppercase tracking-wider">
                          Unavailable
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-base font-headline font-bold text-primary">{item.name}</h3>
                      <span className="text-base font-bold text-secondary">{formatPrice(item.price)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Availability Toggle */}
                      <button
                        onClick={() => toggleAvailability(item.id, item.is_available)}
                        className="flex items-center gap-2 group/toggle"
                      >
                        {item.is_available ? (
                          <ToggleRight size={28} className="text-primary" />
                        ) : (
                          <ToggleLeft size={28} className="text-[#707971]" />
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${item.is_available ? 'text-primary' : 'text-[#707971]'}`}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </button>

                      <button 
                        onClick={() => openEditDrawer(item)}
                        className="px-4 py-1.5 border border-primary text-primary rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-primary/5 transition-colors"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <DishDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        dish={selectedDish}
        onSuccess={loadData}
      />
    </div>
  );
};

export default MenuManager;
