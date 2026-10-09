import React from 'react';
import { useDispatch } from 'react-redux';
import { X, Copy, Check, Share2, Sparkles, Send } from 'lucide-react';
import { shareReelAction } from '../../redux/slices/reelsSlice';
import { toast } from 'sonner';

export const ReelShareModal = ({ isOpen, onClose, reel }) => {
  const dispatch = useDispatch();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !reel) return null;

  const currentUrl = `${window.location.origin}/reels?id=${reel._id}`;
  const shareText = `Check out this gorgeous mehndi design "${reel.title}" on Art-BY-radhika: ${currentUrl}`;

  const handleWhatsAppShare = () => {
    dispatch(shareReelAction({ reelId: reel._id, platform: 'whatsapp' }));
    const encodedText = encodeURIComponent(
      `🌺 *Art-BY-radhika Royal Mehndi Reel* 🌺\n\n✨ *Design:* ${reel.title}\n📜 *Details:* ${reel.description || ''}\n\n▶️ *Watch & Book:* ${currentUrl}\n\n_Pure 100% Rajasthani Organic Sojat Henna_`
    );
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    toast.success('Opening WhatsApp to share reel! 💬');
    onClose();
  };

  const handleInstagramShare = () => {
    dispatch(shareReelAction({ reelId: reel._id, platform: 'instagram' }));
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n#ArtByRadhika #BridalMehndi #MehndiDesigns`);
    }
    toast.success('Reel caption & link copied for Instagram Story / DM! 📸');
    // Open Instagram web/app if possible
    window.open('https://www.instagram.com/', '_blank');
    onClose();
  };

  const handleCopyLink = () => {
    dispatch(shareReelAction({ reelId: reel._id, platform: 'other' }));
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('Reel link copied to clipboard! 📋');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.title,
          text: `Check out this bridal mehndi design on Art-BY-radhika!`,
          url: currentUrl,
        });
        dispatch(shareReelAction({ reelId: reel._id, platform: 'other' }));
        toast.success('Shared successfully!');
        onClose();
      } catch {
        // user cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-[#1A0D0E] text-[#FAF6F0] rounded-t-3xl sm:rounded-3xl border border-[#D4AF37]/40 shadow-2xl overflow-hidden z-10 p-5 space-y-4 animate-in slide-in-from-bottom-6 duration-200">
        {/* Mobile handle */}
        <div className="flex sm:hidden justify-center pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-royal text-base font-bold text-white">Share Reel</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reel Thumbnail Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10">
          <img
            src={reel.thumbnail?.url || reel.video?.url}
            alt={reel.title}
            className="w-14 h-14 rounded-xl object-cover border border-[#D4AF37]/30 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{reel.title}</h4>
            <p className="text-[11px] text-white/60 truncate mt-0.5">
              {reel.tags?.map((t) => `#${t}`).join(' ')}
            </p>
            <span className="text-[10px] text-[#D4AF37] font-semibold block mt-0.5">
              Art-BY-radhika Bridal Atelier
            </span>
          </div>
        </div>

        {/* Share Action Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* WhatsApp Button */}
          <button
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-white transition-all group cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md mb-2 group-hover:shadow-[#25D366]/50">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.07c-.24.68-1.4 1.25-1.94 1.33-.51.08-1.18.12-1.92-.12-.45-.14-1.04-.34-1.79-.67-3.17-1.38-5.23-4.57-5.39-4.78-.16-.22-1.3-1.73-1.3-3.3 0-1.57.82-2.35 1.11-2.66.29-.31.64-.39.85-.39.21 0 .43.01.62.02.2.01.47-.08.73.55.27.64.92 2.25 1 2.41.08.16.13.35.03.56-.11.21-.16.34-.32.53-.16.19-.34.42-.48.56-.16.16-.33.33-.14.65.19.32.84 1.39 1.8 2.25 1.24 1.1 2.29 1.44 2.62 1.6.33.16.52.13.71-.08.2-.22.84-.98 1.07-1.32.22-.34.45-.28.75-.17.31.11 1.95.92 2.28 1.09.34.16.56.24.64.38.08.14.08.81-.16 1.49z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-white">WhatsApp</span>
            <span className="text-[10px] text-white/50">Send to Friends</span>
          </button>

          {/* Instagram Button */}
          <button
            onClick={handleInstagramShare}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-gradient-to-tr from-[#F58529]/15 via-[#DD2A7B]/15 to-[#8134AF]/15 hover:bg-[#DD2A7B]/25 border border-[#DD2A7B]/40 text-white transition-all group cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-md mb-2 group-hover:shadow-[#DD2A7B]/50">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-white">Instagram</span>
            <span className="text-[10px] text-white/50">Story &amp; Bio DM</span>
          </button>
        </div>

        {/* Copy Link Row */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/40 border border-[#D4AF37]/30">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 bg-transparent text-xs text-white/80 px-2 py-1 focus:outline-none truncate"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-[#2A0C0E] text-xs font-bold hover:bg-[#F1DF96] transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Native Web Share option */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#D4AF37]" />
            <span>More Share Options...</span>
          </button>
        )}
      </div>
    </div>
  );
};
