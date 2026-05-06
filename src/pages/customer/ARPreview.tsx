import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { fetchMenuItemById } from '../../services/db';
import type { MenuItem } from '../../types';
import CustomerLayout from '../../components/customer/CustomerLayout';
import ARViewer from '../../components/customer/ARViewer';
import { ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

const ARPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useAppContext();
  
  const [dish, setDish] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchMenuItemById(id).then(data => {
      setDish(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white w-8 h-8" />
      </div>
    );
  }

  if (!dish) return <div className="h-screen bg-black text-white flex items-center justify-center">Dish not found</div>;

  const handleAddToCart = () => {
    addToCart({ ...dish, quantity: 1 });
    console.error(`Added ${dish.name} to order!`);
  };

  return (
    <CustomerLayout>
      <div className="relative h-screen w-full overflow-hidden bg-black">
        {/* AR View Stub */}
        <div className="absolute inset-0 z-0">
          <ARViewer 
            modelUrl={dish.model_url ?? undefined} 
            dishName={dish.name}
            imageUrl={dish.photo_url ?? undefined}
          />
        </div>

        {/* HUD Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none p-5">
          {/* Top Controls */}
          <div className="flex justify-between items-start pt-2">
            <button 
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg pointer-events-auto active:scale-95 transition-transform"
            >
              <ArrowLeft className="text-[#191C19]" size={24} />
            </button>
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white shadow-sm pointer-events-auto">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-headline text-[10px] font-bold uppercase tracking-widest text-[#191C19]">AR LIVE</span>
            </div>
          </div>

          {/* Center Instruction */}
          <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <p className="text-white text-[12px] font-medium tracking-wide whitespace-nowrap">Tap the table surface to place dish</p>
            </div>
          </div>
        </div>

        {/* Bottom Interaction Sheet */}
        <div className="fixed bottom-20 left-0 w-full z-30 pointer-events-none px-5 pb-8">
          <div className="bg-white rounded-2xl p-6 pointer-events-auto shadow-2xl border border-surface-container">
            <div className="w-8 h-1 bg-surface-container rounded-full mx-auto mb-6" />
            
            <div className="flex justify-between items-start mb-1">
              <h2 className="text-xl font-headline font-bold text-[#191C19]">{dish.name}</h2>
              <span className="text-lg font-bold text-primary">{formatPrice(dish.price)}</span>
            </div>
            <p className="text-[#707971] text-sm mb-6">{dish.description.substring(0, 60)}...</p>

            <div className="flex flex-col gap-3 mb-4">
              <button 
                onClick={() => {
                  const viewer = document.querySelector('model-viewer') as any;
                  if (viewer && viewer.activateAR) {
                    viewer.activateAR();
                  }
                }}
                className="w-full h-14 bg-[#D4A843] text-white rounded-xl font-bold active:scale-95 transition-transform shadow-md"
              >
                Place on Table
              </button>
              <button 
                onClick={handleAddToCart}
                className="w-full h-14 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
              >
                <ShoppingCart size={20} />
                Add to Order
              </button>
            </div>

            {/* Gesture Hints */}
            <div className="flex justify-center items-center gap-6 text-[#707971]/60 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <span>Pinch to scale</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-surface-container" />
              <div className="flex items-center gap-1.5">
                <span>Drag to rotate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ARPreview;
