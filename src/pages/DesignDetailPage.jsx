import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sparkles,
  Heart,
  Clock,
  Crown,
  Share2,
  Check,
  ChevronLeft,
  Calendar,
  ShieldCheck,
  Award,
  Layers,
  Tag,
  MapPin,
  Eye,
  RefreshCw,
  Phone,
  CheckCircle2,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  fetchDesignBySlug,
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
  const { currentDesign, detailLoading, error, designs } = useSelector(
    (state) => state.designs
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Fetch design by slug / id whenever URL param changes
  useEffect(() => {
    if (slug) {
      dispatch(fetchDesignBySlug(slug));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [dispatch, slug]);

  const design = currentDesign;
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
      // Trigger Redux async thunk
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

  // Share action
  const handleShare = () => {
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

  // Related designs from redux store if available
  const relatedDesigns = (designs || [])
    .filter(
      (d) =>
        (d.slug !== slug && d._id !== design?._id) &&
        (d.category === design?.category || d.categoryName === design?.categoryName)
    )
    .slice(0, 4);

  // Loading Skeleton State
  if (detailLoading && !design) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-36 bg-gray-200 rounded-full" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-6 h-96 sm:h-[480px] bg-gray-200 rounded-3xl" />
            <div className="lg:col-span-6 space-y-5">
              <div className="h-5 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-3/4 bg-gray-200 rounded-xl" />
              <div className="h-6 w-1/3 bg-gray-200 rounded" />
              <div className="h-24 w-full bg-gray-200 rounded-2xl" />
              <div className="h-14 w-full bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found or Error State
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
          className="px-6 py-2.5 rounded-full bg-[#4A151B] text-[#FAF6F0] text-xs font-bold hover:bg-[#611C23] transition-colors cursor-pointer inline-flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </button>
      </div>
    );
  }

  // Prepare images list
  const allImages =
    design.images && design.images.length > 0
      ? design.images.map((img) => (typeof img === 'string' ? img : img.url)).filter(Boolean)
      : [design.image || design.coverImage];

  const currentImage = allImages[activeImageIndex] || allImages[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 pb-20">
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#8A3324]">
          <Link
            to="/designs"
            className="hover:underline flex items-center gap-1 font-semibold text-[#4A151B]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Henna Lookbook</span>
          </Link>

        </div>

        {/* Share & Like Action Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-full bg-white border border-[#D4AF37]/40 text-[#4A151B] hover:bg-[#F3ECE1] transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Share Design"
          >
            <Share2 className="w-3.5 h-3.5 text-[#8A3324]" />
            <span>Share</span>
          </button>

          <button
            onClick={handleLikeToggle}
            disabled={isLiking}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${isLiked
              ? 'bg-[#E63946] text-white'
              : 'bg-white border border-[#D4AF37]/40 text-[#4A151B] hover:bg-[#F3ECE1]'
              }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : 'text-[#E63946]'}`} />
            <span>{isLiked ? 'Saved' : 'Save Design'}</span>

          </button>
        </div>
      </div>

      {/* Main Two-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Showcase with Complete Uncropped View & Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Showcase Image */}
          <div className="relative h-[360px] sm:h-[460px] md:h-[520px] w-full rounded-3xl overflow-hidden bg-[#1A0A0C] border-2 border-[#D4AF37]/40 shadow-xl flex items-center justify-center group">
            {/* Ambient Blurred Backdrop */}
            <img
              src={currentImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
            />

            {/* Complete Uncropped Foreground Image */}
            <img
              src={currentImage}
              alt={design.title}
              className="relative z-1 max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  design.fallbackImage ||
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80';
              }}
            />

            {/* Subtle Gradient Shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-80 pointer-events-none z-2" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex flex-wrap gap-1.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1A0D0E]/85 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/40 shadow flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {design.style || design.categoryName || 'Bridal Henna'}
                </span>

                {design.designCode && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#4A151B]/90 backdrop-blur-md text-[#FAF6F0] border border-white/20">
                    Code: {design.designCode}
                  </span>
                )}
              </div>

              {design.complexity && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#2A0C0E] shadow">
                  {design.complexity}
                </span>
              )}
            </div>

            {/* Bottom Floating Stats */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/95 z-10">
              <span className="flex items-center gap-1.5 font-medium bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                {design.duration || design.estimatedTime || '3 - 4 Hours'}
              </span>

              <span className="font-royal font-bold text-sm text-[#D4AF37] bg-black/70 px-3.5 py-1 rounded-full backdrop-blur-sm">
                {design.priceEstimate}
              </span>
            </div>
          </div>

          {/* Multiple Image Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-[#1A0A0C] ${activeImageIndex === idx
                    ? 'border-[#D4AF37] scale-105 shadow-md ring-2 ring-[#D4AF37]/40'
                    : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specifications, Motifs & Booking Action */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Title & Categories */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-[#8A3324]/10 text-[#8A3324] text-xs font-bold uppercase tracking-wider">
                {design.categoryName || design.category || 'Bridal Collection'}
              </span>
              {design.subcategoryName && (
                <span className="px-3 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#611C23] text-xs font-semibold">
                  {design.subcategoryName}
                </span>
              )}
            </div>

            <h1 className="font-royal text-2xl sm:text-4xl font-bold text-[#4A151B] leading-tight">
              {design.title}
            </h1>

            {design.designCode && (
              <p className="text-xs font-mono text-[#8A3324]">
                Exclusive Artisan Identification: <strong>#{design.designCode}</strong>
              </p>
            )}
          </div>

          {/* Pricing Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFFDF9] to-[#F3ECE1] border-2 border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8A3324] tracking-wider block">
                Estimated Investment
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-royal text-2xl sm:text-3xl font-bold text-[#4A151B]">
                  {design.priceEstimate}
                </span>
                {design.discountedPrice && design.price && design.discountedPrice !== design.price && (
                  <span className="text-xs text-[#8A3324]/60 line-through">
                    ₹{design.discountedPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#4A151B]/70 mt-0.5">
                Includes organic 100% natural henna cones &amp; aftercare oil kit.
              </p>
            </div>

            <button
              onClick={handleBook}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#4A151B] to-[#8A3324] text-[#FAF6F0] hover:brightness-110 font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Book This Look</span>
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A3324] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
              Artisan Vision &amp; Details
            </h3>
            <p className="text-xs sm:text-sm text-[#4A151B]/85 leading-relaxed bg-white/70 p-4 rounded-2xl border border-[#D4AF37]/20">
              {design.description}
            </p>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-[#D4AF37]/30 space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-[#8A3324] font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Est. Application Time</span>
              </div>
              <p className="font-royal font-bold text-sm text-[#4A151B]">
                {design.duration || design.estimatedTime || '3 - 4 Hours'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#D4AF37]/30 space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-[#8A3324] font-semibold">
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Design Density</span>
              </div>
              <p className="font-royal font-bold text-sm text-[#4A151B] capitalize">
                {design.complexity || 'Masterpiece Heavy'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#D4AF37]/30 space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-[#8A3324] font-semibold">
                <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Coverage / Placement</span>
              </div>
              <p className="font-royal font-bold text-sm text-[#4A151B] capitalize">
                {Array.isArray(design.placement)
                  ? design.placement.join(', ').replace(/_/g, ' ')
                  : design.hands || 'Full Arm'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#D4AF37]/30 space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs text-[#8A3324] font-semibold">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Expected Stain Depth</span>
              </div>
              <p className="font-royal font-bold text-sm text-[#4A151B]">
                {design.stainDepth || 'Deep Mahogany (48h)'}
              </p>
            </div>
          </div>

          {/* Signatures & Motifs Tags */}
          {design.motifs && design.motifs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A3324] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                Motifs &amp; Elements
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {design.motifs.map((motif, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-white border border-[#D4AF37]/30 text-xs text-[#611C23] font-medium flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3 h-3 text-[#D4AF37]" />
                    <span className="capitalize">{motif}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Studio Guarantee Cards */}
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#D4AF37]/30 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#4A151B] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
              <span>Art by Radhika Bridal Guarantee</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#4A151B]/80 pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Triple-filtered Sojat Henna</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Chemical-free &amp; Pure Eucalyptus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Custom bride-groom portraits</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Complimentary bridal aftercare</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related / Similar Masterpieces */}
      {relatedDesigns.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-[#D4AF37]/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-[#8A3324] tracking-widest block">
                Similar Inspirations
              </span>
              <h2 className="font-royal text-xl sm:text-2xl font-bold text-[#4A151B]">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedDesigns.map((rel) => (
              <div
                key={rel.id || rel._id}
                onClick={() => navigate(`/designs/${rel.slug || rel._id || rel.id}`)}
                className="group bg-[#FFFDF9] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-48 w-full bg-[#1A0A0C] overflow-hidden flex items-center justify-center">
                  <img
                    src={rel.image}
                    alt={rel.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1A0D0E]/80 text-[#D4AF37] border border-[#D4AF37]/30">
                    {rel.style || rel.categoryName}
                  </div>
                </div>

                <div className="p-3.5 space-y-1.5">
                  <h4 className="font-royal text-sm font-bold text-[#4A151B] line-clamp-1 group-hover:text-[#8A3324] transition-colors">
                    {rel.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#D4AF37]/20">
                    <span className="text-[#8A3324] font-semibold">{rel.duration}</span>
                    <span className="font-royal font-bold text-[#4A151B]">
                      {rel.priceEstimate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
