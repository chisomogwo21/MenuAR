import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { Bell, ExternalLink, ChevronRight, Utensils, Receipt, Banknote, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { fetchOrdersForRestaurant, fetchMenuItems } from '../../services/db';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types';
import { Link } from 'react-router-dom';
import OrderManageModal from '../../components/admin/OrderManageModal';
import OnboardingModal from '../../components/admin/OnboardingModal';
import { AdminDashboardSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { formatPrice } from '../../utils/formatters';
import confetti from 'canvas-confetti';

const Dashboard: React.FC = () => {
  const { restaurant, authLoading, isAuthenticated } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    // Wait for auth to finish
    if (authLoading) return;

    // If not authenticated, the PrivateRoute will handle it
    if (!isAuthenticated) return;

    // If authenticated but no restaurant, stop loading (will show error or empty state)
    if (!restaurant) {
      console.error('Dashboard: No restaurant ID found in context');
      setLoading(false);
      setError(true);
      return;
    }

    // Check for onboarding success confetti
    if (restaurant?.id) {
      const showConfetti = localStorage.getItem(`confetti_${restaurant.id}`);
      if (showConfetti === 'true') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: [restaurant.primary_color || '#1A5C3A', '#D4A843', '#ffffff']
        });
        localStorage.removeItem(`confetti_${restaurant.id}`);
      }
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        console.log('Dashboard: Fetching data for restaurant:', restaurant.id);
        const [ordersData, menuData] = await Promise.all([
          fetchOrdersForRestaurant(restaurant.id, true),
          fetchMenuItems(restaurant.id, false)
        ]);
        
        console.log('Dashboard: Data fetched successfully. Orders:', ordersData.length, 'Menu items:', menuData.length);

        if (!cancelled) {
          setOrders(ordersData);
          if (menuData.length === 0) {
            setShowOnboarding(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Dashboard: Fetch error:', err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };
    load();

    const channel = supabase
      .channel(`admin_orders_${restaurant.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurant.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? (payload.new as Order) : o));
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [restaurant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Sidebar />
        <main className="md:ml-64 flex-1 p-10">
          <header className="mb-10">
            <Skeleton className="w-48 h-8 mb-2" />
            <Skeleton className="w-32 h-4" />
          </header>
          <AdminDashboardSkeleton />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6 opacity-20" />
        <h2 className="text-xl font-headline font-bold text-[#191C19] mb-2">Failed to load dashboard</h2>
        <p className="text-[#707971] text-sm mb-8">Please check your connection and try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all"
        >
          <RefreshCw size={18} /> Try Again
        </button>
      </div>
    );
  }

  // Derived stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const activeTables = new Set(orders.filter(o => o.status !== 'served' && o.status !== 'cancelled').map(o => o.table_id)).size;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="md:ml-64 min-h-screen">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-10 bg-[#FAFAF8] border-b border-[#E8E8E4] sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-headline font-bold text-primary">Dashboard</h1>
            <p className="text-[10px] font-bold text-[#707971] uppercase tracking-[0.2em] mt-1">{todayStr}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2.5 text-[#707971] hover:bg-surface-container rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary rounded-full border-2 border-[#FAFAF8]" />
            </button>
            <Link to={restaurant ? `/${restaurant.slug}/menu` : '/'} target="_blank">
              <Button className="gap-2 h-11 px-6 text-sm font-bold shadow-sm">
                Preview Menu
                <ExternalLink size={16} />
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-10 space-y-10">
          {/* Stat Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Today's Orders" 
              value={orders.length.toString()} 
              trend="+12%" 
              icon={<Receipt size={20} />} 
            />
            <StatCard 
              label="Revenue" 
              value={formatPrice(totalRevenue)} 
              trend="+8.4%" 
              icon={<Banknote size={20} />} 
              isPositive={true}
            />
            <StatCard 
              label="Active Tables" 
              value={`${activeTables}/12`} 
              icon={<Users size={20} />} 
            />
            <StatCard 
              label="Top Dish" 
              value="Ribeye" 
              icon={<Utensils size={20} />} 
            />
          </section>

          {/* Bottom Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Live Orders */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E8E8E4] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-6 border-b border-[#E8E8E4] flex justify-between items-center">
                <h3 className="text-lg font-headline font-bold text-[#191C19]">Live Orders</h3>
                <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline uppercase tracking-wider">
                  View all <ChevronRight size={14} />
                </button>
              </div>
              
              {orders.length === 0 ? (
                <div className="flex-1 flex items-center justify-center flex-col text-[#707971]">
                  <Receipt size={48} className="opacity-20 mb-4" />
                  <p className="font-bold">No orders today yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#FAFAF8] text-[#707971] font-bold text-[10px] uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Table</th>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4 text-right">Total</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2F2F0]">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-surface-container/30 transition-colors">
                          <td className="px-6 py-5 font-bold text-primary text-sm">
                            Table {order.table_id.split('-')[1]?.padStart(2, '0') || '1'}
                          </td>
                          <td className="px-6 py-5 text-xs text-[#707971] truncate max-w-[200px]">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-right text-[#191C19]">{formatPrice(order.total_amount)}</td>
                          <td className="px-6 py-5">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button 
                              onClick={() => setSelectedOrderId(order.id)}
                              className="text-primary border border-primary px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top Dishes Performance */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E8E4] shadow-sm p-6">
              <h3 className="text-lg font-headline font-bold text-[#191C19] mb-8">Top Dishes Today</h3>
              <div className="space-y-8">
                {[
                  { name: 'Grilled Ribeye', count: 42, color: 'bg-primary', percent: 100 },
                  { name: 'Wild Mushroom Risotto', count: 31, color: 'bg-primary', percent: 74 },
                  { name: 'Safari Platter', count: 28, color: 'bg-primary', percent: 66 },
                  { name: 'Tiger Prawn Skewers', count: 22, color: 'bg-primary', percent: 52 },
                  { name: 'Ostrich Burger', count: 18, color: 'bg-primary', percent: 42 },
                ].map((dish) => (
                  <div key={dish.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#191C19]">{dish.name}</span>
                      <span className="text-[#707971] text-xs font-medium">{dish.count} orders</span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div 
                        className={`${dish.color} h-full rounded-full transition-all duration-1000`} 
                        style={{ width: `${dish.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendation Card */}
              <div className="mt-12 bg-background p-6 rounded-2xl border border-surface-container text-center">
                <div className="w-full h-32 mb-4 rounded-xl overflow-hidden shadow-inner">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLzBJnDhtfzyYb9YjVyJE_mRcYLU7G1_OtOfvL_sqet8BmCoHeN2hoW6kZZ7bJToqf_FPF_hU1IVO0KpmwwMUHGLF2XYesSB2GaoojdTPoZyZtFOx4GcVVwIEvKOxkEWRD0somCNJwWuMCUfOVFbq2BRs-v6qzQQ3xrRKXwyJjaohvmlR1oeME0cR-8tzUciI74ZahAy-n6uKtQT2O8XQ5n9bHtlN7P75Mxawqtk9vSlL-4vpOCcZzMiywzKLwgO_8JUyp-Cp7ROUJ"
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-1">Kitchen Intelligence</p>
                <p className="text-xs text-[#707971] leading-relaxed">
                  Inventory for Ribeye is low. Suggest alternative mains to servers.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <OrderManageModal 
        isOpen={!!selectedOrderId}
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />

      {showOnboarding && restaurant && (
        <OnboardingModal 
          restaurant={restaurant}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
