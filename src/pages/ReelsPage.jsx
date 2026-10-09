import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronUp,
  ChevronDown,
  Loader2,
  RefreshCw,
  Sparkles,
  Flame,
  Crown,
} from 'lucide-react';
import { fetchReels } from '../redux/slices/reelsSlice';
import { ReelItem } from '../components/reels/ReelItem';
import { ReelCommentsModal } from '../components/reels/ReelCommentsModal';
import { ReelShareModal } from '../components/reels/ReelShareModal';
import { ReelBookModal } from '../components/reels/ReelBookModal';
import { AuthModal } from '../components/AuthModal';

export const ReelsPage = ({ onBookLook }) => {
  const dispatch = useDispatch();
  const { reels, loading, error } = useSelector((state) => state.reels);
  const { user } = useSelector((state) => state.auth);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  // Active Tab: 'trending' or 'bridal'
  const [activeTab, setActiveTab] = useState('trending');

  // Modal States
  const [activeCommentsReel, setActiveCommentsReel] = useState(null);
  const [activeShareReel, setActiveShareReel] = useState(null);
  const [activeBookReel, setActiveBookReel] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Transition Lock for ultra smooth 60fps sliding
  const isTransitioning = useRef(false);

  // Touch Swipe tracking
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const lastScrollTime = useRef(0);

  // Fetch Reels whenever activeTab changes
  useEffect(() => {
    dispatch(
      fetchReels({
        sort: 'trending',
        tag: activeTab === 'bridal' ? 'bridal' : undefined,
        page: 1,
        limit: 20,
      })
    );
    setCurrentIndex(0);
  }, [dispatch, activeTab]);

  // Navigate to Next Reel with smooth lock
  const handleNextReel = useCallback(() => {
    if (reels.length === 0 || isTransitioning.current) return;
    if (currentIndex + 1 < reels.length) {
      isTransitioning.current = true;
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {
        isTransitioning.current = false;
      }, 380);
    }
  }, [reels.length, currentIndex]);

  // Navigate to Previous Reel with smooth lock
  const handlePrevReel = useCallback(() => {
    if (reels.length === 0 || isTransitioning.current) return;
    if (currentIndex > 0) {
      isTransitioning.current = true;
      setCurrentIndex((prev) => prev - 1);
      setTimeout(() => {
        isTransitioning.current = false;
      }, 380);
    }
  }, [reels.length, currentIndex]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === 0 || touchEndY.current === 0) return;
    const diff = touchStartY.current - touchEndY.current;
    const SWIPE_THRESHOLD = 50;

    if (diff > SWIPE_THRESHOLD) {
      handleNextReel();
    } else if (diff < -SWIPE_THRESHOLD) {
      handlePrevReel();
    }
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  // Mouse Wheel scroll support with throttle
  const handleWheel = useCallback(
    (e) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 400) return;

      if (Math.abs(e.deltaY) > 25) {
        lastScrollTime.current = now;
        if (e.deltaY > 0) {
          handleNextReel();
        } else {
          handlePrevReel();
        }
      }
    },
    [handleNextReel, handlePrevReel]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNextReel();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrevReel();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextReel, handlePrevReel]);

  const containerRef = useRef(null);

  // Prevent mobile pull-to-refresh gesture completely while allowing swipe
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNativeTouchMove = (e) => {
      // Prevents mobile Chrome/Safari pull-to-refresh on downward drag
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    el.addEventListener('touchmove', handleNativeTouchMove, { passive: false });
    return () => {
      el.removeEventListener('touchmove', handleNativeTouchMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full h-[calc(100dvh-3.8rem)] md:h-[calc(100vh-4.5rem)] bg-black text-white flex items-center justify-center overflow-hidden select-none p-0 md:py-2 relative overscroll-none overscroll-y-none disable-pull-to-refresh"
      style={{
        overscrollBehavior: 'none',
        overscrollBehaviorY: 'none',
        touchAction: 'none',
      }}
    >
      {/* Instagram Reel Main Container */}
      <div className="relative w-full h-full md:max-w-[400px] md:aspect-[9/16] md:max-h-[84vh] bg-[#0A0506] md:rounded-3xl overflow-hidden md:border-2 md:border-[#D4AF37]/40 shadow-2xl flex items-center justify-center overscroll-none overscroll-y-none">
        
        {/* FIXED Top Floating Tab Switcher (Trending | Bridal) - Anchored at the top */}
        <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <div className="flex items-center gap-5 px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            {/* Trending Tab */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('trending');
              }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className={`relative py-1 text-xs sm:text-sm font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'trending'
                  ? 'text-white scale-105 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${activeTab === 'trending' ? 'text-[#E25822]' : ''}`} />
              <span>Trending</span>
              {activeTab === 'trending' && (
                <span className="absolute -bottom-1 inset-x-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#FFFDF9] rounded-full shadow-[0_0_8px_#D4AF37]" />
              )}
            </button>

            <span className="w-px h-3.5 bg-white/20" />

            {/* Bridal Tab */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('bridal');
              }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className={`relative py-1 text-xs sm:text-sm font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bridal'
                  ? 'text-white scale-105 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Crown className={`w-3.5 h-3.5 ${activeTab === 'bridal' ? 'text-[#D4AF37]' : ''}`} />
              <span>Bridal</span>
              {activeTab === 'bridal' && (
                <span className="absolute -bottom-1 inset-x-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#FFFDF9] rounded-full shadow-[0_0_8px_#D4AF37]" />
              )}
            </button>
          </div>
        </div>

        {/* Content Loading & Video Player */}
        {loading && reels.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 text-white">
            <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
            <span className="font-royal text-base font-bold text-[#D4AF37]">
              Loading Reels...
            </span>
          </div>
        ) : error && reels.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 text-white">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-royal text-base font-bold">Unable to Load Reels</h3>
            <button
              onClick={() =>
                dispatch(
                  fetchReels({
                    sort: 'trending',
                    tag: activeTab === 'bridal' ? 'bridal' : undefined,
                    page: 1,
                    limit: 20,
                  })
                )
              }
              className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#2A0C0E] font-bold text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : reels.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 text-white">
            <Sparkles className="w-8 h-8 text-[#D4AF37]" />
            <h3 className="font-royal text-base font-bold">No Reels Available</h3>
            <button
              onClick={() => setActiveTab('trending')}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#2A0C0E] font-bold text-xs cursor-pointer"
            >
              Back to Trending
            </button>
          </div>
        ) : (
          /* Smooth Hardware-Accelerated Vertical Sliding Reels Container */
          <div className="w-full h-full relative overflow-hidden">
            <div
              className="w-full h-full flex flex-col transform-gpu"
              style={{
                transform: `translate3d(0, -${currentIndex * 100}%, 0)`,
                transition: 'transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                willChange: 'transform',
              }}
            >
              {reels.map((reel, idx) => {
                const isActive = idx === currentIndex;

                return (
                  <div key={reel._id} className="w-full h-full shrink-0 flex-none relative">
                    <ReelItem
                      reel={reel}
                      isActive={isActive}
                      isMuted={isMuted}
                      onToggleMute={() => setIsMuted(!isMuted)}
                      onOpenComments={(r) => setActiveCommentsReel(r)}
                      onOpenShare={(r) => setActiveShareReel(r)}
                      onBookDesign={(r) => setActiveBookReel(r)}
                      onTagClick={(tag) => {
                        if (tag.toLowerCase().includes('bridal')) {
                          setActiveTab('bridal');
                        }
                      }}
                      currentUser={user}
                      onRequireAuth={() => setIsAuthModalOpen(true)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Desktop Navigation Floating Arrows */}
            <div className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 flex-col gap-2 z-40 pointer-events-auto">
              <button
                onClick={handlePrevReel}
                disabled={currentIndex === 0}
                className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-transform active:scale-90 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed border border-white/10 shadow-lg"
                title="Previous Reel"
                aria-label="Previous reel"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextReel}
                disabled={currentIndex === reels.length - 1}
                className="p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-transform active:scale-90 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed border border-white/10 shadow-lg"
                title="Next Reel"
                aria-label="Next reel"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reel Comments Drawer */}
      <ReelCommentsModal
        isOpen={!!activeCommentsReel}
        onClose={() => setActiveCommentsReel(null)}
        reelId={activeCommentsReel?._id}
        reelTitle={activeCommentsReel?.title}
        currentUser={user}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Reel Share Sheet (WhatsApp & Instagram & Copy) */}
      <ReelShareModal
        isOpen={!!activeShareReel}
        onClose={() => setActiveShareReel(null)}
        reel={activeShareReel}
      />

      {/* Reel Direct Booking Modal */}
      <ReelBookModal
        isOpen={!!activeBookReel}
        onClose={() => setActiveBookReel(null)}
        reel={activeBookReel}
        currentUser={user}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
};

export default ReelsPage;
