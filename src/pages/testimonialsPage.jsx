import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import {
    Crown,
    Star,
    Sparkles,
    ArrowLeft,
    Quote,
    CheckCircle2,
    Calendar,
    Heart,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Play,
    Pause,
} from 'lucide-react';
import { format } from 'date-fns';
import { fetchTestimonials } from '../redux/slices/testimonialSlice';

export const TestimonialsPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        testimonials,
        stats,
        pagination,
        loading,
        loadingMore,
        hasMore,
    } = useSelector((state) => state.testimonials);

    const carouselRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const isHoveredRef = useRef(false);
    const isInteractingRef = useRef(false);
    const interactionTimeoutRef = useRef(null);

    // Sync ref with hover state so animation frame loop accesses it synchronously
    useEffect(() => {
        isHoveredRef.current = isHovered;
    }, [isHovered]);

    // Sentinel ref for infinite scroll
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        rootMargin: '150px',
    });

    // Initial load
    useEffect(() => {
        dispatch(fetchTestimonials({ page: 1, limit: 10, sort: 'latest' }));
    }, [dispatch]);

    // Infinite Scroll Trigger
    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore && testimonials.length > 0) {
            const nextPage = (pagination.page || 1) + 1;
            dispatch(fetchTestimonials({ page: nextPage, limit: 10, sort: 'latest' }));
        }
    }, [inView, hasMore, loading, loadingMore, pagination.page, testimonials.length, dispatch]);

    // Top 5 for the horizontal row
    const topFive = useMemo(() => {
        return testimonials.slice(0, 5);
    }, [testimonials]);

    // Duplicated list for seamless continuous infinite marquee scrolling
    const carouselItems = useMemo(() => {
        if (topFive.length > 1) {
            return [...topFive, ...topFive];
        }
        return topFive;
    }, [topFive]);

    // Remaining for the one-by-one list
    const remainingTestimonials = useMemo(() => {
        return testimonials.slice(5);
    }, [testimonials]);

    // Smooth Auto-scroll loop with pause-on-hover & touch handling
    useEffect(() => {
        const container = carouselRef.current;
        if (!container || topFive.length <= 1) return;

        let animId;
        let accumulatedScroll = container.scrollLeft;
        const speed = 0.65; // gentle, steady cinematic drift

        const step = () => {
            if (!isHoveredRef.current && !isInteractingRef.current && container) {
                const halfWidth = container.scrollWidth / 2;
                if (halfWidth > 0 && container.scrollLeft >= halfWidth - 1) {
                    container.scrollLeft = 0;
                    accumulatedScroll = 0;
                } else {
                    accumulatedScroll += speed;
                    container.scrollLeft = accumulatedScroll;

                    // Re-sync if user manually scrolled container
                    if (Math.abs(container.scrollLeft - accumulatedScroll) > 15) {
                        accumulatedScroll = container.scrollLeft;
                    }
                }
            } else if (container) {
                accumulatedScroll = container.scrollLeft;
            }

            animId = requestAnimationFrame(step);
        };

        animId = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(animId);
            if (interactionTimeoutRef.current) {
                clearTimeout(interactionTimeoutRef.current);
            }
        };
    }, [topFive]);

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'left' ? -340 : 340;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });

            // Pause auto-scroll briefly when arrow is clicked
            isInteractingRef.current = true;
            if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
            interactionTimeoutRef.current = setTimeout(() => {
                isInteractingRef.current = false;
            }, 3000);
        }
    };

    const handleTouchStart = () => {
        isInteractingRef.current = true;
        if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    };

    const handleTouchEnd = () => {
        if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
        interactionTimeoutRef.current = setTimeout(() => {
            isInteractingRef.current = false;
        }, 2500);
    };

    const getFallbackAvatar = (name) => {
        return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || 'Bride')}`;
    };

    const formatDateString = (dateStr) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'MMM d, yyyy');
        } catch {
            return '';
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#2C1810] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">



                {/* ========================================================================= */}
                {/* SECTION 1: TOP 5 TESTIMONIALS - SMOOTH AUTO-SCROLL ROW (PAUSES ON HOVER) */}
                {/* ========================================================================= */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                            <h2 className="font-royal text-lg sm:text-xl font-bold text-[#4A151B]">
                                Featured Bride Stories
                            </h2>

                            {/* Status pill showing auto-scroll / paused state */}
                            {topFive.length > 1 && (
                                <span
                                    className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${isHovered
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                        }`}
                                >
                                    {isHovered ? (
                                        <>
                                            <Pause className="w-2.5 h-2.5" />
                                            <span>Paused</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                            <span>Auto-scrolling</span>
                                        </>
                                    )}
                                </span>
                            )}
                        </div>

                        {/* Carousel Navigation Arrows (Desktop) */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => scrollCarousel('left')}
                                className="w-8 h-8 rounded-full bg-[#FFFDF9] border border-[#D4AF37]/30 hover:border-[#8A3324] text-[#4A151B] flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                                title="Scroll Left"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollCarousel('right')}
                                className="w-8 h-8 rounded-full bg-[#FFFDF9] border border-[#D4AF37]/30 hover:border-[#8A3324] text-[#4A151B] flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                                title="Scroll Right"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Horizontal Scroll Track Container with Hover & Touch Listeners */}
                    <div
                        ref={carouselRef}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0 cursor-grab active:cursor-grabbing select-none"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                        {loading && testimonials.length === 0 ? (
                            // Loading Skeletons
                            [1, 2, 3, 4, 5].map((n) => (
                                <div
                                    key={n}
                                    className="w-[280px] sm:w-[320px] shrink-0 bg-[#FFFDF9] rounded-2xl border border-[#D4AF37]/30 p-5 shadow-sm animate-pulse space-y-4"
                                >
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-4 h-4 bg-[#D4AF37]/30 rounded-full" />
                                        ))}
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                                    <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                                        <div className="space-y-1">
                                            <div className="h-4 bg-gray-200 rounded w-24" />
                                            <div className="h-3 bg-gray-200 rounded w-16" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : carouselItems.length > 0 ? (
                            carouselItems.map((t, idx) => {
                                const avatarUrl = t.avatar?.url || getFallbackAvatar(t.name);
                                const subtitle = [t.designation, t.company].filter(Boolean).join(' • ');

                                return (
                                    <div
                                        key={`${t._id || t.id || 't'}-${idx}`}
                                        className="w-[280px] sm:w-[330px] shrink-0 bg-[#FFFDF9] rounded-2xl border border-[#D4AF37]/40 p-5 shadow-sm hover:shadow-xl hover:border-[#D4AF37] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-4 relative group"
                                    >
                                        {/* Top Accent Icon & Rating */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-1">
                                                    {[...Array(t.rating || 5)].map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                                                    ))}
                                                </div>
                                                <Quote className="w-5 h-5 text-[#D4AF37]/35 rotate-180 group-hover:text-[#D4AF37] transition-colors" />
                                            </div>

                                            <p className="text-xs sm:text-sm text-[#4A151B]/85 italic leading-relaxed font-serif-elegant line-clamp-4">
                                                "{t.message}"
                                            </p>
                                        </div>

                                        {/* Author Bottom Section */}
                                        <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center gap-3">
                                            <img
                                                src={avatarUrl}
                                                alt={t.name}
                                                className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/50 shrink-0 shadow-inner"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = getFallbackAvatar(t.name);
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <h4 className="font-royal text-sm font-bold text-[#4A151B] truncate">
                                                        {t.name}
                                                    </h4>
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                                                </div>
                                                {subtitle && (
                                                    <p className="text-[11px] text-[#8A3324] truncate font-medium">
                                                        {subtitle}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full text-center py-8 text-xs text-[#4A151B]/60">
                                No featured stories yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* SECTION 2: REMAINING TESTIMONIALS - ONE BY ONE FEED (WITH INFINITE SCROLL) */}
                {/* ========================================================================= */}
                <div className="space-y-4 pt-4 sm:pt-6 border-t border-[#D4AF37]/25">
                    <div className="flex items-center justify-between">
                        <h2 className="font-royal text-lg sm:text-xl font-bold text-[#4A151B] flex items-center gap-2">
                            <Heart className="w-4 h-4 text-[#8A3324]" />
                            <span>All Reviews</span>
                        </h2>


                    </div>

                    {/* Testimonials List One by One */}
                    <div className="space-y-4">
                        {remainingTestimonials.length > 0 ? (
                            remainingTestimonials.map((t, idx) => {
                                const avatarUrl = t.avatar?.url || getFallbackAvatar(t.name);
                                const subtitle = [t.designation, t.company].filter(Boolean).join(' • ');
                                const formattedDate = formatDateString(t.createdAt);

                                return (
                                    <div
                                        key={t._id || t.id || idx}
                                        className="bg-[#FFFDF9] rounded-2xl border border-[#D4AF37]/35 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-3"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={avatarUrl}
                                                    alt={t.name}
                                                    className="w-11 h-11 rounded-full object-cover border border-[#D4AF37]/50 shrink-0"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = getFallbackAvatar(t.name);
                                                    }}
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <h3 className="font-royal text-base font-bold text-[#4A151B] truncate">
                                                            {t.name}
                                                        </h3>
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[10px] font-bold">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Verified Bride</span>
                                                        </span>
                                                    </div>

                                                    {subtitle && (
                                                        <p className="text-xs text-[#8A3324] font-medium truncate mt-0.5">
                                                            {subtitle}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end shrink-0">
                                                <div className="flex gap-0.5">
                                                    {[...Array(t.rating || 5)].map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                                                    ))}
                                                </div>
                                                {formattedDate && (
                                                    <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{formattedDate}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-xs sm:text-sm text-[#4A151B]/85 italic leading-relaxed font-serif-elegant pl-1">
                                            "{t.message}"
                                        </p>
                                    </div>
                                );
                            })
                        ) : testimonials.length <= 5 && !loading ? (
                            // If total reviews are 5 or fewer, all are shown in featured row above
                            <div className="bg-[#FFFDF9] rounded-2xl border border-[#D4AF37]/25 p-6 text-center text-xs text-[#4A151B]/70 space-y-1">
                                <p className="font-semibold text-[#4A151B]">
                                    All current stories are featured in the gallery above! ✨
                                </p>
                                <p>New reviews are added as brides celebrate their auspicious moments.</p>
                            </div>
                        ) : null}
                    </div>

                    {/* Infinite Scroll Trigger Sentinel & Loading State */}
                    <div ref={loadMoreRef} className="py-6 flex flex-col items-center justify-center text-center">
                        {loadingMore && (
                            <div className="flex items-center gap-2 text-xs font-bold text-[#8A3324] bg-white px-4 py-2 rounded-full border border-[#D4AF37]/30 shadow-sm animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                                <span>Loading more bride stories...</span>
                            </div>
                        )}

                        {!hasMore && testimonials.length > 5 && (
                            <div className="text-xs text-[#4A151B]/60 font-semibold flex items-center gap-1.5 py-4">
                                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>You've explored all our cherished bridal memories</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TestimonialsPage;
