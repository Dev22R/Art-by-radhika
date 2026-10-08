import React from 'react';
import { X, Heart, Clock, Award, Sparkles, Share2, Crown, Check } from 'lucide-react';
import { toast } from 'sonner';

export const DesignModal = ({ design, isOpen, onClose, onBookDesign, isLiked, onToggleLike }) => {
  if (!isOpen || !design) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Design link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A0D0E]/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF6F0] rounded-3xl shadow-2xl border-2 border-[#D4AF37]/50 overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Image Section */}
        <div className="relative md:w-1/2 h-64 sm:h-80 md:h-auto bg-[#2A0C0E] overflow-hidden group">
          <img
            src={design.image}
            alt={design.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = design.fallbackImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

          {/* Floating Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF6F0]/90 text-[#4A151B] backdrop-blur-sm border border-[#D4AF37]/40 shadow-sm flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              {design.style}
            </span>
          </div>

          {/* Like & Share Action overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => onToggleLike(design.id)}
              className={`p-2.5 rounded-full backdrop-blur-md transition-transform active:scale-90 flex items-center gap-1.5 cursor-pointer ${
                isLiked
                  ? 'bg-[#E63946] text-white shadow-lg'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
              <span className="text-xs font-bold">{design.likes + (isLiked ? 1 : 0)}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md cursor-pointer"
              title="Share Design"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="p-6 md:w-1/2 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#8A3324] uppercase tracking-wider mb-1">
                <span>{design.category} Collection</span>
                <span>•</span>
                <span className="text-[#D4AF37] font-semibold">{design.complexity}</span>
              </div>
              <h3 className="font-royal text-2xl font-bold text-[#4A151B] leading-tight">
                {design.title}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#4A151B]/80 leading-relaxed">
              {design.description}
            </p>

            {/* Spec grid */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-[#F3ECE1]/80 border border-[#D4AF37]/20 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8A3324]" />
                <div>
                  <div className="text-[10px] text-[#8A3324] font-medium">Est. Duration</div>
                  <div className="font-bold text-[#4A151B]">{design.duration}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <div className="text-[10px] text-[#8A3324] font-medium">Stain Depth</div>
                  <div className="font-bold text-[#4A151B] text-[11px] truncate">{design.stainDepth}</div>
                </div>
              </div>
            </div>

            {/* Motifs Included */}
            <div>
              <div className="text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-2">
                Signatures & Motifs
              </div>
              <div className="flex flex-wrap gap-1.5">
                {design.motifs.map((motif, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#D4AF37]/30 text-xs text-[#611C23] font-medium flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3 h-3 text-[#D4AF37]" />
                    {motif}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="pt-4 border-t border-[#D4AF37]/20 mt-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A3324] block">Investment</span>
              <span className="text-xl font-bold font-royal text-[#4A151B]">{design.priceEstimate}</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onBookDesign(design);
              }}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#4A151B] to-[#8A3324] text-[#FAF6F0] font-bold text-xs sm:text-sm hover:from-[#611C23] hover:to-[#A8442E] transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Book This Look</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
