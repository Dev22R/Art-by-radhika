import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Heart,
  Clock,
  Crown,
  Share2,
  Check,
  ChevronLeft,
  ShieldCheck,
  Award,
  Layers,
  Tag,
  CheckCircle2,
  ArrowRight,
  Play,
  Video,
} from 'lucide-react';
import {
  fetchDesignBySlug,
  fetchDesigns,
  toggleLikeDesign,
  updateDesignLikesLocally,
} from '../redux/slices/designSlice';
import { toast } from 'sonner';

export const DesignDetailPage = ({
  onBookDesign,
  favorites = [],
  onToggleLike,
  onOpenAuth,
}) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentDesign, detailLoading, error, designs, relatedDesigns: apiRelatedDesigns } = useSelector(
    (state) => state.designs
  );

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'motifs' | 'guarantee'
  const [isLiking, setIsLiking] = useState(false);

  // Fetch design by slug / id whenever URL param changes
  useEffect(() => {
    setActiveMediaIndex(0);
    setActiveTab('overview');
    if (slug) {
      dispatch(fetchDesignBySlug(slug));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [dispatch, slug]);

  // Ensure designs list is populated for related items
  useEffect(() => {
    if (!designs || designs.length === 0) {
      dispatch(fetchDesigns());
    }
  }, [dispatch, designs]);

  // Current design resolution with instant Redux state fallback
  const design =
    currentDesign &&
    (currentDesign.slug === slug || currentDesign._id === slug || currentDesign.id === slug)
      ? currentDesign
      : (designs || []).find((d) => d.slug === slug || d._id === slug || d.id === slug) ||
        null;

  const isLiked =
    design &&
    (favorites.includes(design.id) ||
      favorites.includes(design._id) ||
      design.isLiked);

  // Like / Unlike action with Auth verification
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first to add this design to your mood board! ✨');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!design) return;
    setIsLiking(true);

    try {
      const designId = design._id || design.id;
      dispatch(toggleLikeDesign(designId));

      if (onToggleLike) {
        onToggleLike(designId);
      }

      dispatch(
        updateDesignLikesLocally({
          designId,
          increment: !isLiked,
        })
      );

      if (!isLiked) {
        toast.success('Added to your favorite bridal inspiration! ❤️');
      } else {
        toast.info('Removed from saved designs');
      }
    } catch {
      toast.error('Could not update favorite state');
    } finally {
      setIsLiking(false);
    }
  };

  // Mobile Native Share + Clipboard fallback
  const handleShare = async () => {
    if (!design) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${design.title} | Art By Radhika Royal Henna`,
          text: `Explore this handcrafted bridal henna masterpiece "${design.title}" on Art By Radhika.`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          // fallback to clipboard
        }
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Design link copied to clipboard! 📋');
    }
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      toast.error('Please login first to reserve your bridal date & consultation! ✨');
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (onBookDesign && design) {
      onBookDesign(design);
    }
  };

  const fallbackImage =
    design?.fallbackImage ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80';

  const videoUrl =
    design?.video?.url || (typeof design?.video === 'string' ? design.video : null);

  // Prepare unified media list (images + video)
  const mediaItems = useMemo(() => {
    if (!design) return [];
    const list = [];

    // 1. Add images
    if (Array.isArray(design.images) && design.images.length > 0) {
      const sorted = [...design.images].sort((a, b) => {
        if (a.isCover) return -1;
        if (b.isCover) return 1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      });

      sorted.forEach((img, idx) => {
        const url = typeof img === 'string' ? img : img.url;
        if (url) {
          list.push({
            id: img._id || `img-${idx}`,
            type: 'image',
            url,
            isCover: !!img.isCover,
          });
        }
      });
    } else if (design.image || design.coverImage) {
      list.push({
        id: 'img-main',
        type: 'image',
        url: design.image || design.coverImage,
        isCover: true,
      });
    }

    // 2. Add video if present
    if (videoUrl) {
      list.push({
        id: 'video-main',
        type: 'video',
        url: videoUrl,
        poster: design.coverImage || design.image || (list[0]?.url ?? fallbackImage),
      });
    }

    if (list.length === 0) {
      list.push({
        id: 'img-fallback',
        type: 'image',
        url: fallbackImage,
        isCover: true,
      });
    }

    return list;
  }, [design, videoUrl, fallbackImage]);

  const currentMedia = mediaItems[activeMediaIndex] || mediaItems[0];
  const videoMediaIndex = mediaItems.findIndex((m) => m.type === 'video');

  // Related designs from API or Redux store
  const relatedList =
    apiRelatedDesigns && apiRelatedDesigns.length > 0
      ? apiRelatedDesigns
      : (designs || [])
          .filter(
            (d) =>
              d.slug !== slug &&
              d._id !== design?._id &&
              d.id !== design?.id &&
              (d.category === design?.category || d.categoryName === design?.categoryName || !design?.category)
          )
          .slice(0, 4);

  // Format Placement text
  const placementText = useMemo(() => {
    if (!design?.placement) return design?.hands || 'Full Arm';
    if (Array.isArray(design.placement)) {
      return design.placement
        .map((p) =>
          typeof p === 'string'
            ? p.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
            : p
        )
        .join(', ');
    }
    if (typeof design.placement === 'string') {
      return design.placement.replace(/_/g, ' ');
    }
    return 'Full Arm';
  }, [design]);

  // Loading Skeleton State
  if (detailLoading && !design) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-36 bg-[#D4AF37]/20 rounded-full" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            <div className="lg:col-span-6 h-[380px] sm:h-[480px] bg-[#4A151B]/10 rounded-3xl" />
            <div className="lg:col-span-6 space-y-4">
              <div className="h-5 w-24 bg-[#D4AF37]/20 rounded-full" />
              <div className="h-9 w-3/4 bg-[#4A151B]/15 rounded-xl" />
              <div className="h-20 w-full bg-[#D4AF37]/15 rounded-2xl" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-[#4A151B]/10 rounded-2xl" />
                <div className="h-16 bg-[#4A151B]/10 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!detailLoading && !design) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-[#8A3324]/10 text-[#8A3324] flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <h2 className="font-royal text-2xl sm:text-3xl font-bold text-[#4A151B]">
          Design Masterpiece Not Found
        </h2>
        <p className="text-xs sm:text-sm text-[#4A151B]/70 max-w-md mx-auto">
          {error || 'The requested bridal henna pattern could not be found or has been moved.'}
        </p>
        <button
          onClick={() => navigate('/designs')}
          className="px-6 py-2.5 rounded-full bg-[#4A151B] text-[#FAF6F0] text-xs font-bold hover:bg-[#611C23] transition-colors cursor-pointer inline-flex items-center gap-2 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Lookbook</span>
        </button>
      </div>
    );
  }

  const effectiveSellingPrice = design.discountedPrice
    ? `₹${design.discountedPrice.toLocaleString('en-IN')}`
    : design.priceEstimate || `₹${design.price?.toLocaleString('en-IN') || '4,999'}`;

  const hasDiscount =
    design.discountedPrice && design.price && design.discountedPrice < design.price;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8 space-y-6 sm:space-y-10 pb-28 md:pb-16 select-none">
      {/* 1. App Header Navigation Bar */}
      <div className="flex items-center justify-between gap-2 bg-[#FAF6F0]/80 backdrop-blur-md py-2 px-1 rounded-2xl sticky top-16 md:top-20 z-30 border border-[#D4AF37]/20 shadow-xs">
        <button
          onClick={() => (window.history.length > 2 ? navigate(-1) : navigate('/designs'))}
          className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white hover:bg-[#F3ECE1] text-[#4A151B] border border-[#D4AF37]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-90"
          aria-label="Go Back"
        >
          <ChevronLeft className="w-4 h-4 text-[#8A3324]" />
          <span className="hidden sm:inline text-xs font-semibold">Lookbook</span>
        </button>

        {/* Center Breadcrumb Pill */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#8A3324] font-medium truncate max-w-[55vw] sm:max-w-xs">
          <span className="capitalize truncate font-semibold text-[#4A151B]">
            {design.title}
          </span>
          {design.subCategory && (
            <span className="hidden md:inline text-[#D4AF37]">• {design.subCategory}</span>
          )}
        </div>

        {/* Action Buttons: Share & Save */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="p-2 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-[#D4AF37]/40 text-[#4A151B] hover:bg-[#F3ECE1] transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Share Design"
          >
            <Share2 className="w-3.5 h-3.5 text-[#8A3324]" />
            <span className="hidden sm:inline">Share</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleLikeToggle}
            disabled={isLiking}
            className={`p-2 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              isLiked
                ? 'bg-[#E63946] text-white shadow-md'
                : 'bg-white border border-[#D4AF37]/40 text-[#4A151B] hover:bg-[#F3ECE1]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white text-white' : 'text-[#E63946]'}`} />
            <span className="hidden sm:inline">{isLiked ? 'Saved' : 'Save'}</span>
            {design.likes > 0 && <span className="text-[11px] opacity-90">({design.likes})</span>}
          </motion.button>
        </div>
      </div>

      {/* 2. Main Two-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Left Column: Mobile App Gallery Showcase */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Main Media Showcase Box */}
          <div className="relative h-[340px] sm:h-[450px] md:h-[500px] w-full rounded-3xl overflow-hidden bg-[#1A0A0C] border-2 border-[#D4AF37]/40 shadow-xl flex items-center justify-center group">
            <AnimatePresence mode="wait">
              {currentMedia?.type === 'video' ? (
                /* Native Video Player */
                <motion.div
                  key="video-player"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full h-full flex items-center justify-center bg-black"
                >
                  <video
                    key={currentMedia.url}
                    src={currentMedia.url}
                    poster={currentMedia.poster}
                    controls
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              ) : (
                /* Image Showcase with Ambient Backdrop */
                <motion.div
                  key={currentMedia?.url}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full h-full flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={currentMedia?.url || fallbackImage}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                  />
                  <img
                    src={currentMedia?.url || fallbackImage}
                    alt={design.title}
                    className="relative z-1 max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImage;
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subtle Gradient Shadow for readable overlay badges */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 opacity-90 pointer-events-none z-2" />

            {/* Top Badges Floating Over Media */}
            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between z-10">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1A0D0E]/85 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/40 shadow flex items-center gap-1">
                  <Crown className="w-3 h-3 text-[#D4AF37]" />
                  {design.style || design.categoryName || 'Bridal Henna'}
                </span>

                {design.designCode && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#4A151B]/90 backdrop-blur-md text-[#FAF6F0] border border-white/20">
                    #{design.designCode}
                  </span>
                )}
              </div>

              {/* Video Quick Toggle / Complexity Pill */}
              <div className="flex items-center gap-1.5">
                {currentMedia?.type === 'video' ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8A3324] text-white border border-[#D4AF37]/50 shadow flex items-center gap-1">
                    <Video className="w-3 h-3 text-[#D4AF37]" />
                    <span>Video Playing</span>
                  </span>
                ) : videoMediaIndex !== -1 ? (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setActiveMediaIndex(videoMediaIndex)}
                    className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#D4AF37] text-[#2A0C0E] hover:bg-[#F1DF96] transition-all shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-[#2A0C0E]" />
                    <span>Watch Video</span>
                  </motion.button>
                ) : null}

                {design.complexity && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FAF6F0]/90 text-[#4A151B] backdrop-blur-md shadow">
                    {design.complexity}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Overlay Info & Counter Pill */}
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between text-xs text-white/95 z-10 pointer-events-none">
              <span className="flex items-center gap-1.5 font-medium bg-black/65 px-3 py-1 rounded-full backdrop-blur-md pointer-events-auto shadow-sm">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{design.estimatedTime || design.duration || '3 - 4 Hours'}</span>
              </span>

              {/* Media Index Pill (e.g. 2 / 8) */}
              <span className="font-semibold text-[11px] bg-black/65 px-2.5 py-1 rounded-full backdrop-blur-md text-[#D4AF37] pointer-events-auto border border-white/10">
                {currentMedia?.type === 'video' ? '🎬 Video' : `📷 ${activeMediaIndex + 1} / ${mediaItems.length}`}
              </span>
            </div>
          </div>

          {/* Media Thumbnails Row (Mobile Smooth Touch Slider) */}
          {mediaItems.length > 1 && (
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1 px-0.5">
              {mediaItems.map((item, idx) => {
                const isActive = activeMediaIndex === idx;
                return (
                  <motion.button
                    key={item.id || idx}
                    type="button"
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative w-15 h-15 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-[#1A0A0C] ${
                      isActive
                        ? 'border-[#D4AF37] scale-105 shadow-md ring-2 ring-[#D4AF37]/50'
                        : 'border-transparent opacity-65 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      /* Video Thumbnail */
                      <div className="relative w-full h-full bg-[#1A0A0C]">
                        <img
                          src={item.poster || fallbackImage}
                          alt="Video Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#2A0C0E] flex items-center justify-center shadow">
                            <Play className="w-2.5 h-2.5 fill-[#2A0C0E] ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[8px] font-bold text-center bg-black/80 text-[#D4AF37] rounded uppercase tracking-wider py-0.2">
                          Video
                        </span>
                      </div>
                    ) : (
                      /* Image Thumbnail */
                      <img
                        src={item.url}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackImage;
                        }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Title, Interactive Pricing & App Segmented Sheets */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-5">
          {/* Title & Badges */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#8A3324]/10 text-[#8A3324] text-[11px] font-bold uppercase tracking-wider">
                {design.categoryName || design.category || 'Bridal Collection'}
              </span>
              {design.subCategory && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#611C23] text-[11px] font-semibold">
                  {design.subCategory}
                </span>
              )}
            </div>

            <h1 className="font-royal text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4A151B] leading-tight">
              {design.title}
            </h1>

            {design.designCode && (
              <p className="text-[11px] font-mono text-[#8A3324]/80">
                Studio Pattern Reference: <strong>#{design.designCode}</strong>
              </p>
            )}
          </div>

          {/* Pricing Box (Desktop & Mobile Tablet) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F3ECE1] border-2 border-[#D4AF37]/35 shadow-sm space-y-3">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8A3324] tracking-wider block">
                  Artisan Investment
                </span>
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="font-royal text-2xl sm:text-3xl font-bold text-[#4A151B]">
                    {effectiveSellingPrice}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs sm:text-sm text-[#8A3324]/60 line-through">
                      ₹{design.price.toLocaleString('en-IN')}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20">
                      Save ₹{(design.price - design.discountedPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Desktop Direct Booking CTA */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBook}
                className="hidden md:flex py-3 px-6 rounded-full bg-gradient-to-r from-[#4A151B] to-[#8A3324] text-[#FAF6F0] hover:brightness-110 font-bold text-sm transition-all shadow-md items-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Reserve Consultation</span>
              </motion.button>
            </div>

            <div className="pt-2 border-t border-[#D4AF37]/15 flex items-center justify-between text-[11px] text-[#4A151B]/75">
              <span className="flex items-center gap-1 text-[#2D6A4F] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Organic Sojat Cones Included
              </span>
              <span className="text-[#8A3324] font-medium">Deep Stain Guarantee</span>
            </div>
          </div>

          {/* 3. Mobile App Segmented Tabs */}
          <div className="flex items-center bg-[#F3ECE1]/70 p-1 rounded-2xl border border-[#D4AF37]/25 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 text-center rounded-xl transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#4A151B] text-[#FFFDF9] shadow-xs'
                  : 'text-[#4A151B]/80 hover:text-[#4A151B]'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('motifs')}
              className={`flex-1 py-2 text-center rounded-xl transition-all cursor-pointer ${
                activeTab === 'motifs'
                  ? 'bg-[#4A151B] text-[#FFFDF9] shadow-xs'
                  : 'text-[#4A151B]/80 hover:text-[#4A151B]'
              }`}
            >
              Motifs &amp; Tags
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guarantee')}
              className={`flex-1 py-2 text-center rounded-xl transition-all cursor-pointer ${
                activeTab === 'guarantee'
                  ? 'bg-[#4A151B] text-[#FFFDF9] shadow-xs'
                  : 'text-[#4A151B]/80 hover:text-[#4A151B]'
              }`}
            >
              Guarantee
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="space-y-3">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Description Box */}
                <div className="p-4 rounded-2xl bg-white border border-[#D4AF37]/20 text-xs sm:text-sm text-[#4A151B]/85 leading-relaxed shadow-2xs">
                  {design.description}
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-white border border-[#D4AF37]/25 space-y-0.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8A3324] font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Duration</span>
                    </div>
                    <p className="font-royal font-bold text-xs sm:text-sm text-[#4A151B]">
                      {design.estimatedTime || design.duration || '3 - 4 Hours'}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#D4AF37]/25 space-y-0.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8A3324] font-semibold">
                      <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Density</span>
                    </div>
                    <p className="font-royal font-bold text-xs sm:text-sm text-[#4A151B] capitalize">
                      {design.complexity || 'Masterpiece'}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#D4AF37]/25 space-y-0.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8A3324] font-semibold">
                      <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Placement</span>
                    </div>
                    <p className="font-royal font-bold text-xs sm:text-sm text-[#4A151B] truncate">
                      {placementText}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-[#D4AF37]/25 space-y-0.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8A3324] font-semibold">
                      <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Stain Depth</span>
                    </div>
                    <p className="font-royal font-bold text-xs sm:text-sm text-[#4A151B]">
                      {design.stainDepth || 'Deep Mahogany (48h)'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'motifs' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-white border border-[#D4AF37]/20 space-y-3 shadow-2xs"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8A3324]">
                  <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Artisan Motifs &amp; Tags</span>
                </div>
                {design.motifs && design.motifs.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {design.motifs.map((motif, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/35 text-xs text-[#611C23] font-medium flex items-center gap-1.5 shadow-2xs"
                      >
                        <Check className="w-3 h-3 text-[#D4AF37]" />
                        <span className="capitalize">{motif}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#4A151B]/70">Traditional bridal elements handcrafted on order.</p>
                )}
                <div className="pt-2 border-t border-[#D4AF37]/15 text-[11px] text-[#4A151B]/75">
                  💡 <em>Custom bride-groom portraits, sacred vows, and love-story motifs can be incorporated on request.</em>
                </div>
              </motion.div>
            )}

            {activeTab === 'guarantee' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#D4AF37]/30 space-y-2.5 shadow-2xs text-xs"
              >
                <div className="flex items-center gap-2 text-[#4A151B] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Art by Radhika Royal Bridal Guarantee</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#4A151B]/80 pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                    <span>Triple-sifted 100% Organic Sojat Henna</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                    <span>Nilgiri &amp; Pure Eucalyptus Oil Mix</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                    <span>Rich 48-72h Mahogany Stain Promise</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                    <span>Complimentary Aftercare Herbal Balm</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Similar Inspirations (Touch Responsive Carousel on Mobile) */}
      {relatedList.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#D4AF37]/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-bold text-[#8A3324] tracking-widest block">
                Handcrafted Pairings
              </span>
              <h2 className="font-royal text-lg sm:text-2xl font-bold text-[#4A151B]">
                More from {design.categoryName || 'This Collection'}
              </h2>
            </div>
            <Link
              to="/designs"
              className="text-xs font-bold text-[#8A3324] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto no-scrollbar pb-2">
            {relatedList.map((rel) => {
              const relSlug = rel.slug || rel._id || rel.id;
              const relImage = rel.coverImage || rel.image || fallbackImage;
              const relPrice =
                rel.discountedPrice
                  ? `₹${rel.discountedPrice.toLocaleString('en-IN')}`
                  : rel.priceEstimate || (rel.price ? `₹${rel.price.toLocaleString('en-IN')}` : '₹4,999');

              return (
                <motion.div
                  key={rel.id || rel._id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/designs/${relSlug}`)}
                  className="w-56 sm:w-64 md:w-auto shrink-0 group bg-[#FFFDF9] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-[#1A0A0C] overflow-hidden flex items-center justify-center">
                    <img
                      src={relImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1A0D0E]/80 text-[#D4AF37] border border-[#D4AF37]/30 backdrop-blur-xs">
                      {rel.complexity || rel.style || rel.categoryName || 'Bridal'}
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    <h4 className="font-royal text-xs sm:text-sm font-bold text-[#4A151B] line-clamp-1 group-hover:text-[#8A3324] transition-colors">
                      {rel.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#D4AF37]/15">
                      <span className="text-[#8A3324] font-semibold">
                        {rel.estimatedTime || rel.duration || '3 - 4h'}
                      </span>
                      <span className="font-royal font-bold text-[#4A151B]">
                        {relPrice}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Sticky Bottom Action Bar for Mobile Devices (Native App Feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-xl border-t border-[#D4AF37]/35 px-4 py-3 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[9px] uppercase font-bold text-[#8A3324] tracking-wider block">
            Bridal Price
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-royal text-xl font-bold text-[#4A151B]">
              {effectiveSellingPrice}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-[#8A3324]/60 line-through">
                ₹{design.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleBook}
          className="flex-1 max-w-[200px] py-3 px-4 rounded-full bg-gradient-to-r from-[#4A151B] via-[#611C23] to-[#8A3324] text-[#FAF6F0] font-bold text-xs shadow-lg border border-[#D4AF37]/50 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Book This Look</span>
        </motion.button>
      </div>
    </div>
  );
};
