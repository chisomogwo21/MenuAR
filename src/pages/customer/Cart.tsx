import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import CustomerLayout from '../../components/customer/CustomerLayout';
import { ArrowLeft, Minus, Plus, CreditCard, Smartphone, CheckCircle2, ArrowRight, UtensilsCrossed } from 'lucide-react';
import Button from '../../components/ui/Button';
import { createOrder, createOrderItems } from '../../services/db';
import { formatPrice } from '../../utils/formatters';

const Cart: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, restaurant, clearCart } = useAppContext();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo'>('card');
  const [instructions, setInstructions] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const serviceCharge = subtotal * 0.1;
  const total = subtotal + serviceCharge;

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQty);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !restaurant) return;
    
    // In a real app table_id would come from QR param. Hardcoding table_id for now
    const tableId = 'tab-1'; 

    const orderData = await createOrder({
      restaurant_id: restaurant.id,
      table_id: tableId,
      total_amount: total,
      service_charge: serviceCharge,
      notes: instructions,
      status: 'received'
    });

    if (!orderData) {
      console.error("Failed to place order. Please try again.");
      return;
    }

    const orderItems = cart.map(item => ({
      order_id: orderData.id,
      menu_item_id: item.id,
      quantity: item.quantity,
      unit_price: item.price
    }));

    const success = await createOrderItems(orderItems);
    if (!success) {
      console.error("Failed to save order items, please ask server for help.");
    }
    
    // Clear cart and redirect
    clearCart();
    navigate(`/${slug}/order-confirmation?orderId=${orderData.id}`);
  };

  return (
    <CustomerLayout>
      {/* Header */}
      <header className="sticky top-0 left-0 w-full z-50 flex items-center justify-between px-5 h-16 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#E8E8E4]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-primary active:opacity-60 transition-opacity p-1"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-headline font-bold text-primary">Your Order</h1>
        </div>
        <div className="bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-primary/5">
          <UtensilsCrossed size={14} className="text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Table 4</span>
        </div>
      </header>

      <main className="px-5 pt-8 pb-32">
        {cart.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-[#707971]">
              <UtensilsCrossed size={32} />
            </div>
            <p className="text-[#707971]">Your order is empty</p>
            <Button onClick={() => navigate(`/${slug}/menu`)} variant="secondary">
              Back to Menu
            </Button>
          </div>
        ) : (
          <>
            {/* Order Items */}
            <section className="bg-white rounded-2xl border border-surface-container shadow-sm overflow-hidden mb-8">
              <div className="p-4 space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-headline font-bold text-[#191C19] text-sm">{item.name}</p>
                      <p className="text-[10px] text-[#707971] mt-0.5 line-clamp-1">{item.description}</p>
                    </div>
                    <div className="flex items-center bg-background rounded-xl p-1 border border-surface-container">
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-[#191C19] active:scale-90 transition-transform"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-2 font-bold text-[#191C19] text-sm w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#191C19] active:scale-90 transition-transform"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="font-bold text-primary text-sm w-20 text-right">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}

                <hr className="border-t border-surface-container" />

                {/* Totals */}
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm text-[#707971]">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#707971]">
                    <span>Service charge (10%)</span>
                    <span>{formatPrice(serviceCharge)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-headline font-bold text-[#191C19]">Total</span>
                    <span className="text-2xl font-headline font-bold text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Special Instructions */}
            <section className="mb-8">
              <h2 className="text-sm font-headline font-bold text-[#191C19] mb-3">Special instructions</h2>
              <div className="bg-background rounded-xl p-4 border border-surface-container">
                <textarea 
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 placeholder:text-[#707971]/40 min-h-[80px]" 
                  placeholder="Any notes for the kitchen? (e.g. allergies, preferences)"
                />
              </div>
            </section>

            <hr className="border-t border-surface-container mb-8" />

            {/* Payment Section */}
            <section className="mb-8">
              <h2 className="text-sm font-headline font-bold text-[#191C19] mb-4">Pay now</h2>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setPaymentMethod('card')}
                  className={`relative cursor-pointer border-2 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                    paymentMethod === 'card' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-surface-container bg-white'
                  }`}
                >
                  {paymentMethod === 'card' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 size={18} className="text-primary fill-primary/10" />
                    </div>
                  )}
                  <CreditCard size={32} className={paymentMethod === 'card' ? 'text-primary' : 'text-[#707971]'} />
                  <span className={`text-sm font-bold ${paymentMethod === 'card' ? 'text-primary' : 'text-[#707971]'}`}>Card</span>
                </div>

                <div 
                  onClick={() => setPaymentMethod('momo')}
                  className={`relative cursor-pointer border-2 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                    paymentMethod === 'momo' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-surface-container bg-white'
                  }`}
                >
                  {paymentMethod === 'momo' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 size={18} className="text-primary fill-primary/10" />
                    </div>
                  )}
                  <Smartphone size={32} className={paymentMethod === 'momo' ? 'text-primary' : 'text-[#707971]'} />
                  <span className={`text-sm font-bold ${paymentMethod === 'momo' ? 'text-primary' : 'text-[#707971]'}`}>MoMo</span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Fixed Bottom Action */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-surface-container px-5 py-6 z-50">
          <div className="max-w-sm mx-auto">
            <Button 
              onClick={handleCheckout}
              className="w-full h-16 text-lg font-bold shadow-xl flex items-center justify-center gap-2"
            >
              Pay {formatPrice(total)}
              <ArrowRight size={20} />
            </Button>
            <p className="text-center text-[10px] font-bold text-[#707971] mt-4 uppercase tracking-[0.2em]">
              Secure Checkout Powered by MenuAR
            </p>
          </div>
        </div>
      )}

      {/* Decorative Background Circles */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-30 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />
      </div>
    </CustomerLayout>
  );
};

export default Cart;
