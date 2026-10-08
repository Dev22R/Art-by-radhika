import React from 'react';
import {
  Crown,
  Check,
  Sparkles,
  ShieldCheck,
  Clock,
  Users,
  Award,
  ArrowRight,
} from 'lucide-react';
import { PRICING_PACKAGES } from '../data/mehndiData';

export const PricingPage = ({ onSelectPackage }) => {
  const addOns = [
    {
      title: 'Groom Shahi Mehndi Accent',
      desc: 'Royal wrist band mandala, bride initials inscription & palm talisman for the dulha.',
      price: '₹2,500',
    },
    {
      title: 'Bridal Aftercare Luxury Hamper',
      desc: 'Scented eucalyptus-sesame balm, clove incense cones & protective cotton gloves.',
      price: '₹1,200 (Included in Radhika Kohinoor)',

    },
    {
      title: 'White Henna & Jagua Art',
      desc: 'Temporary waterproof white bridal lace design for cocktail and sangeet night dresses.',
      price: '₹3,500',
    },
    {
      title: 'Outstation & Destination Travel',
      desc: 'Dedicated flight/train artist travel assistance for destination weddings in India & UAE.',
      price: 'On Request',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 pb-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase font-bold text-[#8A3324] tracking-widest block">
          Honest &amp; Transparent Investment
        </span>
        <h1 className="font-royal text-3xl sm:text-5xl font-bold text-[#4A151B]">
          Bridal &amp; Celebration Packages
        </h1>
        <p className="text-xs sm:text-sm text-[#4A151B]/80 leading-relaxed">
          Every booking includes fresh, handmade organic Sojat henna cones, sealant mists, and our coveted dark stain warranty.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_PACKAGES.map((pkg) => {
          return (
            <div
              key={pkg.id}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative border ${
                pkg.popular
                  ? 'bg-gradient-to-b from-[#2A0C0E] to-[#4A151B] text-white border-[#D4AF37] shadow-2xl scale-105 lg:-translate-y-2'
                  : 'bg-[#FFFDF9] text-[#2C1810] border-[#D4AF37]/30 shadow-md hover:shadow-xl'
              }`}
            >
              {/* Popular / Best Badge */}
              {pkg.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md ${
                      pkg.popular
                        ? 'bg-[#D4AF37] text-[#2A0C0E]'
                        : 'bg-[#8A3324] text-white'
                    }`}
                  >
                    {pkg.badge}
                  </span>
                </div>
              )}

              {/* Card Header */}
              <div className="space-y-4 pt-2">
                <div>
                  <h3
                    className={`font-royal text-xl font-bold ${
                      pkg.popular ? 'text-[#D4AF37]' : 'text-[#4A151B]'
                    }`}
                  >
                    {pkg.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 leading-snug ${
                      pkg.popular ? 'text-[#FAF6F0]/80' : 'text-[#8A3324]'
                    }`}
                  >
                    {pkg.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-[#D4AF37]/25">
                  <div className="flex items-baseline gap-2">
                    <span className="font-royal text-3xl font-extrabold">{pkg.price}</span>
                    <span
                      className={`text-xs line-through ${
                        pkg.popular ? 'text-white/50' : 'text-gray-400'
                      }`}
                    >
                      {pkg.originalPrice}
                    </span>
                  </div>
                  <div
                    className={`text-[11px] font-medium mt-1 flex items-center gap-1.5 ${
                      pkg.popular ? 'text-[#D4AF37]' : 'text-[#8A3324]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Duration: {pkg.duration}</span>
                  </div>
                  <div
                    className={`text-[11px] font-medium flex items-center gap-1.5 mt-0.5 ${
                      pkg.popular ? 'text-white/80' : 'text-[#4A151B]/80'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{pkg.artistsCount}</span>
                  </div>
                </div>

                {/* Feature List */}
                <div className="space-y-2 pt-3 border-t border-[#D4AF37]/20">
                  <div
                    className={`text-[10px] uppercase font-bold tracking-widest ${
                      pkg.popular ? 'text-[#D4AF37]' : 'text-[#8A3324]'
                    }`}
                  >
                    What's Included:
                  </div>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs leading-tight">
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            pkg.popular ? 'text-[#D4AF37]' : 'text-[#8A3324]'
                          }`}
                        />
                        <span className={pkg.popular ? 'text-[#FAF6F0]' : 'text-[#4A151B]'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer / CTA */}
              <div className="pt-6 mt-6 border-t border-[#D4AF37]/20">
                <button
                  onClick={() => onSelectPackage(pkg)}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    pkg.popular
                      ? 'bg-[#D4AF37] hover:bg-[#F1DF96] text-[#2A0C0E]'
                      : 'bg-gradient-to-r from-[#4A151B] to-[#8A3324] hover:brightness-110 text-white'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>Select &amp; Enquire</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add-on Services Section */}
      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/30 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="font-royal text-xl sm:text-2xl font-bold text-[#4A151B]">
            Artistry Enhancements &amp; Add-ons
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {addOns.map((addon, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#F3ECE1]/70 border border-[#D4AF37]/20 space-y-1.5 flex flex-col justify-between"
            >
              <div>
                <h4 className="font-royal text-sm font-bold text-[#4A151B]">{addon.title}</h4>
                <p className="text-xs text-[#4A151B]/75 mt-1 leading-relaxed">{addon.desc}</p>
              </div>
              <div className="pt-2 font-bold text-xs text-[#8A3324]">{addon.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Royal Guarantee Box */}
      <div className="rounded-3xl bg-gradient-to-r from-[#F3ECE1] to-[#FAF6F0] p-6 sm:p-8 border border-[#D4AF37]/40 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[#4A151B] flex items-center justify-center text-[#D4AF37] shrink-0 shadow-lg">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <div className="space-y-1 text-center md:text-left flex-1">
          <h4 className="font-royal text-xl font-bold text-[#4A151B]">
            The 100% Organic Henna &amp; Stain Guarantee
          </h4>
          <p className="text-xs sm:text-sm text-[#4A151B]/80 leading-relaxed">
            We prepare our henna paste fresh for every single bride using pure Sojat lawsone leaves and pure therapeutic oils. No PPD, no synthetic colorants, and no artificial dyes. If your stain doesn't reach rich mahogany under our aftercare instructions, your touch-up session is fully complimentary.
          </p>
        </div>
      </div>
    </div>
  );
};
