import React, { useState, useEffect } from 'react';
import { Camera, Loader2, Trash2, Upload, Sparkles, Check, ChevronDown } from 'lucide-react';
import Drawer from '../ui/Drawer';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { uploadFile } from '../../services/storage';
import { insertMenuItem, updateMenuItem, deleteMenuItem, fetchCategories } from '../../services/db';
import type { MenuItem, Category } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useImageTo3D } from '../../hooks/useImageTo3D';

interface DishDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dish: MenuItem | null;
  onSuccess: () => void;
}

const ALLERGENS = ['Dairy', 'Gluten', 'Nuts', 'Shellfish', 'Eggs', 'Soy', 'Vegan', 'Vegetarian'];

const DishDrawer: React.FC<DishDrawerProps> = ({ isOpen, onClose, dish, onSuccess }) => {
  const { restaurant } = useAppContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const { 
    generateModel, 
    generating, 
    progress: generationProgress, 
    status: generationStatus 
  } = useImageTo3D();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    calories: 0,
    allergens: [] as string[],
    is_available: true,
    photo_url: '',
    model_url: ''
  });

  useEffect(() => {
    if (restaurant) {
      fetchCategories(restaurant.id).then(setCategories);
    }
  }, [restaurant]);

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category_id: dish.category_id,
        calories: dish.calories || 0,
        allergens: dish.allergens || [],
        is_available: dish.is_available,
        photo_url: dish.photo_url || '',
        model_url: dish.model_url || ''
      });
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category_id: '',
        calories: 0,
        allergens: [],
        is_available: true,
        photo_url: '',
        model_url: ''
      });
      setImageFile(null);
    }
  }, [dish, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurant) return;

    setImageFile(file);
    setUploading(true);
    
    try {
      const fileName = `${restaurant.id}/${Date.now()}-${file.name}`;
      const url = await uploadFile('dish-photos', fileName, file);
      setFormData(prev => ({ ...prev, photo_url: url }));
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate3D = async () => {
    if (!imageFile || !restaurant) {
      if (!imageFile && formData.photo_url) {
        alert("Please re-upload the photo to generate a 3D model with Tripo3D (requires original file).");
      }
      return;
    }

    try {
      const id = dish?.id || 'new-item';
      const modelUrl = await generateModel(imageFile, id);
      setFormData(prev => ({ ...prev, model_url: modelUrl }));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setLoading(true);
    try {
      const data = {
        ...formData,
        restaurant_id: restaurant.id,
        price: Number(formData.price),
        calories: Number(formData.calories)
      };

      if (dish) {
        await updateMenuItem(dish.id, data);
      } else {
        await insertMenuItem(data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      alert('Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!dish) return;
    if (window.confirm('Delete this dish? This cannot be undone.')) {
      setLoading(true);
      try {
        await deleteMenuItem(dish.id);
        onSuccess();
        onClose();
      } catch (error) {
        alert('Delete failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  return (
    <Drawer 
      isOpen={isOpen} 
      onClose={onClose} 
      title={dish ? 'Edit Dish' : 'Add New Dish'}
    >
      <form onSubmit={handleSave} className="space-y-6 pb-12">
        {/* Photo Section */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-primary uppercase tracking-widest">Dish Photo</label>
          <div className="relative group">
            {formData.photo_url ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-container border-2 border-dashed border-primary/20">
                <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <Camera className="text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-surface-container hover:border-primary/50 bg-surface-lowest transition-all cursor-pointer">
                {uploading ? (
                  <Loader2 className="animate-spin text-primary" />
                ) : (
                  <>
                    <Upload className="text-[#707971] mb-2" />
                    <span className="text-[10px] font-bold text-[#707971] uppercase tracking-widest">Upload Photo</span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </div>
        </div>

        {/* 3D Generation */}
        {formData.photo_url && (
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Tripo3D Model</span>
              </div>
              {formData.model_url && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                  <Check size={12} /> Ready
                </span>
              )}
            </div>

            {generating ? (
              <div className="space-y-3">
                <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="text-[10px] font-bold text-primary uppercase text-center">{generationStatus}</p>
              </div>
            ) : (
              <Button 
                type="button" 
                variant="secondary"
                className="w-full gap-2 border-primary text-primary hover:bg-primary/5"
                onClick={handleGenerate3D}
              >
                <Sparkles size={16} />
                {formData.model_url ? 'Regenerate with Tripo3D' : '✨ Generate 3D Model with Tripo3D'}
              </Button>
            )}
            
            <p className="mt-2 text-[9px] text-[#707971] text-center italic">
              Best results: clean background, centered dish, good lighting
            </p>
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <Input 
            label="Dish Name" 
            placeholder="e.g. Bison Burger" 
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#191C19] uppercase tracking-wider ml-1">Description</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl border border-surface-container bg-surface-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-none"
              placeholder="Tell customers about the taste, ingredients and history..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Price (RWF)" 
              type="number" 
              value={formData.price}
              onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              required
            />
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#191C19] uppercase tracking-wider ml-1">Category</label>
              <div className="relative">
                <select 
                  className="w-full h-12 pl-4 pr-10 rounded-xl border border-surface-container bg-surface-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                  value={formData.category_id}
                  onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#707971] pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Allergens */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-primary uppercase tracking-widest">Allergens & Dietary</label>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map(allergen => {
              const active = formData.allergens.includes(allergen);
              return (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => toggleAllergen(allergen)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    active 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-[#707971] border-surface-container hover:border-primary/30'
                  }`}
                >
                  {allergen}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced / Manual Model */}
        <details className="group border-t border-surface-container pt-4">
          <summary className="list-none flex items-center justify-between cursor-pointer text-[#707971] hover:text-primary transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest">Advanced Settings</span>
            <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
          </summary>
          <div className="mt-4 space-y-4">
            <Input 
              label="Calories" 
              type="number" 
              value={formData.calories}
              onChange={e => setFormData(prev => ({ ...prev, calories: Number(e.target.value) }))}
            />
            <Input 
              label="Manual GLB URL" 
              placeholder="https://..." 
              value={formData.model_url}
              onChange={e => setFormData(prev => ({ ...prev, model_url: e.target.value }))}
            />
            <div className="flex items-center justify-between p-3 bg-surface-container rounded-xl">
              <span className="text-[10px] font-bold text-[#191C19] uppercase tracking-widest">Availability</span>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_available: !prev.is_available }))}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-surface-lowest border border-[#E8E8E4]"
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                    formData.is_available ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-[#707971]'
                  }`} 
                />
              </button>
            </div>
          </div>
        </details>

        {/* Footer Actions */}
        <div className="pt-8 space-y-4">
          <Button 
            type="submit" 
            className="w-full h-14 font-bold text-lg shadow-lg"
            disabled={loading || uploading || generating}
          >
            {loading ? <Loader2 className="animate-spin" /> : (dish ? 'Save Changes' : 'Add Dish')}
          </Button>

          {dish && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="w-full py-3 flex items-center justify-center gap-2 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-50 rounded-xl transition-colors"
            >
              <Trash2 size={16} />
              Delete Dish
            </button>
          )}
        </div>
      </form>
    </Drawer>
  );
};

export default DishDrawer;
