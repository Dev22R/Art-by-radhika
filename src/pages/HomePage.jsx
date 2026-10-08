import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Crown,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Star,
  Flame,
} from 'lucide-react';

import {
  DESIGNS_DATA,
  PRICING_PACKAGES,
  TESTIMONIALS_DATA,
  STAIN_TIMELINE,
  FAQS_DATA,
} from '../data/mehndiData';

export const HomePage = ({ setActiveTab, onOpenEnquiry, onSelectDesign }) => {
  const navigate = useNavigate();
  const [selectedStainStage, setSelectedStainStage] = useState(2); // default to final dark stain
  const [faqOpenIndex, setFaqOpenIndex] = useState(0);

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

            {/* Hero Right Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl p-3 bg-gradient-to-b from-[#D4AF37]/40 via-[#8A3324]/30 to-[#4A151B]/40 shadow-2xl">
                <div className="relative rounded-2xl overflow-hidden bg-[#2A0C0E] aspect-[4/5] shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
                    alt="Royal Bridal Mehndi Art"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A0D0E] via-transparent to-black/20 pointer-events-none" />

                  {/* Floating Guarantee Seal */}
                  <div className="absolute top-4 right-4 glass-dark px-3 py-1.5 rounded-full border border-[#D4AF37]/50 text-white flex items-center gap-1.5 shadow-lg">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[11px] font-bold text-[#D4AF37] tracking-wider uppercase">
                      Dark Stain Guarantee
                    </span>
                  </div>

                  {/* Bottom Card Info */}
                  <div className="absolute bottom-4 left-4 right-4 glass-dark p-3.5 rounded-2xl border border-[#D4AF37]/30 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">
                          Featured Signature
                        </span>
                        <h4 className="font-royal text-sm font-bold text-white">
                          Padmavati Royal Rajwada
                        </h4>
                      </div>
                      <button
                        onClick={() => navigate('/reels')}
                        className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#2A0C0E] font-bold text-xs hover:bg-[#F1DF96] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Watch Reel</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
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
          {DESIGNS_DATA.slice(0, 3).map((design) => (
            <div
              key={design.id}
              onClick={() => onSelectDesign(design)}
              className="group bg-[#FFFDF9] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#2A0C0E]">
                <img
                  src={design.image}
                  alt={design.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = design.fallbackImage;
                  }}
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1A0D0E]/80 backdrop-blur-md text-[11px] font-bold text-[#D4AF37] border border-[#D4AF37]/30">
                  {design.style}
                </span>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-white/90 text-[10px] font-bold text-[#4A151B]">
                  {design.duration}
                </span>
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
          ))}
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

      {/* 3. Interactive Stain Transformation Simulator */}
      <section className="bg-gradient-to-br from-[#2A0C0E] via-[#4A151B] to-[#1A0D0E] text-white py-12 sm:py-16 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-4 sm:px-8 border border-[#D4AF37]/30 shadow-2xl relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            <span>The Science of Royal Henna</span>
          </div>
          <h2 className="font-royal text-2xl sm:text-4xl font-bold text-[#FFFDF9]">
            Natural Stain Oxidation Journey
          </h2>
          <p className="text-xs sm:text-sm text-[#F3ECE1]/80 max-w-xl mx-auto">
            Our pure Sojat henna contains zero artificial dyes. Witness how body warmth transforms natural Lawsone into deep dark mahogany.
          </p>
        </div>

        {/* 3 Interactive Buttons for Stages */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-8">
          {STAIN_TIMELINE.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedStainStage(idx)}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                selectedStainStage === idx
                  ? 'bg-[#D4AF37] text-[#2A0C0E] shadow-lg scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white/80'
              }`}
            >
              <span>{item.stage}</span>
            </button>
          ))}
        </div>

        {/* Selected Stage Detail Display */}
        {(() => {
          const current = STAIN_TIMELINE[selectedStainStage];
          return (
            <div className="glass-dark p-6 rounded-2xl border border-[#D4AF37]/40 max-w-2xl mx-auto text-left space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-[#D4AF37] shadow-inner"
                  style={{ backgroundColor: current.color }}
                />
                <div>
                  <h3 className="font-royal text-lg sm:text-xl font-bold text-[#FFFDF9]">
                    {current.title}
                  </h3>
                  <span className="text-[11px] text-[#D4AF37] font-semibold">{current.stage}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#FAF6F0]/90 leading-relaxed">
                {current.description}
              </p>

              <div className="p-3 rounded-xl bg-black/40 border border-[#D4AF37]/25 text-xs text-[#D4AF37] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Master Tip:</strong> {current.tip}
                </span>
              </div>
            </div>
          );
        })()}
      </section>

      {/* 4. Interactive Live Bridal Cost & Time Estimator */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border-2 border-[#D4AF37]/40 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-bold text-[#8A3324] tracking-widest block">
              Transparent Planning
            </span>
            <h2 className="font-royal text-2xl sm:text-3xl font-bold text-[#4A151B]">
              Henna Time &amp; Cost Estimator
            </h2>
            <p className="text-xs sm:text-sm text-[#4A151B]/80">
              Calculate realistic timing and investment tailored to your bridal party requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-2">
                  Coverage Length
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'wrist', label: 'Wrist & Palms' },
                    { id: 'forearm', label: 'Forearms Both Sides' },
                    { id: 'full-elbow', label: 'Full Elbow Bridal' },
                    { id: 'full-bridal-feet', label: 'Royal Arms + Feet' },
                  ].map((cov) => (
                    <button
                      key={cov.id}
                      type="button"
                      onClick={() => setEstimatorCoverage(cov.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                        estimatorCoverage === cov.id
                          ? 'bg-[#4A151B] text-[#D4AF37] border-[#4A151B]'
                          : 'bg-white text-[#4A151B] border-[#D4AF37]/30 hover:bg-[#F3ECE1]'
                      }`}
                    >
                      {cov.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-2">
                  Additional Guests / Bridesmaids Hands ({estimatorGuests - 1})
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={estimatorGuests}
                  onChange={(e) => setEstimatorGuests(parseInt(e.target.value))}
                  className="w-full accent-[#8A3324] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#8A3324] mt-1">
                  <span>Bride only</span>
                  <span>+5 Guests</span>
                  <span>+14 Guests</span>
                </div>
              </div>
            </div>

            {/* Estimated Output Result */}
            <div className="p-6 rounded-2xl bg-[#F3ECE1] border border-[#D4AF37]/40 flex flex-col justify-between text-center md:text-left space-y-4">
              <div>
                <span className="text-xs uppercase font-bold text-[#8A3324] block mb-1">
                  Estimated Total Investment
                </span>
                <div className="font-royal text-3xl sm:text-4xl font-extrabold text-[#4A151B]">
                  {estimate.total}
                </div>
                <div className="text-xs text-[#8A3324] font-medium mt-1">
                  Includes 100% Organic Cones, Sealant Mist &amp; Aftercare Balm
                </div>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-[#D4AF37]/20 flex items-center justify-between text-xs">
                <span className="text-[#4A151B] font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#8A3324]" />
                  Application Duration:
                </span>
                <span className="font-bold text-[#4A151B]">{estimate.estHours}</span>
              </div>

              <button
                onClick={onOpenEnquiry}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#4A151B] to-[#8A3324] text-[#FAF6F0] font-bold text-xs sm:text-sm hover:brightness-110 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-[#D4AF37]" />
                <span>Reserve This Package</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Real Brides Love Stories */}
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
          {TESTIMONIALS_DATA.map((t) => (
            <div
              key={t.id}
              className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#D4AF37]/30 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#4A151B]/85 italic leading-relaxed font-serif-elegant text-base">
                  {t.text}
                </p>
              </div>

              <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.bride}
                  className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/50"
                />
                <div>
                  <h4 className="font-royal text-sm font-bold text-[#4A151B]">{t.bride}</h4>
                  <div className="text-[11px] text-[#8A3324]">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Frequently Asked Questions Accordion */}
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
          {FAQS_DATA.map((faq, index) => {
            const isOpen = faqOpenIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-[#D4AF37]/30 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpenIndex(isOpen ? -1 : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-royal text-sm sm:text-base font-bold text-[#4A151B]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#8A3324] transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4A151B]/80 leading-relaxed border-t border-[#D4AF37]/15 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Bottom Grand Banner */}
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
