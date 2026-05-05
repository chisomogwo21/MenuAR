import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { fetchMenuItemById } from '../../services/db';
import type { MenuItem } from '../../types';
import CustomerLayout from '../../components/customer/CustomerLayout';
import { ArrowLeft, Camera, Flame, Leaf, Utensils, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { DishDetailSkeleton } from '../../components/ui/Skeleton';
import { formatPrice } from '../../utils/formatters';

const DishDetail: React.FC = () => {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const { addToCart, setLastViewedDishId } = useAppContext();
  
  const [dish, setDish] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await fetchMenuItemById(id);
        if (!cancelled) {
          setDish(data);
          if (!data) setError(true);
        }
      } catch (e) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (dish) {
      setLastViewedDishId(dish.id);
    }
  }, [dish, setLastViewedDishId]);

  if (loading) return <DishDetailSkeleton />;

  if (error || !dish) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6 opacity-20" />
        <h2 className="text-xl font-headline font-bold text-[#191C19] mb-2">Dish not found</h2>
        <p className="text-[#707971] text-sm mb-8">This dish may have been removed or is temporarily unavailable.</p>
        <button 
          onClick={() => window.history.back()}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!dish) return <CustomerLayout><div className="p-5 mt-10 text-center font-bold text-red-500">Dish not found</div></CustomerLayout>;

  const handleAddToCart = () => {
    addToCart({ ...dish, quantity: 1 });
    // In a real app we'd use a toast
    alert(`Added ${dish.name} to order!`);
  };

  return (
    <CustomerLayout>
      <div className="relative">
        {/* Hero Section */}
        <div className="relative w-full h-[45vh] overflow-hidden">
          <img 
            src={dish.image_url} 
            alt={dish.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-1/3" />
          
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-6 left-5 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-20"
          >
            <ArrowLeft className="text-primary" size={24} />
          </button>
        </div>

        {/* Content Sheet */}
        <main className="relative -mt-8 z-10">
          <div className="bg-white rounded-t-[32px] shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] min-h-[55vh] pb-32">
            {/* Drag Handle */}
            <div className="w-full flex justify-center py-4">
              <div className="w-12 h-1.5 bg-surface-container rounded-full" />
            </div>

            {/* Dish Info */}
            <div className="px-5 mt-2">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-headline font-bold text-[#191C19]">{dish.name}</h1>
                <span className="text-xl font-bold text-primary">{formatPrice(dish.price)}</span>
              </div>
              
              <p className="text-[#707971] leading-relaxed mb-6">
                {dish.description}
              </p>

              {/* Badges & Calories */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                {dish.allergens && dish.allergens.length > 0 ? (
                  dish.allergens.map((allergen) => (
                    <Badge key={allergen} className="bg-red-50 text-red-600 border border-red-100">
                      {allergen}
                    </Badge>
                  ))
                ) : (
                  <Badge className="bg-green-50 text-green-600 border border-green-100">
                    Allergen-free
                  </Badge>
                )}
                
                {dish.calories && (
                  <div className="ml-auto flex items-center text-[#707971] gap-1">
                    <Flame size={14} className="text-secondary" />
                    <span className="text-xs font-medium">{dish.calories} kcal</span>
                  </div>
                )}
              </div>

              <hr className="border-t border-surface-container mb-8" />

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                {dish.model_url && (
                  <Button 
                    variant="gold" 
                    className="h-14 w-full gap-2 text-lg shadow-sm"
                    onClick={() => navigate(`/${slug}/ar/${dish.id}`)}
                  >
                    <Camera size={20} />
                    Preview in AR
                  </Button>
                )}
                
                <Button 
                  onClick={handleAddToCart}
                  className="h-14 w-full text-lg shadow-md"
                >
                  Add to Order
                </Button>
              </div>

              {/* Chef's Notes */}
              <section className="mt-12">
                <h3 className="text-lg font-headline font-bold text-[#191C19] mb-4">Chef's Notes</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-background rounded-2xl border border-surface-container">
                    <Leaf size={20} className="text-secondary mb-2" />
                    <span className="text-[10px] font-bold text-[#707971] uppercase tracking-wider block mb-1">Source</span>
                    <span className="text-sm font-bold text-[#191C19]">Grass-fed Angus</span>
                  </div>
                  <div className="p-4 bg-background rounded-2xl border border-surface-container">
                    <Utensils size={20} className="text-secondary mb-2" />
                    <span className="text-[10px] font-bold text-[#707971] uppercase tracking-wider block mb-1">Grill</span>
                    <span className="text-sm font-bold text-[#191C19]">Oak Wood Fired</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </CustomerLayout>
  );
};

export default DishDetail;
