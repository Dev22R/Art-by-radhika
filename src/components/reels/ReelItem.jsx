import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Crown,
  Sparkles,
  Music,
  CheckCircle2,
} from 'lucide-react';
import { toggleLikeReel, optimisticToggleLike } from '../../redux/slices/reelsSlice';
import { reelsService } from '../../services/api';
import { toast } from 'sonner';

export const ReelItem = ({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onOpenComments,
  onOpenShare,
  onBookDesign,
  onTagClick,
  currentUser,
  onRequireAuth,
}) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const lastTapRef = useRef(0);

  // Watch Duration Tracking
  const watchDurationRef = useRef(0);
  const lastSentDurationRef = useRef(0);

  // Handle video autoplay & pause smoothly without blocking GPU slide transition
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let timeoutId;

    if (isActive) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            video.muted = true;
            video.play().catch(() => {});
            setIsPlaying(true);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
      timeoutId = setTimeout(() => {
        if (videoRef.current && !isActive) {
          try {
            videoRef.current.currentTime = 0;
          } catch {
            // ignore
          }
        }
      }, 400);
    }

    return () => clearTimeout(timeoutId);
  }, [isActive]);

  // Track watch duration every 3 seconds while active and playing
  useEffect(() => {
    if (!isActive || !reel?._id) {
      if (
        reel?._id &&
        watchDurationRef.current > lastSentDurationRef.current &&
        watchDurationRef.current >= 1
      ) {
        const finalDuration = Math.round(watchDurationRef.current);
        reelsService.trackView(reel._id, finalDuration).catch(() => {});
        lastSentDurationRef.current = finalDuration;
      }
      watchDurationRef.current = 0;
      lastSentDurationRef.current = 0;
      return;
    }

    watchDurationRef.current = 0;
    lastSentDurationRef.current = 0;

    // 1-second interval to accumulate watch time and ping view API every 3s
    const timer = setInterval(() => {
      if (isPlaying && videoRef.current && !videoRef.current.paused) {
        watchDurationRef.current += 1;

        // Every 3 seconds send the exact accumulated watch duration to backend
        if (watchDurationRef.current > 0 && watchDurationRef.current % 3 === 0) {
          const durationToSend = Math.round(watchDurationRef.current);
          lastSentDurationRef.current = durationToSend;
          reelsService.trackView(reel._id, durationToSend).catch(() => {});
        }
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      if (
        reel?._id &&
        watchDurationRef.current > lastSentDurationRef.current &&
        watchDurationRef.current >= 1
      ) {
        const finalDuration = Math.round(watchDurationRef.current);
        reelsService.trackView(reel._id, finalDuration).catch(() => {});
        lastSentDurationRef.current = finalDuration;
      }
    };
  }, [isActive, isPlaying, reel?._id]);

  // Sync mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Gapless Smooth Looping & Progress
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      const current = video.currentTime;
      const total = video.duration;
      setProgress((current / total) * 100);

      // Gapless instant loop restart right before video end
      if (total > 0 && current >= total - 0.05) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    }
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (video && isActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleLike = (e) => {
    e?.stopPropagation?.();
    if (!currentUser) {
      toast.error('Please login to like reels! ❤️');
      onRequireAuth?.();
      return;
    }

    dispatch(optimisticToggleLike(reel._id));
    dispatch(toggleLikeReel(reel._id));

    if (!reel.isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
  };

  // Double tap to like (Instagram gesture)
  const handleVideoTouch = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!reel.isLiked) {
        handleLike(e);
      } else {
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 900);
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      togglePlayPause();
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0A0506] flex items-center justify-center select-none overflow-hidden group transform-gpu">
      {/* HTML5 Video Player with GPU hardware acceleration & gapless loop */}
      <video
        ref={videoRef}
        src={reel.video?.url}
        poster={reel.thumbnail?.url}
        preload={isActive ? 'auto' : 'metadata'}
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onClick={handleVideoTouch}
        className="w-full h-full object-cover cursor-pointer transform-gpu"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      />

      {/* Top Playback Progress Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-white/20 z-30 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFFDF9] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Center Play/Pause Indicator Icon */}
      {!isPlaying && (
        <div
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/35 z-20 cursor-pointer animate-in fade-in duration-150"
        >
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/50 flex items-center justify-center text-white shadow-2xl">
            <Play className="w-8 h-8 fill-white ml-1 text-white" />
          </div>
        </div>
      )}

      {/* Double-tap animated heart burst */}
      {showHeartBurst && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-in zoom-in-50 fade-in duration-300">
          <div className="relative">
            <Heart className="w-24 h-24 sm:w-28 sm:h-28 text-[#E63946] fill-[#E63946] drop-shadow-[0_0_25px_rgba(230,57,70,0.8)] animate-bounce" />
            <Sparkles className="w-7 h-7 text-[#D4AF37] absolute -top-2 -right-2 animate-spin" />
          </div>
        </div>
      )}

      {/* Right Actions Bar (Instagram Reels Floating Column - No count numbers) */}
      <div
        className="absolute right-2.5 sm:right-3.5 bottom-12 sm:bottom-14 z-30 flex flex-col items-center gap-4 text-white pointer-events-auto"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLike(e);
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-75 cursor-pointer shadow-lg ${
            reel.isLiked
              ? 'bg-[#E63946] text-white shadow-[#E63946]/40 scale-105'
              : 'bg-black/50 hover:bg-black/70 text-white border border-white/10'
          }`}
          aria-label="Like reel"
        >
          <Heart
            className={`w-6 h-6 transition-colors ${
              reel.isLiked ? 'fill-white text-white' : 'text-white'
            }`}
          />
        </button>

        {/* Comment Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments(reel);
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white transition-transform active:scale-75 cursor-pointer shadow-lg"
          aria-label="Open comments"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>

        {/* Share Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenShare(reel);
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="p-3 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white transition-transform active:scale-75 cursor-pointer shadow-lg"
          aria-label="Share reel"
        >
          <Share2 className="w-6 h-6 text-white" />
        </button>

        {/* Book Design Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookDesign(reel);
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="p-3 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#E2C45E] to-[#F1DF96] text-[#2A0C0E] shadow-xl hover:scale-110 active:scale-90 transition-all cursor-pointer border-2 border-white/40 animate-pulse"
          title="Book This Design"
        >
          <Crown className="w-6 h-6 text-[#2A0C0E] fill-[#2A0C0E]" />
        </button>
      </div>

      {/* Bottom Information Overlay (Instagram Reels Style - Well-adjusted padding) */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent z-20 space-y-2 pointer-events-auto pr-16 sm:pr-20 pb-4 sm:pb-5">
        {/* Artist Profile Header */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8A3324] p-0.5 shadow-md shrink-0">
            <div className="w-full h-full rounded-full bg-[#1A0D0E] flex items-center justify-center text-[#D4AF37] font-bold text-xs">
              R
            </div>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-royal text-xs sm:text-sm font-bold text-white truncate">
              Art-BY-radhika
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]/20 shrink-0" />
            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] shrink-0">
              Master Artist
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-royal text-sm sm:text-base font-bold text-white drop-shadow-md leading-tight">
          {reel.title}
        </h3>

        {/* Description with Expand/Collapse */}
        {reel.description && (
          <div className="text-xs text-white/85 leading-relaxed">
            <p className={isDescExpanded ? 'line-clamp-none' : 'line-clamp-2'}>
              {reel.description}
            </p>
            {reel.description.length > 70 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescExpanded(!isDescExpanded);
                }}
                className="text-[10px] sm:text-[11px] font-bold text-[#D4AF37] hover:underline mt-0.5 cursor-pointer block"
              >
                {isDescExpanded ? 'Show less' : '...more'}
              </button>
            )}
          </div>
        )}

        {/* Tags Row */}
        {reel.tags && reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {reel.tags.map((tag, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="text-[9px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] text-white/80 backdrop-blur-xs border border-white/10 transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
