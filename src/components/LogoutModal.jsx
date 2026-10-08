import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, X, ShieldAlert, Check } from 'lucide-react';
import { logoutUser } from '../redux/slices/authSlice';
import { toast } from 'sonner';

export const LogoutModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    try {
      const res = await dispatch(logoutUser());
      if (logoutUser.fulfilled.match(res) || logoutUser.rejected.match(res)) {
        toast.success('Logged out successfully. Visit us again! ✨');
        onClose();
        navigate('/');
      }
    } catch (err) {
      toast.info('Logged out from this device');
      onClose();
      navigate('/');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-[#FFFDF9] rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 text-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF6F0] text-[#4A151B]/60 hover:text-[#4A151B] hover:bg-[#F3ECE1] flex items-center justify-center transition-colors cursor-pointer border border-[#D4AF37]/30 disabled:opacity-50"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Badge */}
        <div className="w-16 h-16 rounded-3xl bg-[#8A3324]/10 border-2 border-[#8A3324]/30 text-[#8A3324] mx-auto flex items-center justify-center shadow-inner">
          <LogOut className="w-8 h-8 text-[#8A3324]" />
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="font-royal text-lg sm:text-xl font-bold text-[#4A151B]">
            Sign Out of Atelier?
          </h3>
          <p className="text-xs text-[#4A151B]/75 leading-relaxed max-w-xs mx-auto">
            Are you sure you want to log out from your bridal profile? You can log back in anytime.
          </p>
        </div>

        {/* User Card Preview */}
        {user && (
          <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#D4AF37]/35 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#4A151B] to-[#8A3324] flex items-center justify-center text-white shrink-0 shadow-sm">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#4A151B] flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'B'}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-royal font-bold text-xs sm:text-sm text-[#4A151B] truncate">
                {user.name || 'Royal Bride'}
              </h4>
              <p className="text-[11px] text-[#8A3324] font-medium truncate">
                +91 {user.phone}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-[#D4AF37]/50 text-[#4A151B] hover:bg-[#FAF6F0] font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Stay Logged In
          </button>

          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8A3324] via-[#611C23] to-[#4A151B] text-white font-royal font-bold text-xs sm:text-sm tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Logging Out...</span>
              </span>
            ) : (
              <>
                <span>Sign Out</span>
                <LogOut className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
