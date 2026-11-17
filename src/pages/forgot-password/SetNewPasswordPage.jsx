import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForgotPassword } from './ForgotPasswordContext';
import { ForgotPasswordLayout } from './ForgotPasswordLayout';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const SetNewPasswordPage = () => {
  const navigate = useNavigate();
  const { email, otp, resetPassword, isSubmitting } = useForgotPassword();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const res = await resetPassword(newPassword);
    if (res.success) {
      setIsSuccess(true);
    }
  };

  // Clean Success Screen
  if (isSuccess) {
    return (
      <ForgotPasswordLayout
        currentStep={4}
        title="Password Reset"
        subtitle="Your password has been reset successfully."
      >
        <div className="py-6 flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#2C1810]">
              All Set!
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              You can now sign in to your account with your new password.
            </p>
          </div>

          <div className="w-full pt-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full py-3 rounded-xl bg-[#4A151B] hover:bg-[#5C1A22] text-white font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Back to Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </ForgotPasswordLayout>
    );
  }

  return (
    <ForgotPasswordLayout
      currentStep={4}
      title="Set New Password"
      subtitle="Must be at least 6 characters long."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-[#4A151B] mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#8A3324] absolute left-3.5 top-3.5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm text-[#2C1810] focus:border-[#8A3324] focus:ring-1 focus:ring-[#8A3324] outline-none transition-all placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-[#4A151B] mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#8A3324] absolute left-3.5 top-3.5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-[#2C1810] focus:outline-none transition-all placeholder:text-gray-400 ${
                confirmPassword && !passwordsMatch
                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-200 focus:border-[#8A3324] focus:ring-1 focus:ring-[#8A3324]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {confirmPassword && !passwordsMatch && (
            <p className="text-[11px] text-red-500 font-medium mt-1">
              Passwords do not match
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting || !newPassword || !confirmPassword || !passwordsMatch}
            className="w-full py-3 rounded-xl bg-[#4A151B] hover:bg-[#5C1A22] text-white font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Resetting...</span>
              </span>
            ) : (
              <span>Reset Password</span>
            )}
          </button>

          <div className="text-center">
            <Link
              to="/profile"
              className="text-xs text-gray-500 hover:underline font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </ForgotPasswordLayout>
  );
};
