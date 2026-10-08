import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

export const FloatingEnquiryBtn = ({ onClick }) => {
  return (
    <div className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 md:bottom-10 md:right-8 z-40 group">
      {/* Glow Aura */}
      <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#C2593F] to-[#7E2730] opacity-75 blur-md group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />

      <button
        onClick={onClick}
        className="relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-[#4A151B] via-[#611C23] to-[#8A3324] text-[#FFFDF9] shadow-2xl border-2 border-[#D4AF37]/70 hover:border-[#D4AF37] transition-all duration-300 transform active:scale-95 cursor-pointer"
        aria-label="Contact Enquiry"
      >
        {/* Animated Icon */}
        <div className="relative flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]/20" />
          <Sparkles className="w-3 h-3 text-[#FFFDF9] absolute -top-1 -right-1 animate-spin-slow" />
        </div>

        {/* Text Label */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] leading-none">
            Instant
          </span>
          <span className="text-xs sm:text-sm font-bold tracking-tight text-white whitespace-nowrap">
            Enquire Now
          </span>
        </div>

        {/* Pulse Dot */}
        <span className="relative flex h-2.5 w-2.5 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#52B788] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2D6A4F]" />
        </span>
      </button>
    </div>
  );
};
