import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Leaf, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    // Success - AppContext listener will handle isAuthenticated and userRole
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-[#E8E8E4] p-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
            <Leaf size={28} />
          </div>
          <h1 className="text-2xl font-headline font-bold text-primary">MenuAR</h1>
          <p className="text-[10px] font-bold text-[#707971] uppercase tracking-[0.2em] mt-1">Restaurant Admin Portal</p>
        </div>

        <hr className="border-t border-[#E8E8E4] mb-8" />

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-xl mb-6 animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#191C19] uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707971]" size={18} />
              <Input 
                type="email"
                required
                placeholder="admin@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#191C19] uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707971]" size={18} />
              <Input 
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#707971] hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 font-bold text-lg shadow-lg mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
            Forgot Password?
          </button>
        </div>
      </div>

      <footer className="mt-8 text-center text-[10px] font-bold text-[#707971] uppercase tracking-widest">
        Powered by MenuAR
      </footer>
    </div>
  );
};

export default Login;
