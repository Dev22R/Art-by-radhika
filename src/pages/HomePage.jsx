import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Sparkles,
  Crown,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Star,
  Flame,
  ThumbsUp,
} from 'lucide-react';

import {
  PRICING_PACKAGES,
  STAIN_TIMELINE,
} from '../data/mehndiData';
import { fetchFaqs, voteFaqHelpful } from '../redux/slices/faqSlice';
import { fetchDesigns } from '../redux/slices/designSlice';
import { fetchTopTestimonials } from '../redux/slices/testimonialSlice';

export const HomePage = ({ setActiveTab, onOpenEnquiry, onSelectDesign, onOpenAuth }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { faqs, loading: faqsLoading, votingFaqId, userVotes } = useSelector(
    (state) => state.faqs
  );
  const { designs, loading: designsLoading } = useSelector((state) => state.designs);
  const { topTestimonials, topLoading } = useSelector((state) => state.testimonials);

  const [selectedStainStage, setSelectedStainStage] = useState(2); // default to final dark stain
  const [faqOpenIndex, setFaqOpenIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchFaqs());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    dispatch(fetchDesigns({ sort: 'latest' }));
    dispatch(fetchTopTestimonials(3));
  }, [dispatch]);

  // Top 3 latest created designs
  const latestDesigns = useMemo(() => {
    if (!Array.isArray(designs) || designs.length === 0) return [];
    return [...designs]
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || a.raw?.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.raw?.createdAt || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 3);
  }, [designs]);

  const handleVoteHelpful = async (faq) => {
    const faqId = faq._id || faq.id;
    if (!faqId) return;

    if (!isAuthenticated) {
      toast.error('Please login first to vote on FAQs! ✨');
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const alreadyVoted = Boolean(
      (userVotes && userVotes[faqId]) ||
      faq.isVoted ||
      faq.userVote ||
      faq.votedUserId
    );

    if (alreadyVoted) {
      toast.info('You have already voted on this FAQ');
      return;
    }

    try {
      const res = await dispatch(voteFaqHelpful({ id: faqId, isHelpful: true })).unwrap();
      toast.success(res?.res?.message || 'Thank you for your feedback! ✨');
    } catch (err) {
      toast.error(err?.msg || 'Could not submit vote. Please try again.');
    }
  };

  // Interactive Estimator state
  const [estimatorCoverage, setEstimatorCoverage] = useState('full-elbow');
  const [estimatorOccasion, setEstimatorOccasion] = useState('bridal');
  const [estimatorGuests, setEstimatorGuests] = useState(1);

  // Calculate quick estimate
  const calculateEstimate = () => {
    let base = 5000;
    if (estimatorCoverage === 'wrist') base = 2500;
    if (estimatorCoverage === 'forearm') base = 6500;
    if (estimatorCoverage === 'full-elbow') base = 12500;
    if (estimatorCoverage === 'full-bridal-feet') base = 18000;

    const guestCost = (estimatorGuests - 1) * 800;
    const total = base + guestCost;
    const estHours = estimatorCoverage === 'full-bridal-feet' ? '5 - 6 Hours' : '3 - 4 Hours';
    return { total: `₹${total.toLocaleString()}`, estHours };
  };

  const estimate = calculateEstimate();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Regal Hero Section */}
      <section className="relative pt-6 sm:pt-10 overflow-hidden">
        {/* Soft Henna Glow Backdrop */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 left-10 w-80 h-80 bg-[#8A3324]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Royal Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3ECE1] border border-[#D4AF37]/40 text-[#4A151B] text-xs font-bold tracking-wide shadow-sm">
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Rajasthan's Premier Sojat Henna Artists</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A3324]" />
                <span className="text-[#8A3324]">100% Organic</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-royal text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#4A151B] leading-[1.15] tracking-tight">
                Royal Bridal Mehndi &amp; <br />
                <span className="gold-gradient-text italic font-serif-elegant font-normal">
                  Timeless Henna Artistry
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#4A151B]/85 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Adorning royal brides across India and destination weddings worldwide. Etched in triple-sifted organic Sojat henna with our legendary deep mahogany stain guarantee.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={onOpenEnquiry}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#4A151B] via-[#611C23] to-[#8A3324] text-[#FFFDF9] font-bold text-sm shadow-xl hover:shadow-2xl hover:brightness-110 transition-all transform active:scale-95 border border-[#D4AF37]/50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-[#D4AF37]" />
                  <span>Reserve Bridal Date</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => navigate('/designs')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/80 hover:bg-white text-[#4A151B] font-bold text-sm border border-[#D4AF37]/50 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Explore 200+ Designs</span>
                </button>
              </div>

              {/* Live Trust Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#D4AF37]/25">
                <div className="p-2 text-center lg:text-left">
                  <div className="font-royal text-xl sm:text-2xl font-bold text-[#4A151B]">5,200+</div>
                  <div className="text-[11px] text-[#8A3324] font-medium">Brides Adorned</div>
                </div>
                <div className="p-2 text-center lg:text-left">
                  <div className="font-royal text-xl sm:text-2xl font-bold text-[#4A151B] flex items-center justify-center lg:justify-start gap-1">
                    <span>4.98</span>
                    <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                  </div>
                  <div className="text-[11px] text-[#8A3324] font-medium">Google Rating</div>
                </div>
                <div className="p-2 text-center lg:text-left">
                  <div className="font-royal text-xl sm:text-2xl font-bold text-[#4A151B]">100%</div>
                  <div className="text-[11px] text-[#8A3324] font-medium">Chemical-Free</div>
                </div>
                <div className="p-2 text-center lg:text-left">
                  <div className="font-royal text-xl sm:text-2xl font-bold text-[#4A151B]">12+</div>
                  <div className="text-[11px] text-[#8A3324] font-medium">Years Legacy</div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* 2. Curated Artistry Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase font-bold text-[#8A3324] tracking-widest block">
            Tradition Meets Contemporary Grace
          </span>
          <h2 className="font-royal text-2xl sm:text-4xl font-bold text-[#4A151B]">
            Our Signature Henna Masteries
          </h2>
          <p className="text-xs sm:text-sm text-[#4A151B]/80">
            From imperial Rajasthani court patterns to modern Dubai negative space, every stroke is handcrafted with precision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {designsLoading && latestDesigns.length === 0 ? (
            [1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-[#FFFDF9] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-sm animate-pulse flex flex-col justify-between"
              >
                <div className="aspect-[4/3] bg-[#4A151B]/10" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-[#4A151B]/15 rounded w-3/4" />
                  <div className="h-3 bg-[#4A151B]/10 rounded w-full" />
                  <div className="h-3 bg-[#4A151B]/10 rounded w-2/3" />
                  <div className="pt-2 flex justify-between border-t border-[#D4AF37]/20">
                    <div className="h-4 bg-[#4A151B]/15 rounded w-1/4" />
                    <div className="h-4 bg-[#4A151B]/15 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))
          ) : latestDesigns.length > 0 ? (
            latestDesigns.map((design) => {
              const designSlug = design.slug || design._id || design.id;
              return (
                <div
                  key={design.id || design._id}
                  onClick={() => navigate(`/designs/${designSlug}`)}
                  className="group bg-[#FFFDF9] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#2A0C0E]">
                    <img
                      src={design.image}
                      alt={design.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = design.fallbackImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80';
                      }}
                    />
                    {design.style && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1A0D0E]/80 backdrop-blur-md text-[11px] font-bold text-[#D4AF37] border border-[#D4AF37]/30">
                        {design.style}
                      </span>
                    )}
                    {design.duration && (
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-white/90 text-[10px] font-bold text-[#4A151B]">
                        {design.duration}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-royal text-lg font-bold text-[#4A151B] group-hover:text-[#8A3324] transition-colors">
                      {design.title}
                    </h3>
                    <p className="text-xs text-[#4A151B]/75 line-clamp-2 leading-relaxed">
                      {design.description}
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-[#D4AF37]/20">
                      <span className="font-royal font-bold text-[#4A151B] text-sm">
                        {design.priceEstimate}
                      </span>
                      <span className="text-xs font-bold text-[#8A3324] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : null}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/designs')}
            className="px-6 py-2.5 rounded-full border border-[#8A3324] text-[#8A3324] hover:bg-[#8A3324] hover:text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Explore Complete Portfolio Gallery &rarr;
          </button>
        </div>
      </section>



      {/* 3. Real Brides Love Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase font-bold text-[#8A3324] tracking-widest block">
            Love Letters &amp; Blessings
          </span>
          <h2 className="font-royal text-2xl sm:text-4xl font-bold text-[#4A151B]">
            From Our Cherished Brides
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topLoading && topTestimonials.length === 0 ? (
            [1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#D4AF37]/30 shadow-sm animate-pulse space-y-4"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-[#D4AF37]/30 rounded-full" />
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : topTestimonials.length > 0 ? (
            topTestimonials.map((t) => {
              const avatarUrl =
                t.avatar?.url ||
                `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(t.name || 'Bride')}`;
              const subtitle = [t.designation, t.company].filter(Boolean).join(' • ');

              return (
                <div
                  key={t._id || t.id}
                  className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#D4AF37]/30 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex gap-1">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-[#4A151B]/85 italic leading-relaxed font-serif-elegant">
                      "{t.message}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center gap-3">
                    <img
                      src={avatarUrl}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/50"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(t.name || 'Bride')}`;
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-royal text-sm font-bold text-[#4A151B] truncate">
                        {t.name}
                      </h4>
                      {subtitle && (
                        <div className="text-[11px] text-[#8A3324] truncate">
                          {subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : null}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => navigate('/art-by-radhika-user-feedbacks')}
            className="px-6 py-2.5 rounded-full border border-[#8A3324] text-[#8A3324] hover:bg-[#8A3324] hover:text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <span>View All Bride Stories &amp; Feedbacks</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. Frequently Asked Questions Accordion */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs uppercase font-bold text-[#8A3324] tracking-widest block">
            Bride Consultation Guide
          </span>
          <h2 className="font-royal text-2xl sm:text-3xl font-bold text-[#4A151B]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqsLoading && faqs.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white/60 rounded-2xl border border-[#D4AF37]/20 p-5 animate-pulse flex items-center justify-between"
                >
                  <div className="h-4 bg-[#D4AF37]/20 rounded w-3/4" />
                  <div className="w-4 h-4 rounded-full bg-[#D4AF37]/20" />
                </div>
              ))}
            </div>
          ) : faqs && faqs.length > 0 ? (
            faqs.map((faq, index) => {
              const isOpen = faqOpenIndex === index;
              const faqId = faq._id || faq.id || index;
              const hasVoted = Boolean(
                (userVotes && userVotes[faqId]) ||
                faq.isVoted ||
                faq.userVote ||
                (faq.votedUserId && faq.isVoted !== false)
              );

              return (
                <div
                  key={faqId}
                  className="bg-white rounded-2xl border border-[#D4AF37]/30 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpenIndex(isOpen ? -1 : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-royal text-sm sm:text-base font-bold text-[#4A151B]">
                      {faq.question || faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#8A3324] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4A151B]/80 leading-relaxed border-t border-[#D4AF37]/15 animate-in fade-in duration-200 space-y-3">
                      <p>{faq.answer || faq.a}</p>

                      <div className="pt-2.5 border-t border-[#D4AF37]/10 flex items-center justify-between text-xs text-[#4A151B]/70">
                        <span className="text-[11px] sm:text-xs">Was this helpful?</span>
                        <button
                          type="button"
                          disabled={votingFaqId === faqId || hasVoted}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoteHelpful(faq);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border ${hasVoted
                            ? 'bg-[#4A151B] text-[#FFFDF9] border-[#4A151B] shadow-xs'
                            : 'bg-[#FAF6F0] hover:bg-[#F3ECE1] text-[#4A151B] border-[#D4AF37]/40 hover:border-[#D4AF37]'
                            } ${votingFaqId === faqId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <ThumbsUp
                            className={`w-3.5 h-3.5 ${hasVoted ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#8A3324]'
                              }`}
                          />
                          <span>{hasVoted ? 'Helpful' : 'Yes'}</span>
                          {faq.helpfulCount !== undefined && faq.helpfulCount !== null && (
                            <span className="ml-0.5 opacity-80">({faq.helpfulCount})</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : null}
        </div>
      </section>

      {/* 5. Bottom Grand Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#4A151B] via-[#611C23] to-[#8A3324] p-8 sm:p-12 text-center text-white border-2 border-[#D4AF37]/50 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-bold text-[#D4AF37] tracking-widest block">
              Limited Wedding Season Dates
            </span>
            <h2 className="font-royal text-2xl sm:text-4xl font-bold text-[#FFFDF9]">
              Craft Your Eternal Bridal Story
            </h2>
            <p className="text-xs sm:text-sm text-[#FAF6F0]/85">
              Dates for the upcoming wedding season fill months in advance. Secure your private henna artist consultation today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={onOpenEnquiry}
              className="px-8 py-3.5 rounded-full bg-[#D4AF37] text-[#2A0C0E] font-bold text-sm hover:bg-[#F1DF96] transition-all shadow-lg cursor-pointer"
            >
              Check Date Availability
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/30 transition-all cursor-pointer"
            >
              View Packages &amp; Pricing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
