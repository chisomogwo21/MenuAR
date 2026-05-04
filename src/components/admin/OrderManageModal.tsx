import React, { useEffect, useState } from 'react';
import { X, Clock, Check, ChefHat, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { fetchOrderById, fetchOrderItems, updateOrderStatus } from '../../services/db';
import type { Order, OrderItem, MenuItem, OrderStatus } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import { formatPrice } from '../../utils/formatters';

interface OrderManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

const OrderManageModal: React.FC<OrderManageModalProps> = ({ isOpen, onClose, orderId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<(OrderItem & { menu_items: MenuItem })[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isOpen || !orderId) {
      setOrder(null);
      setItems([]);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      const [orderData, itemsData] = await Promise.all([
        fetchOrderById(orderId),
        fetchOrderItems(orderId)
      ]);

      if (!cancelled) {
        setOrder(orderData);
        setItems(itemsData);
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to realtime updates for this specific order
    const channel = supabase
      .channel(`modal_order_${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!orderId) return;
    setUpdating(true);
    await updateOrderStatus(orderId, newStatus);
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md bg-background h-full shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col">
        {/* Header */}
        <header className="px-6 py-5 border-b border-surface-container bg-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-headline font-bold text-primary">Manage Order</h2>
            {orderId && (
              <p className="text-xs text-[#707971] mt-1 uppercase tracking-widest font-bold">
                #{orderId.slice(0, 8)}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors text-[#191C19]"
          >
            <X size={20} />
          </button>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !order ? (
          <div className="flex-1 flex items-center justify-center text-[#707971]">
            Order not found
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
            {/* Status Section */}
            <section className="bg-white rounded-2xl p-5 border border-surface-container shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-[#191C19]">Current Status</h3>
                <StatusBadge status={order.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleUpdateStatus('received')}
                  disabled={updating || order.status === 'received'}
                  className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    order.status === 'received' 
                      ? 'bg-amber-100 text-amber-800 border-2 border-amber-500' 
                      : 'bg-surface-container text-[#707971] hover:bg-[#E8E8E4]'
                  }`}
                >
                  <Clock size={14} /> Received
                </button>
                <button
                  onClick={() => handleUpdateStatus('preparing')}
                  disabled={updating || order.status === 'preparing'}
                  className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    order.status === 'preparing' 
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-500' 
                      : 'bg-surface-container text-[#707971] hover:bg-[#E8E8E4]'
                  }`}
                >
                  <ChefHat size={14} /> Preparing
                </button>
                <button
                  onClick={() => handleUpdateStatus('ready')}
                  disabled={updating || order.status === 'ready'}
                  className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    order.status === 'ready' 
                      ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500' 
                      : 'bg-surface-container text-[#707971] hover:bg-[#E8E8E4]'
                  }`}
                >
                  <Check size={14} /> Ready
                </button>
                <button
                  onClick={() => handleUpdateStatus('served')}
                  disabled={updating || order.status === 'served'}
                  className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    order.status === 'served' 
                      ? 'bg-gray-200 text-gray-800 border-2 border-gray-500' 
                      : 'bg-surface-container text-[#707971] hover:bg-[#E8E8E4]'
                  }`}
                >
                  <Check size={14} /> Served
                </button>
              </div>
            </section>

            {/* Order Items */}
            <section className="bg-white rounded-2xl p-5 border border-surface-container shadow-sm">
              <h3 className="font-bold text-[#191C19] mb-4">Order Items</h3>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 border-b border-surface-container pb-4 last:border-0 last:pb-0">
                    <img 
                      src={item.menu_items.image_url} 
                      alt={item.menu_items.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-[#191C19] text-sm">{item.menu_items.name}</h4>
                        <span className="font-bold text-primary">{formatPrice(item.unit_price * item.quantity)}</span>
                      </div>
                      <p className="text-[#707971] text-xs mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Order Details */}
            <section className="bg-white rounded-2xl p-5 border border-surface-container shadow-sm">
              <h3 className="font-bold text-[#191C19] mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#707971]">Table</span>
                  <span className="font-bold text-[#191C19]">{order.table_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#707971]">Created</span>
                  <span className="font-bold text-[#191C19]">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {order.notes && (
                  <div className="mt-4 p-3 bg-[#F5F0E8] rounded-xl border border-[#E8E1D5]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">Notes</span>
                    <p className="text-sm text-[#191C19]">{order.notes}</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Footer */}
        {order && (
          <div className="absolute bottom-0 w-full bg-white border-t border-surface-container p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-headline font-bold text-lg text-[#191C19]">Total</span>
              <span className="font-headline font-bold text-2xl text-primary">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManageModal;
