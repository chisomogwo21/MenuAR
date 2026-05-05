import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Check, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../utils/formatters';

const TIERS = [
  {
    id: 'starter',
    name: 'STARTER',
    price: 29000,
    features: [
      'Up to 30 menu items',
      'Digital menu with QR codes',
      'Basic analytics',
      'No AR preview'
    ]
  },
  {
    id: 'growth',
    name: 'GROWTH',
    price: 79000,
    popular: true,
    features: [
      'Unlimited menu items',
      'AR 3D dish preview',
      'AI menu assistant (Gemini)',
      'Full analytics',
      'Custom branding + color'
    ]
  },
  {
    id: 'pro',
    name: 'PRO',
    price: 149000,
    features: [
      'Everything in Growth',
      'Priority support',
      'Multiple locations',
      'API access'
    ]
  }
];

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTier, setSelectedTier] = useState('growth');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    restaurantName: '',
    fullName: '',
    email: '',
    password: ''
  });

  const generateSlug = (name: string) => 
    name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Signup failed');

      // 2. Generate unique slug
      let slug = generateSlug(formData.restaurantName);
      const { data: existingRest } = await supabase
        .from('restaurants')
        .select('slug')
        .eq('slug', slug)
        .single();
      
      if (existingRest) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }

      // 3. Create restaurant
      const { data: restaurant, error: restError } = await supabase
        .from('restaurants')
        .insert({
          name: formData.restaurantName,
          slug: slug,
          primary_color: '#1A5C3A',
          is_active: true,
          subscription_tier: selectedTier
        })
        .select()
        .single();

      if (restError) throw restError;

      // 4. Update user with restaurant_id
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (!existingUser) {
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: formData.email,
            password_hash: 'supabase-auth-managed',
            role: 'restaurant_admin',
            restaurant_id: restaurant.id
          }, { 
            onConflict: 'email',
            ignoreDuplicates: false 
          });

        if (userError) throw userError;
      }

      // 5. Create notification for super admin
      await supabase.from('notifications').insert({
        type: 'new_signup',
        restaurant_id: restaurant.id,
        message: `${formData.restaurantName} just signed up for MenuAR`
      });

      // 6. Invoke welcome email (Edge Function)
      // await supabase.functions.invoke('send-welcome-email', {
      //   body: { 
      //     email: formData.email, 
      //     name: formData.fullName, 
      //     restaurantName: formData.restaurantName, 
      //     slug: slug,
      //     tier: selectedTier 
      //   }
      // });

      navigate('/onboarding');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('User already registered')) {
        setError('An account with this email already exists. Sign in instead.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-headline font-bold text-2xl">M</span>
            </div>
            <h1 className="text-3xl font-headline font-bold text-primary">MenuAR</h1>
          </div>
          <p className="text-[#707971] font-medium uppercase tracking-[0.2em] text-xs">
            The smart dine-in menu for modern restaurants
          </p>
        </div>

        <div className="bg-white rounded-[32px] shadow-2xl border border-surface-container overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold animate-in shake-in duration-300">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Column: Form Fields */}
              <div className="space-y-6">
                <h2 className="text-xl font-headline font-bold text-[#191C19]">Restaurant Details</h2>
                <Input
                  label="Restaurant Name"
                  placeholder="e.g. Savanna Grill"
                  required
                  value={formData.restaurantName}
                  onChange={e => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                />
                <Input
                  label="Your Full Name"
                  placeholder="John Doe"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@restaurant.com"
                  required
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    required
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-11 text-[#707971] hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Right Column: Tier Selection */}
              <div className="space-y-6">
                <h2 className="text-xl font-headline font-bold text-[#191C19]">Select Your Plan</h2>
                <div className="space-y-3">
                  {TIERS.map(tier => (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`relative cursor-pointer p-5 rounded-2xl border-2 transition-all group ${
                        selectedTier === tier.id 
                          ? 'border-primary bg-primary/5 ring-4 ring-primary/5' 
                          : 'border-surface-container hover:border-primary/30'
                      }`}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Star size={10} className="fill-white" /> MOST POPULAR
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-primary tracking-widest">{tier.name}</h3>
                          <p className="text-xl font-headline font-bold text-[#191C19]">{formatPrice(tier.price)}<span className="text-xs text-[#707971] font-normal lowercase">/mo</span></p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedTier === tier.id ? 'border-primary bg-primary' : 'border-surface-container'
                        }`}>
                          {selectedTier === tier.id && <Check size={14} className="text-white" />}
                        </div>
                      </div>

                      <ul className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-[11px] text-[#707971]">
                            <Check size={12} className="text-primary shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                className="w-full h-16 text-lg font-bold shadow-xl shadow-primary/20"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Create my menu'}
              </Button>
              <p className="text-center mt-6 text-sm text-[#707971]">
                Already have an account?{' '}
                <Link to="/admin/login" className="text-primary font-bold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
