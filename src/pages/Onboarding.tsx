import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  Check, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Plus, 
  X, 
  Minus, 
  Printer, 
  FileArchive, 
  MessageCircle, 
  Sparkles
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { uploadFile } from '../services/storage';
import { fetchCategories, insertCategory, insertMenuItem, updateRestaurant, insertTables } from '../services/db';
import { useImageTo3D } from '../hooks/useImageTo3D';
import { generateTableQRsZip, generateTableQRsPDF } from '../utils/qrGenerator';
import type { MenuItem } from '../types';

// PDF and ZIP will be imported later when used
// import { jsPDF } from 'jspdf';
// import 'jspdf-autotable';
// import JSZip from 'jszip';
// import QRCode from 'qrcode';

const Onboarding: React.FC = () => {
  const { restaurant, setRestaurant, isAuthenticated, authLoading } = useAppContext();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 State: Profile
  const [profileData, setProfileData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    primary_color: '#1A5C3A'
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'loading' | 'available' | 'taken'>('idle');

  // Step 2 State: Categories
  const [newCategory, setNewCategory] = useState('');
  const [addedCategories, setAddedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const SUGGESTED_CATS = ['Starters', 'Mains', 'Grills', 'Desserts', 'Drinks', 'Pizza', 'Burgers', 'Salads', 'Specials'];

  // Step 3 State: First Dish
  const [dishData, setDishData] = useState({
    name: '',
    category_id: '',
    price: 0,
    description: '',
    calories: 0,
    allergens: [] as string[],
    is_available: true,
    image_url: '',
    ar_model_url: ''
  });
  const [dishFile, setDishFile] = useState<File | null>(null);
  const [uploadingDish, setUploadingDish] = useState(false);
  const [dishesAdded, setDishesAdded] = useState<MenuItem[]>([]);
  const { generateModel, generating, progress: genProgress, status: genStatus } = useImageTo3D();

  // Step 4 State: Tables
  const [tableCount, setTableCount] = useState(10);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [qrDone, setQrDone] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setProfileData({
        name: restaurant.name || '',
        slug: restaurant.slug || '',
        logo_url: restaurant.logo_url || '',
        primary_color: restaurant.primary_color || '#1A5C3A'
      });
      // Apply brand color to UI
      document.documentElement.style.setProperty('--color-primary', restaurant.primary_color || '#1A5C3A');
    }
  }, [restaurant]);

  useEffect(() => {
    if (!authLoading && !restaurant?.id) {
      console.error('No restaurant ID in context');
      navigate('/admin/login');
    }
  }, [restaurant?.id, authLoading, navigate]);

  useEffect(() => {
    if (step === 3 && restaurant?.id && categories.length === 0) {
      loadCategories();
    }
  }, [step, restaurant?.id]);

  const loadCategories = async () => {
    if (!restaurant?.id) return;
    const cats = await fetchCategories(restaurant.id);
    setCategories(cats);
    if (cats.length > 0 && !dishData.category_id) {
      setDishData(prev => ({ ...prev, category_id: cats[0].id }));
    }
  };

  // Auth Protection
  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  // --- Step 1 Handlers ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurant) return;
    
    setUploadingLogo(true);
    setLogoError(null);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}/logo-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('restaurant-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      const { data } = supabase.storage
        .from('restaurant-logos')
        .getPublicUrl(fileName);
      
      setProfileData(prev => ({ ...prev, logo_url: data.publicUrl }));
    } catch (err: any) {
      console.error('Logo upload error:', err);
      setLogoError('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingLogo(false);
    }
  };

  const checkSlug = async (slug: string) => {
    if (!slug) { setSlugStatus('idle'); return; }
    setSlugStatus('loading');
    const { data } = await supabase.from('restaurants').select('id').eq('slug', slug).single();
    setSlugStatus(data ? 'taken' : 'available');
  };

  const handleStep1Submit = async () => {
    console.log('Step 1 continue clicked', { 
      restaurantName: profileData.name, 
      slug: profileData.slug, 
      logoUrl: profileData.logo_url, 
      brandColor: profileData.primary_color 
    });

    if (!restaurant?.id) return;
    
    if (!profileData.name.trim()) {
      alert('Please enter your restaurant name');
      return;
    }

    if (slugStatus === 'taken') {
      alert('This URL is already taken. Please choose another.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: profileData.name,
          slug: profileData.slug,
          logo_url: profileData.logo_url || null,
          primary_color: profileData.primary_color
        })
        .eq('id', restaurant.id);

      if (error) throw error;

      setRestaurant({ ...restaurant, ...profileData });
      setStep(2);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      alert('Failed to save profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2 Handlers ---
  const handleAddCategory = (cat: string) => {
    if (addedCategories.length >= 10) return;
    if (!addedCategories.includes(cat)) {
      setAddedCategories(prev => [...prev, cat]);
    }
  };

  const handleStep2Submit = async () => {
    if (!restaurant || addedCategories.length === 0) return;
    setLoading(true);
    try {
      for (let i = 0; i < addedCategories.length; i++) {
        await insertCategory({
          name: addedCategories[i],
          restaurant_id: restaurant.id,
          sort_order: i
        });
      }
      // Re-fetch categories to get IDs for Step 3
      const cats = await fetchCategories(restaurant.id);
      setCategories(cats);
      if (cats.length > 0) {
        setDishData(prev => ({ ...prev, category_id: cats[0].id }));
      }
      setStep(3);
    } catch (err) {
      alert('Failed to save categories');
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3 Handlers ---
  const handleDishPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurant) return;
    setDishFile(file);
    setUploadingDish(true);
    try {
      const fileName = `${restaurant.id}/dish-${Date.now()}-${file.name}`;
      const url = await uploadFile('dish-photos', fileName, file);
      setDishData(prev => ({ ...prev, image_url: url }));
    } catch (err) {
      alert('Photo upload failed');
    } finally {
      setUploadingDish(false);
    }
  };

  const handleGenerate3D = async () => {
    if (!dishFile || !restaurant) return;
    try {
      const modelUrl = await generateModel(dishFile, 'new-onboarding-item');
      setDishData(prev => ({ ...prev, ar_model_url: modelUrl }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddDish = async () => {
    console.log('Add dish clicked', { dishData, restaurantId: restaurant?.id });
    
    if (!restaurant?.id) return;
    
    if (!dishData.name.trim()) {
      alert('Please enter a dish name');
      return;
    }

    if (!dishData.category_id) {
      alert('Please select a category');
      return;
    }

    if (!dishData.price || isNaN(dishData.price)) {
      alert('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const newItem = await insertMenuItem({
        ...dishData,
        restaurant_id: restaurant.id
      });
      
      if (newItem) {
        setDishesAdded(prev => [...prev, newItem]);
        // Reset form for "Add another"
        setDishData(prev => ({
          ...prev,
          name: '',
          price: 0,
          description: '',
          calories: 0,
          allergens: [],
          is_available: true,
          image_url: '',
          ar_model_url: ''
        }));
        setDishFile(null);
      }
    } catch (err: any) {
      console.error('Failed to add dish:', err);
      alert('Failed to add dish: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // --- Step 4 Handlers ---
  const handleGenerateTables = async () => {
    if (!restaurant) return;
    setGeneratingQR(true);
    try {
      const tables = Array.from({ length: tableCount }, (_, i) => ({
        restaurant_id: restaurant.id,
        table_number: i + 1,
        is_active: true
      }));
      await insertTables(tables);
      setQrDone(true);
    } catch (err) {
      alert('Failed to generate tables');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleFinish = () => {
    localStorage.setItem(`confetti_${restaurant?.id}`, 'true');
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="h-16 px-6 flex items-center justify-between border-b border-surface-container bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-headline font-bold text-lg">M</span>
          </div>
          <span className="font-headline font-bold text-primary">MenuAR</span>
        </div>
        
        <button 
          onClick={handleFinish}
          className="text-xs font-bold text-[#707971] uppercase tracking-widest hover:text-primary transition-colors"
        >
          Save and continue later
        </button>
      </nav>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-surface-container">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out" 
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="text-center text-[10px] font-bold text-[#707971] uppercase tracking-[0.3em] mb-4">
            Step {step} of 4
          </p>

          <div className="bg-white rounded-[32px] shadow-xl border border-surface-container overflow-hidden">
            {/* STEP 1: Profile */}
            {step === 1 && (
              <div className="p-8 sm:p-12 space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-headline font-bold text-[#191C19]">Let's set up your restaurant</h2>
                  <p className="text-sm text-[#707971]">This is what your customers will see</p>
                </div>

                <div className="space-y-6">
                  <Input 
                    label="Restaurant Name" 
                    value={profileData.name}
                    onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#707971] ml-1">URL Slug</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={profileData.slug}
                        onChange={e => {
                          const val = e.target.value.toLowerCase().replace(/\s+/g, '-');
                          setProfileData(prev => ({ ...prev, slug: val }));
                          checkSlug(val);
                        }}
                        className="w-full h-12 bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-12"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {slugStatus === 'loading' && <Loader2 className="animate-spin text-[#707971]" size={16} />}
                        {slugStatus === 'available' && <Check className="text-green-500" size={18} />}
                        {slugStatus === 'taken' && <X className="text-red-500" size={18} />}
                      </div>
                    </div>
                    <p className="text-[10px] text-[#707971]">
                      Your menu will be at: <span className="text-primary font-bold">menuar.com/{profileData.slug}/menu</span>
                    </p>
                  </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#707971] ml-1">Restaurant Logo</label>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-2xl border border-surface-container bg-[#FAFAF8] flex items-center justify-center overflow-hidden shrink-0">
                            {profileData.logo_url ? (
                              <img src={profileData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={24} className="text-[#E8E8E4]" />
                            )}
                          </div>
                          <label className="flex-1 flex flex-col items-center justify-center h-20 rounded-2xl border-2 border-dashed border-surface-container hover:border-primary/50 transition-all cursor-pointer bg-white">
                            {uploadingLogo ? (
                              <div className="flex flex-col items-center gap-1">
                                <Loader2 className="animate-spin text-primary" size={20} />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Uploading...</span>
                              </div>
                            ) : (
                              <>
                                <Upload size={18} className="text-[#707971] mb-1" />
                                <span className="text-[10px] font-bold text-[#707971] uppercase tracking-widest">Change Logo</span>
                              </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                          </label>
                        </div>
                        
                        {/* Status Messages */}
                        <div className="px-1">
                          {uploadingLogo && (
                            <p className="text-[11px] text-primary font-medium flex items-center gap-1.5">
                              <Loader2 size={12} className="animate-spin" /> Uploading logo...
                            </p>
                          )}
                          {profileData.logo_url && !uploadingLogo && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-16 rounded-full border-2 border-primary overflow-hidden shadow-sm">
                                <img src={profileData.logo_url} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">Logo uploaded ✓</p>
                            </div>
                          )}
                          {logoError && (
                            <p className="text-[11px] text-red-500 font-medium">
                              {logoError}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#707971] ml-1">Brand Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={profileData.primary_color}
                        onChange={e => {
                          setProfileData(prev => ({ ...prev, primary_color: e.target.value }));
                          document.documentElement.style.setProperty('--color-primary', e.target.value);
                        }}
                        className="w-12 h-12 rounded-xl cursor-pointer border border-surface-container bg-white p-1"
                      />
                      <div className="flex-1 flex items-center justify-between px-4 h-12 bg-primary/10 rounded-xl border border-primary/5">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">UI Preview</span>
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div className="w-8 h-2 rounded-full bg-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleStep1Submit}
                  className="w-full h-14 font-bold text-lg"
                  disabled={loading || !profileData.name || !profileData.slug || slugStatus === 'taken'}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" /> 
                      <span>Saving...</span>
                    </div>
                  ) : 'Looks great, continue →'}
                </Button>
              </div>
            )}

            {/* STEP 2: Categories */}
            {step === 2 && (
              <div className="p-8 sm:p-12 space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-headline font-bold text-[#191C19]">What sections is your menu divided into?</h2>
                  <p className="text-sm text-[#707971]">e.g. Starters, Mains, Drinks, Desserts</p>
                </div>

                <div className="space-y-6">
                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_CATS.map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleAddCategory(cat)}
                        disabled={addedCategories.includes(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                          addedCategories.includes(cat)
                            ? 'bg-surface-container text-[#707971] border-surface-container opacity-50'
                            : 'bg-white text-primary border-primary/20 hover:border-primary hover:bg-primary/5'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Added List */}
                  <div className="flex flex-wrap gap-3 p-6 bg-background rounded-[24px] border border-surface-container min-h-[100px]">
                    {addedCategories.length === 0 && (
                      <p className="text-[#707971] text-xs text-center w-full italic">Tap suggestions or add custom categories below</p>
                    )}
                    {addedCategories.map(cat => (
                      <div key={cat} className="bg-primary text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                        {cat}
                        <button onClick={() => setAddedCategories(prev => prev.filter(c => c !== cat))}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Add custom category..."
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && newCategory && (handleAddCategory(newCategory), setNewCategory(''))}
                      className="flex-1 h-12 bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 text-sm focus:outline-none"
                    />
                    <button 
                      onClick={() => { if (newCategory) { handleAddCategory(newCategory); setNewCategory(''); } }}
                      className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="secondary" onClick={prevStep} className="flex-1 h-14">Back</Button>
                  <Button 
                    onClick={handleStep2Submit}
                    className="flex-[2] h-14 font-bold"
                    disabled={loading || addedCategories.length === 0}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Continue to dishes →'}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: First Dish */}
            {step === 3 && (
              <div className="p-8 sm:p-12 space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-headline font-bold text-[#191C19]">Add your first dish</h2>
                  <p className="text-sm text-[#707971]">You can add more from your dashboard</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <Input 
                        label="Dish Name" 
                        placeholder="e.g. Wagyu Burger"
                        value={dishData.name}
                        onChange={e => setDishData(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Category</label>
                        <select 
                          className="w-full h-12 px-4 rounded-xl border border-surface-container bg-[#FAFAF8] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={dishData.category_id}
                          onChange={e => setDishData(prev => ({ ...prev, category_id: e.target.value }))}
                        >
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                      </div>
                      <Input 
                        label="Price (RWF)" 
                        type="number"
                        placeholder="0"
                        value={dishData.price}
                        onChange={e => setDishData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1 block">Photo</label>
                      <label className="block aspect-square w-full rounded-[32px] border-2 border-dashed border-surface-container hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden bg-background">
                        {dishData.image_url ? (
                          <img src={dishData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : uploadingDish ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                            <Loader2 className="animate-spin text-primary mb-2" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Uploading...</span>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#707971]">
                            <Plus size={32} className="mb-2 opacity-20" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Add Photo</span>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleDishPhotoUpload} />
                      </label>
                    </div>
                  </div>

                  {dishData.image_url && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      {generating ? (
                        <div className="bg-primary/5 rounded-2xl p-4 space-y-3 border border-primary/10">
                          <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${genProgress}%` }} />
                          </div>
                          <p className="text-[10px] font-bold text-primary uppercase text-center">{genStatus}</p>
                        </div>
                      ) : dishData.ar_model_url ? (
                        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                              <Check size={18} />
                            </div>
                            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">3D Model Ready</span>
                          </div>
                          <Button variant="secondary" size="sm" onClick={handleGenerate3D} className="h-8 border-green-200 text-green-700 hover:bg-green-100">Regenerate</Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={handleGenerate3D}
                          variant="secondary"
                          className="w-full h-12 border-primary text-primary hover:bg-primary/5 gap-2"
                        >
                          <Sparkles size={18} />
                          ✨ Generate 3D Model with Tripo3D
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={handleAddDish}
                    className="w-full h-14 font-bold"
                    disabled={loading || !dishData.name || !dishData.image_url}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" />
                        <span>Adding...</span>
                      </div>
                    ) : 'Add this dish'}
                  </Button>
                  
                  {dishesAdded.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-surface-container animate-in fade-in slide-in-from-top-4">
                      <p className="text-[10px] font-bold text-[#707971] uppercase tracking-[0.2em] text-center">Added dishes ({dishesAdded.length})</p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {dishesAdded.map(d => (
                          <div key={d.id} className="w-12 h-12 rounded-xl overflow-hidden border border-surface-container">
                            <img src={d.image_url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <Button variant="secondary" onClick={nextStep} className="w-full h-14 border-primary text-primary">
                        Continue to final step →
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Tables */}
            {step === 4 && (
              <div className="p-8 sm:p-12 space-y-8">
                {!qrDone ? (
                  <>
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-headline font-bold text-[#191C19]">How many tables does your restaurant have?</h2>
                      <p className="text-sm text-[#707971]">We will generate a unique QR code for each table.</p>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-10 py-10">
                      <div className="flex items-center gap-8">
                        <button 
                          onClick={() => setTableCount(prev => Math.max(1, prev - 1))}
                          className="w-16 h-16 rounded-[24px] border border-surface-container flex items-center justify-center text-primary hover:bg-primary/5 active:scale-95 transition-all"
                        >
                          <Minus size={32} />
                        </button>
                        <span className="text-7xl font-headline font-bold text-primary w-24 text-center">{tableCount}</span>
                        <button 
                          onClick={() => setTableCount(prev => Math.min(200, prev + 1))}
                          className="w-16 h-16 rounded-[24px] border border-surface-container flex items-center justify-center text-primary hover:bg-primary/5 active:scale-95 transition-all"
                        >
                          <Plus size={32} />
                        </button>
                      </div>
                      <p className="text-xs text-[#707971] font-medium italic">You can add or remove tables anytime later</p>
                    </div>

                    <Button 
                      onClick={handleGenerateTables}
                      className="w-full h-16 text-lg font-bold"
                      disabled={generatingQR}
                    >
                      {generatingQR ? <Loader2 className="animate-spin" /> : 'Generate my QR codes'}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-headline font-bold text-[#191C19]">Your QR codes are ready! 🎉</h2>
                      <p className="text-sm text-[#707971]">Download and print them to start receiving orders.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => restaurant && generateTableQRsPDF(restaurant.name, restaurant.slug, tableCount)}
                        className="p-6 bg-primary/5 border border-primary/10 rounded-3xl flex flex-col items-center gap-3 hover:bg-primary/10 transition-all group"
                      >
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                          <Printer size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest text-center">Download PDF<br/>(Table Tents)</span>
                      </button>
                      
                      <button 
                        onClick={() => restaurant && generateTableQRsZip(restaurant.slug, tableCount)}
                        className="p-6 bg-secondary/5 border border-secondary/10 rounded-3xl flex flex-col items-center gap-3 hover:bg-secondary/10 transition-all group"
                      >
                        <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-secondary/20 group-hover:scale-110 transition-transform">
                          <FileArchive size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest text-center">Download ZIP<br/>(Raw Images)</span>
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        const message = `Hi! Our digital menu is ready at ${window.location.origin}/${restaurant?.slug}/menu. Use this guide to set up your tables!`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="w-full h-14 bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl flex items-center justify-center gap-3 text-[#25D366] font-bold text-sm hover:bg-[#25D366]/20 transition-all"
                    >
                      <MessageCircle size={20} className="fill-[#25D366]" />
                      Share Setup Guide via WhatsApp
                    </button>

                    <Button 
                      onClick={handleFinish}
                      className="w-full h-16 text-lg font-bold shadow-xl shadow-primary/20 mt-8"
                    >
                      Go to my dashboard 🎉
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
