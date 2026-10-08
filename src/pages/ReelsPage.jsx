import React, { useState, useEffect } from 'react';
import {
  Heart,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  Crown,
  ChevronUp,
  ChevronDown,
  Music,
  Eye,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { REELS_DATA } from '../data/mehndiData';

export const ReelsPage = ({ onBookLook }) => {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedReels, setLikedReels] = useState({});
  const [savedReels, setSavedReels] = useState({});
  const [floatingHearts, setFloatingHearts] = useState([]);

  const currentReel = REELS_DATA[currentReelIndex];

  const handleNextReel = () => {
    setCurrentReelIndex((prev) => (prev + 1) % REELS_DATA.length);
  };

  const handlePrevReel = () => {
    setCurrentReelIndex((prev) => (prev - 1 + REELS_DATA.length) % REELS_DATA.length);
  };

  const handleToggleLike = (reelId) => {
    const isLiked = !likedReels[reelId];
    setLikedReels((prev) => ({ ...prev, [reelId]: isLiked }));

    if (isLiked) {
      // Add floating heart
      const id = Date.now();
      setFloatingHearts((prev) => [...prev, id]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h !== id));
      }, 1000);
      toast.success('Added to your liked reels! ❤️');
    }
  };

  const handleToggleSave = (reelId) => {
    const isSaved = !savedReels[reelId];
    setSavedReels((prev) => ({ ...prev, [reelId]: isSaved }));
    if (isSaved) {
      toast.success('Reel saved to inspiration board! ✨');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Reel link copied to share on Instagram & WhatsApp!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-24">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8A3324]/10 text-[#8A3324] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Trending Henna Moments</span>
        </div>
        <h1 className="font-royal text-2xl sm:text-4xl font-bold text-[#4A151B]">
          Art-BY-radhika Bridal Reels Feed
        </h1>

        <p className="text-xs sm:text-sm text-[#4A151B]/80">
          Swipe through satisfying peels, live bride reactions, and intricate cone art piping.
        </p>
      </div>

      {/* Reel Phone Container */}
      <div className="relative max-w-sm sm:max-w-md mx-auto aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#D4AF37]/50 bg-[#1A0D0E]">
        {/* Animated Reel Canvas & Visualizer */}
        <div
          onClick={() => setIsPlaying(!isPlaying)}
          className={`absolute inset-0 bg-gradient-to-b ${currentReel.gradient} flex items-center justify-center cursor-pointer select-none`}
        >
          {/* Decorative Henna Mandala Pattern in Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
            <svg
              className={`w-96 h-96 ${isPlaying ? 'animate-spin-slow' : ''}`}
              viewBox="0 0 100 100"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="0.8"
            >
              <circle cx="50" cy="50" r="45" strokeDasharray="2,2" />
              <circle cx="50" cy="50" r="35" />
              <circle cx="50" cy="50" r="25" />
              <path d="M50 5 Q55 25 50 50 Q45 25 50 5" />
              <path d="M50 95 Q55 75 50 50 Q45 75 50 95" />
              <path d="M5 50 Q25 55 50 50 Q25 45 5 50" />
              <path d="M95 50 Q75 55 50 50 Q75 45 95 50" />
              <circle cx="50" cy="50" r="8" fill="#D4AF37" fillOpacity="0.4" />
            </svg>
          </div>

          {/* Animated Visual Demonstration */}
          <div className="relative text-center p-6 space-y-4 z-10 pointer-events-none">
            {/* Visual Icon Badge */}
            <div className="w-24 h-24 mx-auto rounded-full bg-black/40 backdrop-blur-md border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-xl">
              {currentReel.videoType === 'peel' && (
                <div className="text-center">
                  <Sparkles className="w-10 h-10 animate-bounce mx-auto" />
                  <span className="text-[10px] uppercase font-bold tracking-wider block mt-1">
                    Peel Reveal
                  </span>
                </div>
              )}
              {currentReel.videoType === 'portrait' && (
                <div className="text-center">
                  <Crown className="w-10 h-10 mx-auto" />
                  <span className="text-[10px] uppercase font-bold tracking-wider block mt-1">
                    Portrait Art
                  </span>
                </div>
              )}
              {currentReel.videoType === 'arabic' && (
                <div className="text-center">
                  <Sparkles className="w-10 h-10 mx-auto" />
                  <span className="text-[10px] uppercase font-bold tracking-wider block mt-1">
                    Gulf Khafif
                  </span>
                </div>
              )}
              {currentReel.videoType === 'feet' && (
                <div className="text-center">
                  <Crown className="w-10 h-10 mx-auto" />
                  <span className="text-[10px] uppercase font-bold tracking-wider block mt-1">
                    Rajwada Feet
                  </span>
                </div>
              )}
              {currentReel.videoType === 'making' && (
                <div className="text-center">
                  <Sparkles className="w-10 h-10 mx-auto" />
                  <span className="text-[10px] uppercase font-bold tracking-wider block mt-1">
                    Organic Lab
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37] text-[#2A0C0E]">
                {currentReel.views} Live Views
              </span>
              <p className="text-xs text-white/70 italic max-w-xs mx-auto pt-2">
                Tap anywhere to {isPlaying ? 'pause' : 'resume'} preview
              </p>
            </div>
          </div>

          {/* Pause Indicator overlay if paused */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Floating heart animations */}
          {floatingHearts.map((id) => (
            <div
              key={id}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 text-[#E63946] animate-in fade-in zoom-in-50 duration-700 pointer-events-none"
            >
              <Heart className="w-20 h-20 fill-[#E63946] drop-shadow-lg" />
            </div>
          ))}
        </div>

        {/* Top Controls: Sound & Progress indicator */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
          {/* Reel dots */}
          <div className="flex gap-1.5">
            {REELS_DATA.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${
                  currentReelIndex === i ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors cursor-pointer"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Action Icons Column */}
        <div className="absolute right-3 bottom-24 sm:bottom-28 z-20 flex flex-col items-center gap-4 text-white pointer-events-auto">
          {/* Like Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleToggleLike(currentReel.id)}
              className={`p-3 rounded-full backdrop-blur-md transition-transform active:scale-75 cursor-pointer ${
                likedReels[currentReel.id]
                  ? 'bg-[#E63946] text-white shadow-lg'
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              <Heart
                className={`w-6 h-6 ${likedReels[currentReel.id] ? 'fill-white' : ''}`}
              />
            </button>
            <span className="text-[11px] font-bold">
              {(currentReel.likes + (likedReels[currentReel.id] ? 1 : 0)).toLocaleString()}
            </span>
          </div>

          {/* Bookmark / Save */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleToggleSave(currentReel.id)}
              className={`p-3 rounded-full backdrop-blur-md transition-transform active:scale-75 cursor-pointer ${
                savedReels[currentReel.id]
                  ? 'bg-[#D4AF37] text-[#2A0C0E]'
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              <Bookmark
                className={`w-6 h-6 ${savedReels[currentReel.id] ? 'fill-[#2A0C0E]' : ''}`}
              />
            </button>
            <span className="text-[11px] font-bold">Save</span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-transform active:scale-75 cursor-pointer"
            >
              <Share2 className="w-6 h-6 text-white" />
            </button>
            <span className="text-[11px] font-bold">Share</span>
          </div>

          {/* Rotating Audio Disc */}
          <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] bg-black/60 flex items-center justify-center mt-2 animate-spin-slow">
            <Music className="w-4 h-4 text-[#D4AF37]" />
          </div>
        </div>

        {/* Bottom Overlay Info & Book Look Button */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-black via-black/80 to-transparent z-20 space-y-2 pointer-events-auto">
          {/* Artist Profile Tag */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#D4AF37] text-[#2A0C0E] font-bold text-xs flex items-center justify-center">
              R
            </div>

            <span className="font-royal font-bold text-xs sm:text-sm text-white">
              {currentReel.artist}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold">
              Master Artist
            </span>
          </div>

          {/* Reel Title & Description */}
          <h3 className="font-royal text-base sm:text-lg font-bold text-white leading-tight">
            {currentReel.title}
          </h3>
          <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
            {currentReel.description}
          </p>

          {/* Client Review Banner */}
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-[#D4AF37]/30 text-[11px] text-[#D4AF37] italic">
            {currentReel.clientReview}
          </div>

          {/* Audio track info */}
          <div className="flex items-center gap-2 text-[11px] text-white/70 overflow-hidden">
            <Music className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span className="truncate">{currentReel.soundTrack}</span>
          </div>

          {/* Book Look Action */}
          <div className="pt-1">
            <button
              onClick={() => onBookLook(currentReel)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E2C45E] to-[#B38F24] text-[#2A0C0E] font-bold text-xs sm:text-sm shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>Book This Exact Look</span>
            </button>
          </div>
        </div>

        {/* Up / Down Navigation Buttons */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 pointer-events-auto">
          <button
            onClick={handlePrevReel}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer transition-colors"
            title="Previous Reel"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextReel}
            className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer transition-colors"
            title="Next Reel"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
