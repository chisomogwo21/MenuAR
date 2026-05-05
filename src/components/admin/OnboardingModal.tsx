import React, { useState } from 'react';
import { ArrowRight, Building2, LayoutGrid, Utensils, QrCode, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { updateRestaurant, insertMenuItem, insertTable } from '../../services/db';
import { supabase } from '../../lib/supabase';
import type { Restaurant } from '../../types';

interface OnboardingModalProps {
  restaurant: Restaurant;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ restaurant, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Branding
  const [name, setName] = useState(restaurant.name);
  const [logoUrl, setLogoUrl] = useState(restaurant.logo_url || '');

  // Step 2: Category
  const [categoryName, setCategoryName] = useState('Main Course');

  // Step 3: Menu Item
  const [itemName, setItemName] = useState('Signature Dish');
  const [itemPrice, setItemPrice] = useState('19.99');

  // Step 4: Table
  const [tableNumber, setTableNumber] = useState('01');

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        await updateRestaurant(restaurant.id, { name, logo_url: logoUrl });
      } else if (step === 2) {
        // We'll create category & item in step 3
      } else if (step === 3) {
        // Create category first
        const { data: cat } = await supabase
          .from('categories')
          .insert({ restaurant_id: restaurant.id, name: categoryName, sort_order: 1 })
          .select()
          .single();
        
        if (cat) {
          await insertMenuItem({
            restaurant_id: restaurant.id,
            category_id: cat.id,
            name: itemName,
            description: 'Our first delicious menu item.',
            price: parseFloat(itemPrice),
            photo_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
            model_url: null,
            calories: null,
            allergens: [],
            is_available: true
          });
        }
      } else if (step === 4) {
        await insertTable({
          restaurant_id: restaurant.id,
          table_number: tableNumber,
          qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${window.location.origin}/${restaurant.slug}/menu?table=${tableNumber}`
        });
      }
      
      if (step < 4) {
        setStep(step + 1);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Onboarding Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
      <div className="absolute inset-0 bg-[#191C19]/80 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-[#E8E8E4] flex">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`flex-1 h-full transition-all duration-500 ${s <= step ? 'bg-primary' : ''}`} 
            />
          ))}
        </div>

        <div className="p-8 sm:p-10 text-center">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="text-primary w-8 h-8" />
              </div>
              <h2 className="text-2xl font-headline font-bold text-[#191C19]">Welcome to MenuAR!</h2>
              <p className="text-[#707971] text-sm">Let's set up your restaurant branding first.</p>
              
              <div className="space-y-4 text-left pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Restaurant Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Logo URL (Optional)</label>
                  <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <LayoutGrid className="text-primary w-8 h-8" />
              </div>
              <h2 className="text-2xl font-headline font-bold text-[#191C19]">Create a Category</h2>
              <p className="text-[#707971] text-sm">Categories help diners browse your menu (e.g., Starters, Mains).</p>
              
              <div className="space-y-4 text-left pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Category Name</label>
                  <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="w-full bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Utensils className="text-primary w-8 h-8" />
              </div>
              <h2 className="text-2xl font-headline font-bold text-[#191C19]">Your First Dish</h2>
              <p className="text-[#707971] text-sm">Add one signature dish to see your menu in action.</p>
              
              <div className="space-y-4 text-left pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Dish Name</label>
                  <input value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Price ($)</label>
                  <input type="number" step="0.01" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} className="w-full bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <QrCode className="text-primary w-8 h-8" />
              </div>
              <h2 className="text-2xl font-headline font-bold text-[#191C19]">Table & QR Setup</h2>
              <p className="text-[#707971] text-sm">We'll generate a QR code for your first table.</p>
              
              <div className="space-y-4 text-left pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Table Number/Name</label>
                  <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="w-full bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1" />
                </div>
                
                <div className="bg-surface-container/50 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-surface-container">
                    <QrCode size={24} className="text-[#707971]" />
                  </div>
                  <p className="text-[10px] text-[#707971] font-medium leading-relaxed">
                    A unique QR code will be generated for Table {tableNumber}. Scanning this will open your menu pre-selected for this table.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-[#E8E8E4]">
            <Button 
              onClick={handleNext} 
              disabled={loading}
              className="w-full justify-center h-14 text-base gap-2 rounded-2xl shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  {step === 4 ? 'Go to Dashboard' : 'Next Step'}
                  <ArrowRight size={20} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
