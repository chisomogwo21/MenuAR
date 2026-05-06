import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { useAppContext } from '../../context/AppContext';
import { updateRestaurant } from '../../services/db';
import Button from '../../components/ui/Button';
import { Save, Loader2, Image as ImageIcon, Upload, Check } from 'lucide-react';
import { uploadFile } from '../../services/storage';

const Settings: React.FC = () => {
  const { restaurant, setRestaurant } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    banner_url: '',
    logo_url: '',
    primary_color: '#1A5C3A'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        slug: restaurant.slug || '',
        banner_url: restaurant.banner_url || '',
        logo_url: restaurant.logo_url || '',
        primary_color: restaurant.primary_color || '#1A5C3A'
      });
    }
  }, [restaurant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
    
    // Live preview for color
    if (name === 'primary_color') {
      document.documentElement.style.setProperty('--color-primary', value);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero') => {
    const file = e.target.files?.[0];
    if (!file || !restaurant) return;

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingHero(true);

    try {
      const bucket = type === 'logo' ? 'restaurant-logos' : 'restaurant-heroes';
      const fileName = `${restaurant.id}/${Date.now()}-${file.name}`;
      const url = await uploadFile(bucket, fileName, file);
      setFormData((prev: typeof formData) => ({ ...prev, [type === 'logo' ? 'logo_url' : 'banner_url']: url }));
    } catch (error) {
      console.error('Upload failed');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingHero(false);
    }
  };

  const handleSave = async () => {
    if (!restaurant) return;
    setIsSaving(true);
    setSaveSuccess(false);
    
    const success = await updateRestaurant(restaurant.id, formData);
    
    if (success) {
      setRestaurant({ ...restaurant, ...formData });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="md:ml-64 min-h-screen pb-20">
        <header className="h-20 flex items-center justify-between px-10 bg-[#FAFAF8] border-b border-[#E8E8E4] sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-headline font-bold text-primary">Settings</h1>
            <p className="text-[10px] font-bold text-[#707971] uppercase tracking-[0.2em] mt-1">Restaurant Configuration</p>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-2 h-11 px-6 text-sm font-bold shadow-sm"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : (saveSuccess ? <Check size={16} /> : <Save size={16} />)}
            {saveSuccess ? 'Saved!' : 'Save Changes'}
          </Button>
        </header>

        <div className="p-10 max-w-4xl mx-auto space-y-8">
          {/* Brand Identity Section */}
          <div className="bg-white rounded-2xl border border-[#E8E8E4] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E8E8E4]">
              <h2 className="text-lg font-headline font-bold text-[#191C19]">Brand Identity</h2>
              <p className="text-sm text-[#707971]">Update your restaurant's name and visual assets.</p>
            </div>
            
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Restaurant Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">URL Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Restaurant Logo</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl border border-[#E8E8E4] bg-[#FAFAF8] flex items-center justify-center overflow-hidden">
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ImageIcon size={32} className="text-[#E8E8E4]" />
                    )}
                  </div>
                  <label className="flex-1 flex flex-col items-center justify-center h-24 rounded-2xl border-2 border-dashed border-[#E8E8E4] hover:border-primary/50 transition-all cursor-pointer">
                    {uploadingLogo ? <Loader2 className="animate-spin text-primary" /> : (
                      <>
                        <Upload size={20} className="text-[#707971] mb-1" />
                        <span className="text-[10px] font-bold text-[#707971] uppercase tracking-widest">Click to upload logo</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                  </label>
                </div>
              </div>

              {/* Hero Image Upload */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Hero Banner</label>
                <div className="relative aspect-[3/1] rounded-2xl border border-[#E8E8E4] overflow-hidden group bg-[#FAFAF8]">
                  {formData.banner_url ? (
                    <img src={formData.banner_url} alt="Hero" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#707971]">
                      <ImageIcon size={32} className="opacity-30" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer">
                    {uploadingHero ? <Loader2 className="animate-spin text-white" /> : (
                      <>
                        <Upload size={24} className="text-white mb-2" />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Change Banner</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'hero')} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-white rounded-2xl border border-[#E8E8E4] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E8E8E4]">
              <h2 className="text-lg font-headline font-bold text-[#191C19]">Appearance</h2>
              <p className="text-sm text-[#707971]">Customize the colors and theme of your menu.</p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-6">
                <div className="space-y-2 flex-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Brand Color</label>
                  <p className="text-xs text-[#707971] mb-3">This color appears throughout your menu for buttons, highlights and accents.</p>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      name="primary_color"
                      value={formData.primary_color}
                      onChange={handleChange}
                      className="w-12 h-12 rounded-xl cursor-pointer border border-[#E8E8E4] bg-white p-1"
                    />
                    <input
                      type="text"
                      name="primary_color"
                      value={formData.primary_color}
                      onChange={handleChange}
                      className="w-32 bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="w-32 h-24 rounded-2xl border border-[#E8E8E4] p-4 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-[#707971] uppercase tracking-widest">Preview</span>
                  <div className="w-full h-8 rounded-lg bg-primary shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
