import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export const ForgotPasswordLayout = ({ children, currentStep = 1, title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/profile');
    } else if (currentStep === 2) {
      navigate('/captch-page');
    } else if (currentStep === 3) {
      navigate('/captch-verify-page');
    } else if (currentStep === 4) {
      navigate('/otp-vairfy-page');
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 bg-[#FAF6F0]">
      {/* Sleek, Clean, Modern Mobile-App Frame */}
      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-[#E8E0D5] shadow-lg overflow-hidden flex flex-col transition-all">
        
        {/* Minimal App Top Bar */}
        <div className="px-5 pt-5 pb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-[#FAF6F0] hover:bg-[#F2ECE1] text-[#4A151B] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <span className="text-xs font-semibold uppercase tracking-wider text-[#8A3324]">
            Art By Radhika
          </span>

          <div className="w-10" /> {/* Spacer to keep center balanced */}
        </div>

        {/* Clean Title & Subtitle */}
        {(title || subtitle) && (
          <div className="px-6 pt-3 pb-2 text-center">
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#2C1810]">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#4A151B]/70 mt-1 leading-relaxed max-w-xs mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content Body with Clean Screen Slide Animation */}
        <div className="p-6 pt-3 flex-1 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex-1 flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
