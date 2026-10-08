import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Lock, Phone, User, Mail, Sparkles, Eye, EyeOff, Crown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { loginUser, signupUser, clearAuthError } from '../redux/slices/authSlice';
import { toast } from 'sonner';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', onSuccess }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (mode === 'signup') {
      const signupPayload = {
        phone: cleanPhone,
        password: formData.password,
      };
      if (formData.name.trim()) signupPayload.name = formData.name.trim();

      const result = await dispatch(signupUser(signupPayload));
      if (signupUser.fulfilled.match(result)) {
        toast.success('Royal Welcome! Account created successfully ✨');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(result.payload || 'Signup failed');
      }
    } else {
      // Login
      const loginPayload = {
        phone: cleanPhone,
        password: formData.password,
      };

      const result = await dispatch(loginUser(loginPayload));
      if (loginUser.fulfilled.match(result)) {
        toast.success(`Welcome back, ${result.payload?.data?.user?.name || 'Bride'}! ✨`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(result.payload || 'Invalid phone or password');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#FFFDF9] rounded-3xl border border-[#D4AF37]/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#2A0C0E] via-[#4A151B] to-[#7E2730] p-6 text-white text-center relative overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF6F0] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Decorative Sparkle */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] mb-2 text-[#D4AF37] shadow-inner">
            <Crown className="w-6 h-6" />
          </div>

          <h3 className="font-royal text-xl sm:text-2xl font-bold tracking-wide text-[#FAF6F0]">
            {mode === 'login' ? 'Royal Bride Login' : 'Create Royal Atelier Account'}
          </h3>
          <p className="text-xs text-[#D4AF37] mt-1 font-serif-elegant italic tracking-wider">
            Art-BY-radhika • Bridal Mehndi Privileges
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#D4AF37]/25 bg-[#FAF6F0]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              dispatch(clearAuthError());
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-royal font-bold transition-all text-center cursor-pointer ${
              mode === 'login'
                ? 'text-[#4A151B] border-b-2 border-[#8A3324] bg-white shadow-sm'
                : 'text-[#4A151B]/60 hover:text-[#4A151B]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              dispatch(clearAuthError());
            }}
            className={`flex-1 py-3 text-xs sm:text-sm font-royal font-bold transition-all text-center cursor-pointer ${
              mode === 'signup'
                ? 'text-[#4A151B] border-b-2 border-[#8A3324] bg-white shadow-sm'
                : 'text-[#4A151B]/60 hover:text-[#4A151B]'
            }`}
          >
            New Bride Registration
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#8A3324]/10 border border-[#8A3324]/30 text-[#8A3324] text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A3324]" />
              <span>{error}</span>
            </div>
          )}

          {/* Name (for signup) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                Bride Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8A3324] absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                />
              </div>
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
              Mobile Phone Number *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-[#8A3324] select-none">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                required
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] font-semibold tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
              />
              <Phone className="w-4 h-4 text-[#8A3324]/50 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A3324] absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Secret password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#4A151B]/60 hover:text-[#4A151B] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#4A151B] via-[#611C23] to-[#8A3324] text-white font-royal font-bold text-xs sm:text-sm tracking-wider shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Atelier' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#FAF6F0]/80 border-t border-[#D4AF37]/20 text-center">
          <p className="text-[11px] text-[#4A151B]/70">
            {mode === 'login' ? (
              <>
                New to Art-BY-radhika?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-[#8A3324] underline hover:text-[#4A151B] cursor-pointer"
                >
                  Register Now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-[#8A3324] underline hover:text-[#4A151B] cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
