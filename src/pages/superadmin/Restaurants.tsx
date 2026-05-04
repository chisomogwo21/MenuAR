import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { fetchAllRestaurants, insertRestaurant } from '../../services/db';
import type { Restaurant } from '../../types';
import { Building2, Plus, LogOut, Check, X, Loader2, Bell } from 'lucide-react';
import Button from '../../components/ui/Button';

const Restaurants: React.FC = () => {
  const { userRole, authLoading, isAuthenticated } = useAppContext();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    primary_color: '#1A5C3A',
    admin_email: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (userRole === 'super_admin') {
      loadRestaurants();
      loadNotifications();
    }
  }, [userRole]);

  const loadNotifications = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    setUnreadNotifications(count || 0);
  };

  const loadRestaurants = async () => {
    setLoading(true);
    const data = await fetchAllRestaurants();
    setRestaurants(data);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // 1. Insert Restaurant
    const newRestaurant = await insertRestaurant({
      name: formData.name,
      slug: formData.slug,
      primary_color: formData.primary_color
    });

    if (newRestaurant && formData.admin_email) {
      // 2. Create Admin Auth User via Supabase Edge Function or direct API if we had service role
      // For this phase, we'll simulate the admin creation since we don't have the service_role key
      alert(`Restaurant added! Admin account for ${formData.admin_email} needs to be created via Supabase backend.`);
    }

    setFormData({ name: '', slug: '', primary_color: '#1A5C3A', admin_email: '' });
    setIsAdding(false);
    await loadRestaurants();
    setSubmitting(false);
  };

  const handleToggleStatus = async (_id: string, _currentStatus: boolean) => {
    // Assuming we add an 'is_active' field to restaurants
    // await updateRestaurant(id, { is_active: !currentStatus });
    // await loadRestaurants();
    alert('Toggle status functionality coming soon!');
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (userRole !== 'super_admin') return <div className="min-h-screen bg-background flex items-center justify-center text-red-500 font-bold">Access Denied. Super Admin only.</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-20 bg-[#191C19] text-white px-10 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold">SA</div>
          <div>
            <h1 className="font-headline font-bold text-xl leading-tight">Super Admin</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Network Overview</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Bell size={24} className="text-white/70 hover:text-white cursor-pointer transition-colors" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-[#191C19] font-bold">
                {unreadNotifications}
              </span>
            )}
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-10 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-headline font-bold text-[#191C19]">Restaurants</h2>
          <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
            {isAdding ? <X size={18} /> : <Plus size={18} />}
            {isAdding ? 'Cancel' : 'Add Restaurant'}
          </Button>
        </div>

        {isAdding && (
          <div className="bg-white rounded-2xl p-6 border border-surface-container shadow-sm mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
            <h3 className="font-bold text-[#191C19] mb-6">New Restaurant Setup</h3>
            <form onSubmit={handleAddRestaurant} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Restaurant Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">URL Slug</label>
                <input required type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Admin Email</label>
                <input required type="email" name="admin_email" value={formData.admin_email} onChange={handleChange} className="w-full bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#707971]">Primary Color</label>
                <div className="flex gap-4">
                  <input required type="color" name="primary_color" value={formData.primary_color} onChange={handleChange} className="w-12 h-12 rounded-xl cursor-pointer" />
                  <input type="text" value={formData.primary_color} readOnly className="flex-1 bg-[#FAFAF8] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>
              <div className="md:col-span-2 pt-4">
                <Button type="submit" disabled={submitting} className="w-full justify-center">
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Restaurant & Admin'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-surface-container shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : restaurants.length === 0 ? (
            <div className="p-12 text-center text-[#707971]">No restaurants found.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#FAFAF8] text-[#707971] font-bold text-[10px] uppercase tracking-widest border-b border-surface-container">
                <tr>
                  <th className="px-6 py-4">Restaurant</th>
                  <th className="px-6 py-4">URL Slug</th>
                  <th className="px-6 py-4">Color</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {restaurants.map(r => (
                  <tr key={r.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                          <Building2 size={16} className="text-[#707971]" />
                        </div>
                        <span className="font-bold text-[#191C19]">{r.name}</span>
                        {r.created_at && (new Date().getTime() - new Date(r.created_at).getTime() < 86400000) && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-wider border border-amber-200">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#707971]">/{r.slug}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-surface-container" style={{ backgroundColor: r.primary_color || '#1A5C3A' }} />
                        <span className="text-xs font-mono">{r.primary_color || '#1A5C3A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        <Check size={12} /> Active
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleToggleStatus(r.id, true)} className="text-[#BA1A1A] hover:underline text-xs font-bold uppercase tracking-wider">
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Restaurants;
