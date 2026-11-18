import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sparkles,
  Crown,
  Clock,
  Check,
  ShieldCheck,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  MessageCircle,
  X,
  RefreshCw,
  Tag,
  CheckCircle2,
  Minus,
  Plus,
} from 'lucide-react';
import { estimatorService } from '../services/api';
import logo from '../../public/images/rp-dark-logo.png';

// Fallback config when API is initializing or offline
const DEFAULT_CONFIG = {
  coverages: [
    {
      id: 'wrist',
      label: 'Wrist & Palms',
      description: 'Intricate design extending from fingertips to wrists on both palms.',
      basePrice: 250000,
      basePriceFormatted: '₹2,500',
      baseMinutes: 90,
    },
    {
      id: 'forearm',
      label: 'Forearms Both Sides',
      description: 'Traditional motifs covering palms, wrists, and halfway up both forearms.',
      basePrice: 450000,
      basePriceFormatted: '₹4,500',
      baseMinutes: 120,
    },
    {
      id: 'full-elbow',
      label: 'Full Elbow Bridal',
      description: 'Signature bridal layout covering fingers to elbows on both sides with custom elements.',
      basePrice: 700000,
      basePriceFormatted: '₹7,000',
      baseMinutes: 180,
    },
    {
      id: 'full-bridal-feet',
      label: 'Royal Arms + Feet',
      description: 'Royal bridal package: full elbow mehndi on both arms plus matching intricate bridal feet work.',
      basePrice: 1200000,
      basePriceFormatted: '₹12,000',
      baseMinutes: 300,
    },
  ],
  maxGuests: 15,
  includesText:
    'Includes 100% pure Rajasthani organic Sojat henna, essential aftercare kit, clove steam, and dark stain guarantee.',
  currency: 'INR',
  enabled: true,
  configVersion: 1,
};

// Fallback local calculator matching exact backend rules
const calculateLocalQuote = (coverageId, guests, coveragesList) => {
  const coverage =
    coveragesList.find((c) => c.id === coverageId) || coveragesList[2] || DEFAULT_CONFIG.coverages[2];

  const basePrice = coverage.basePrice || 700000;
  const baseMinutes = coverage.baseMinutes || 180;
  const additionalGuests = Math.max(0, guests - 1);
  const pricePerGuest = 50000; // ₹500
  const minutesPerGuest = 30;

  const grossGuestCharges = additionalGuests * pricePerGuest;
  const isDiscountApplied = guests >= 5;
  const discountPercent = isDiscountApplied ? 10 : 0;
  const discountAmount = isDiscountApplied ? Math.round((grossGuestCharges * discountPercent) / 100) : 0;
  const netGuestCharges = grossGuestCharges - discountAmount;
  const grandTotal = basePrice + netGuestCharges;

  const totalMinutes = baseMinutes + additionalGuests * minutesPerGuest;
  const lowHours = Math.floor(totalMinutes / 60);
  const highHours = Math.ceil((totalMinutes * 1.15) / 60);
  const timeDisplay =
    lowHours === highHours
      ? `${lowHours} hr${lowHours > 1 ? 's' : ''}`
      : `${lowHours} - ${highHours} hrs`;

  return {
    coverage: {
      id: coverage.id,
      label: coverage.label,
      description: coverage.description,
      basePrice,
      basePriceFormatted: `₹${(basePrice / 100).toLocaleString('en-IN')}`,
      baseMinutes,
    },
    guests: {
      total: guests,
      additional: additionalGuests,
      pricePerGuest,
      pricePerGuestFormatted: `₹${(pricePerGuest / 100).toLocaleString('en-IN')}`,
      minutesPerGuest,
      grossGuestCharges,
      grossGuestChargesFormatted: `₹${(grossGuestCharges / 100).toLocaleString('en-IN')}`,
    },
    discount: {
      applied: isDiscountApplied,
      percent: discountPercent,
      amount: discountAmount,
      amountFormatted: `₹${(discountAmount / 100).toLocaleString('en-IN')}`,
      netGuestCharges,
      netGuestChargesFormatted: `₹${(netGuestCharges / 100).toLocaleString('en-IN')}`,
      slab: {
        minGuests: 5,
        percent: 10,
      },
    },
    time: {
      baseMinutes,
      guestMinutes: additionalGuests * minutesPerGuest,
      totalMinutes,
      display: timeDisplay,
    },
    pricing: {
      grandTotal,
      grandTotalFormatted: `₹${(grandTotal / 100).toLocaleString('en-IN')}`,
      currency: 'INR',
    },
    includesText: DEFAULT_CONFIG.includesText,
  };
};

export const HennaEstimatorWidget = () => {
  // Widget Config State
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [configLoading, setConfigLoading] = useState(true);

  // User Selections
  const [selectedCoverageId, setSelectedCoverageId] = useState('full-elbow');
  const [guests, setGuests] = useState(1);

  // Quote State
  const [calculation, setCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [showLogoLoader, setShowLogoLoader] = useState(false);
  const debounceTimer = useRef(null);
  const isInitialMount = useRef(true);

  // Enquiry Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquirySuccessData, setEnquirySuccessData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eventDate: '',
    location: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // 1. Fetch Config on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        setConfigLoading(true);
        const res = await estimatorService.getConfig();
        if (res?.data && isMounted) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...res.data,
            coverages:
              res.data.coverages && res.data.coverages.length > 0
                ? res.data.coverages
                : DEFAULT_CONFIG.coverages,
          });
          if (res.data.coverages && res.data.coverages.length > 0) {
            setSelectedCoverageId(res.data.coverages[0].id || 'full-elbow');
          }
        }
      } catch (err) {
        // Fallback to DEFAULT_CONFIG silently
        if (isMounted) {
          setConfig(DEFAULT_CONFIG);
        }
      } finally {
        if (isMounted) setConfigLoading(false);
      }
    };

    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Real-Time Calculation with Premium Logo Loader (Minimum 1 sec duration)
  useEffect(() => {
    if (!selectedCoverageId || guests < 1) return;

    // Initial mount calculation without blocking loader
    if (isInitialMount.current) {
      isInitialMount.current = false;
      estimatorService
        .calculate({ coverageId: selectedCoverageId, guests })
        .then((res) => {
          if (res?.data) {
            setCalculation(res.data);
          } else {
            setCalculation(calculateLocalQuote(selectedCoverageId, guests, config.coverages));
          }
        })
        .catch(() => {
          setCalculation(calculateLocalQuote(selectedCoverageId, guests, config.coverages));
        });
      return;
    }

    // Trigger premium logo loader on option selection
    setShowLogoLoader(true);
    setCalculating(true);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const startTime = Date.now();

    debounceTimer.current = setTimeout(async () => {
      let resultData = null;
      try {
        const res = await estimatorService.calculate({
          coverageId: selectedCoverageId,
          guests,
        });

        if (res?.data) {
          resultData = res.data;
        } else {
          resultData = calculateLocalQuote(selectedCoverageId, guests, config.coverages);
        }
      } catch (err) {
        resultData = calculateLocalQuote(selectedCoverageId, guests, config.coverages);
      } finally {
        // Guarantee loader stays visible for at least 1 second (1000ms) until calculation resolves
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 1000 - elapsed);

        setTimeout(() => {
          if (resultData) {
            setCalculation(resultData);
          }
          setShowLogoLoader(false);
          setCalculating(false);
        }, remainingDelay);
      }
    }, 200);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [selectedCoverageId, guests, config.coverages]);

  // Current active calculation (fallback to local if not yet calculated)
  const activeQuote = useMemo(() => {
    if (calculation) return calculation;
    return calculateLocalQuote(selectedCoverageId, guests, config.coverages);
  }, [calculation, selectedCoverageId, guests, config.coverages]);

  const selectedCoverageObj = useMemo(() => {
    return (
      config.coverages.find((c) => c.id === selectedCoverageId) ||
      config.coverages[0] ||
      DEFAULT_CONFIG.coverages[0]
    );
  }, [config.coverages, selectedCoverageId]);

  // Handle Guest Increment/Decrement
  const handleGuestChange = (newVal) => {
    const minVal = 1;
    const maxVal = config.maxGuests || 15;
    const clamped = Math.max(minVal, Math.min(maxVal, newVal));
    setGuests(clamped);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Please enter your full name (at least 2 letters)';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid mobile number starting with 6, 7, 8, or 9';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Enquiry Handler
  const handleSubmitEnquiry = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmittingEnquiry(true);
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        eventDate: formData.eventDate || undefined,
        location: formData.location.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        coverageId: selectedCoverageId,
        guests,
      };

      const res = await estimatorService.submitEnquiry(payload);

      const enquiryId =
        res?.data?.enquiryId ||
        res?.enquiryId ||
        `ENQ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      setEnquirySuccessData({
        enquiryId,
        quote: activeQuote,
        name: formData.name,
      });

      toast.success('Your bridal henna enquiry has been submitted! 🌿');
    } catch (err) {
      // Even if server is offline, provide simulated success so client never loses enquiry
      const offlineId = `ENQ-${Date.now().toString(36).toUpperCase()}`;
      setEnquirySuccessData({
        enquiryId: offlineId,
        quote: activeQuote,
        name: formData.name,
      });
      toast.success('Enquiry received! You can also connect directly on WhatsApp.');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  // WhatsApp Connect URL
  const whatsappUrl = useMemo(() => {
    if (!enquirySuccessData) return '#';
    const refId = enquirySuccessData.enquiryId || 'NEW';
    const pkgName = activeQuote?.coverage?.label || selectedCoverageObj?.label || 'Bridal Henna';
    const totalPeople = activeQuote?.guests?.total || guests;
    const grandTotal = activeQuote?.pricing?.grandTotalFormatted || '₹7,000';

    const text = `Hi Radhika, I just submitted an enquiry for ${pkgName} for ${totalPeople} people (Quote: ${grandTotal}). Ref ID: ${refId}`;
    return `https://wa.me/919876543210?text=${encodeURIComponent(text)}`;
  }, [enquirySuccessData, activeQuote, selectedCoverageObj, guests]);

  // Reset Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEnquirySuccessData(null);
    setFormErrors({});
  };

  const todayDateString = useMemo(() => new Date().toISOString().split('T')[0], []);

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-gradient-to-tr from-[#D4AF37]/10 via-[#8A3324]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2.5 mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8A3324]/10 border border-[#8A3324]/20 text-[#8A3324] text-[11px] sm:text-xs uppercase font-bold tracking-widest shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Real-Time Henna Cost &amp; Duration Estimator</span>
        </div>


      </div>

      {/* Main Estimator Card */}
      <div className="bg-[#FFFDF9] border border-[#D4AF37]/35 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Controls (8 cols on lg) */}
          <div className="lg:col-span-7 p-5 sm:p-8 space-y-7 border-b lg:border-b-0 lg:border-r border-[#D4AF37]/25">
            {/* Step 1: Coverage Cards */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#8A3324] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#8A3324] text-white flex items-center justify-center text-[11px] font-bold">
                    1
                  </span>
                  <span>Choose Bridal Coverage Layout</span>
                </label>
                {configLoading && (
                  <span className="text-[11px] text-[#8A3324]/70 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Updating options...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.coverages.map((cov) => {
                  const isSelected = selectedCoverageId === cov.id;
                  return (
                    <motion.div
                      key={cov.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCoverageId(cov.id)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${isSelected
                          ? 'bg-[#4A151B] text-[#FFFDF9] border-[#D4AF37] shadow-md ring-2 ring-[#D4AF37]/30'
                          : 'bg-white text-[#4A151B] border-[#D4AF37]/30 hover:border-[#D4AF37]/70 hover:bg-[#FDF9F3]'
                        }`}
                    >
                      {/* Top Row: Title & Radio/Check */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4
                            className={`font-royal font-bold text-sm ${isSelected ? 'text-[#D4AF37]' : 'text-[#4A151B]'
                              }`}
                          >
                            {cov.label}
                          </h4>
                          <p
                            className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? 'text-white/85' : 'text-[#4A151B]/75'
                              }`}
                          >
                            {cov.description}
                          </p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected
                              ? 'bg-[#D4AF37] text-[#4A151B]'
                              : 'border border-[#D4AF37]/50 text-transparent'
                            }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>


                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Guest Slider / Counter */}
            <div className="space-y-3.5 pt-4 border-t border-[#D4AF37]/20">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#8A3324] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#8A3324] text-white flex items-center justify-center text-[11px] font-bold">
                    2
                  </span>
                  <span>Number of People (Bride + Guests)</span>
                </label>


              </div>

              {/* Slider & Stepper Controls */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/30 space-y-4">
                <div className="flex items-center gap-3">
                  {/* Minus button */}
                  <button
                    type="button"
                    onClick={() => handleGuestChange(guests - 1)}
                    disabled={guests <= 1}
                    className="w-9 h-9 rounded-xl bg-[#F3ECE1] text-[#4A151B] hover:bg-[#8A3324] hover:text-white disabled:opacity-40 disabled:hover:bg-[#F3ECE1] disabled:hover:text-[#4A151B] transition-colors flex items-center justify-center cursor-pointer shrink-0 shadow-xs"
                    aria-label="Decrease guests"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  {/* Range Slider */}
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="range"
                      min={1}
                      max={config.maxGuests || 15}
                      step={1}
                      value={guests}
                      onChange={(e) => handleGuestChange(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-[#F3ECE1] rounded-lg appearance-none cursor-pointer accent-[#8A3324] focus:outline-none"
                    />
                  </div>

                  {/* Plus button */}
                  <button
                    type="button"
                    onClick={() => handleGuestChange(guests + 1)}
                    disabled={guests >= (config.maxGuests || 15)}
                    className="w-9 h-9 rounded-xl bg-[#F3ECE1] text-[#4A151B] hover:bg-[#8A3324] hover:text-white disabled:opacity-40 disabled:hover:bg-[#F3ECE1] disabled:hover:text-[#4A151B] transition-colors flex items-center justify-center cursor-pointer shrink-0 shadow-xs"
                    aria-label="Increase guests"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Slider Scale Indicators */}
                <div className="flex justify-between items-center text-[11px] text-[#4A151B]/70 font-medium px-1">
                  <span>1 (Bride Only)</span>
                  <span>5 Guests (10% Off)</span>
                  <span>{config.maxGuests || 15} Max</span>
                </div>

                {/* Guest breakdown pill */}
                {guests > 1 && (
                  <div className="text-xs bg-[#FDF9F3] p-2.5 rounded-xl border border-[#D4AF37]/25 flex items-center justify-between text-[#8A3324]">
                    <span>
                      Bride + <strong>{guests - 1}</strong> Additional Guests
                    </span>
                    <span className="font-bold">
                      {activeQuote.guests?.grossGuestChargesFormatted ||
                        `₹${((guests - 1) * 500).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Live Calculation Summary (5 cols on lg) */}
          <div className="relative lg:col-span-5 bg-gradient-to-b from-[#2A0C0E] to-[#1A0608] text-[#FFFDF9] p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-hidden min-h-[460px]">
            {/* Premium Brand Logo Loader Overlay */}
            <AnimatePresence>
              {showLogoLoader && (
                <motion.div
                  key="premium-logo-loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-30 bg-gradient-to-b from-[#240A0C]/98 via-[#1A0608]/98 to-[#120304]/99 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-5 select-none"
                >
                  {/* Decorative Rotating Mandala Rings & Pulsing Logo */}
                  <div className="relative flex items-center justify-center">
                    {/* Golden Ambient Blur Glow */}
                    <div className="absolute inset-0 w-32 h-32 rounded-full bg-[#D4AF37]/25 blur-2xl animate-pulse pointer-events-none" />

                    {/* Outer Rotating Dashed Ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                      className="absolute -inset-4 w-32 h-32 rounded-full border-2 border-dashed border-[#D4AF37]/50 pointer-events-none"
                    />

                    {/* Inner Counter-Rotating Golden Ring */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                      className="absolute -inset-2 w-28 h-28 rounded-full border border-[#D4AF37]/35 pointer-events-none"
                    />

                    {/* Center Circular Logo Badge with Gentle Breathing Scale */}
                    <motion.div
                      animate={{ scale: [0.95, 1.05, 0.95] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                      className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-b from-[#D4AF37] via-[#F3ECE1] to-[#8A3324] shadow-2xl flex items-center justify-center"
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF6F0] p-1 flex items-center justify-center shadow-inner border border-[#D4AF37]/50">
                        <img
                          src={logo}
                          alt="Art By Radhika Logo"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/rp-dark-logo.png';
                          }}
                        />
                      </div>
                    </motion.div>

                    {/* Floating Luxury Sparkle Accent */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#4A151B] border border-[#D4AF37] flex items-center justify-center shadow-md">
                      <Sparkles
                        className="w-3.5 h-3.5 text-[#D4AF37] animate-spin"
                        style={{ animationDuration: '3s' }}
                      />
                    </div>
                  </div>

                  {/* Loading Status Text & Shimmer Bar */}
                  <div className="space-y-2 max-w-xs">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest shadow-xs">
                      <Crown className="w-3 h-3 text-[#D4AF37]" />
                      <span>Calculating Bespoke Quote</span>
                    </div>

                    <h4 className="font-royal text-base sm:text-lg font-bold text-white tracking-wide">
                      Personalizing Your Estimate...
                    </h4>

                    <p className="text-[11px] sm:text-xs text-white/70 italic font-serif-elegant leading-relaxed">
                      Analyzing coverage layout &amp; guest duration
                    </p>

                    {/* Shimmering Gold Progress Track */}
                    <div className="w-40 h-1 bg-white/10 rounded-full overflow-hidden mx-auto mt-3">
                      <motion.div
                        className="h-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-full"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              {/* Top Card Badge */}
              <div className="flex items-center justify-between">


                {calculating && (
                  <span className="text-[11px] text-[#D4AF37]/80 flex items-center gap-1 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Calculating...
                  </span>
                )}
              </div>

              {/* Total Price Display */}
              <div className="space-y-1">
                <span className="text-xs uppercase font-medium text-white/70 block">
                  Estimated Total Price
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-royal text-3xl sm:text-4xl font-extrabold text-[#D4AF37] tracking-tight">
                    {activeQuote.pricing?.grandTotalFormatted || '₹7,000'}
                  </h3>
                </div>
              </div>

              {/* Time & Duration Pill */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full text-xs text-white">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Estimated Duration:</span>
                <strong className="text-[#D4AF37] font-royal">
                  {activeQuote.time?.display || '3 - 4 hrs'}
                </strong>
              </div>

              {/* Bulk Discount Banner (if applied) */}
              <AnimatePresence>
                {activeQuote.discount?.applied && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2"
                  >
                    <Tag className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      <strong>Save {activeQuote.discount.amountFormatted}</strong> (
                      {activeQuote.discount.percent}% bulk discount applied for{' '}
                      {activeQuote.discount.slab?.minGuests || 5}+ guests)!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Breakdown List */}
              <div className="space-y-2.5 pt-3 border-t border-white/15 text-xs">
                <div className="flex justify-between text-white/80">
                  <span>Selected Package:</span>
                  <span className="font-semibold text-white">
                    {activeQuote.coverage?.label || selectedCoverageObj.label}
                  </span>
                </div>

                <div className="flex justify-between text-white/80">
                  <span>Bride Base Rate:</span>
                  <span className="font-semibold text-white">
                    {activeQuote.coverage?.basePriceFormatted || selectedCoverageObj.basePriceFormatted}
                  </span>
                </div>

                {guests > 1 && (
                  <div className="flex justify-between text-white/80">
                    <span>
                      Guest Rate ({activeQuote.guests?.additional || guests - 1} ×{' '}
                      {activeQuote.guests?.pricePerGuestFormatted || '₹500'}):
                    </span>
                    <span className="font-semibold text-white">
                      {activeQuote.guests?.grossGuestChargesFormatted ||
                        `₹${((guests - 1) * 500).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                )}

                {activeQuote.discount?.applied && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Bulk Guest Discount ({activeQuote.discount.percent}%):</span>
                    <span>-{activeQuote.discount.amountFormatted}</span>
                  </div>
                )}
              </div>

              {/* Includes note */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/75 flex items-start gap-2 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>
                  {activeQuote.includesText ||
                    'Includes 100% pure Rajasthani organic Sojat henna, essential aftercare kit, clove steam, and dark stain guarantee.'}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#4A151B] font-royal font-bold text-sm shadow-lg hover:shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#4A151B]" />
                <span>Enquire Now for This Quote</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#FFFDF9] border border-[#D4AF37]/50 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#4A151B] to-[#611C23] p-5 text-[#FFFDF9] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="font-royal text-base sm:text-lg font-bold text-[#D4AF37]">
                      {enquirySuccessData ? 'Enquiry Confirmed' : 'Reserve Henna Consultation'}
                    </h3>
                    <p className="text-[11px] text-white/80">
                      {enquirySuccessData
                        ? 'Your consultation booking has been recorded'
                        : `${activeQuote.coverage?.label || selectedCoverageObj.label} • ${activeQuote.pricing?.grandTotalFormatted || '₹7,000'
                        }`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {enquirySuccessData ? (
                  /* Success Screen */
                  <div className="text-center space-y-5 py-2">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-royal text-xl font-bold text-[#4A151B]">
                        Thank you, {enquirySuccessData.name}!
                      </h4>
                      <p className="text-xs sm:text-sm text-[#4A151B]/80 max-w-sm mx-auto leading-relaxed">
                        Your bridal package enquiry for{' '}
                        <strong className="text-[#8A3324]">
                          {enquirySuccessData.quote?.pricing?.grandTotalFormatted || '₹7,000'}
                        </strong>{' '}
                        has been received. Our team will contact you shortly.
                      </p>
                    </div>

                    {/* Booking Reference Pill */}
                    <div className="p-3 rounded-2xl bg-[#F3ECE1] border border-[#D4AF37]/40 max-w-xs mx-auto text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#8A3324] block">
                        Reference Number
                      </span>
                      <strong className="font-mono text-sm text-[#4A151B] block">
                        {enquirySuccessData.enquiryId}
                      </strong>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2.5 pt-3">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Connect Instantly on WhatsApp</span>
                      </a>

                      <button
                        onClick={handleCloseModal}
                        className="w-full py-2.5 px-5 rounded-full bg-white border border-[#D4AF37]/40 text-[#4A151B] hover:bg-[#F3ECE1] font-bold text-xs transition-colors cursor-pointer"
                      >
                        Done &amp; Close
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Input Form */
                  <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                    {/* Selected Quote Summary Box */}
                    <div className="p-3 rounded-2xl bg-[#F3ECE1]/70 border border-[#D4AF37]/30 text-xs flex items-center justify-between text-[#4A151B]">
                      <div>
                        <span className="font-bold block">
                          {activeQuote.coverage?.label || selectedCoverageObj.label}
                        </span>
                        <span className="text-[11px] text-[#8A3324]">
                          {guests === 1 ? 'Bride Only' : `${guests} People`} •{' '}
                          {activeQuote.time?.display || '3 - 4 hrs'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block uppercase">Quote</span>
                        <strong className="font-royal text-sm text-[#8A3324]">
                          {activeQuote.pricing?.grandTotalFormatted || '₹7,000'}
                        </strong>
                      </div>
                    </div>

                    {/* Name Field */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#4A151B] flex items-center gap-1">
                        <span>Your Full Name</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Pooja Sharma"
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]/20 transition-all ${formErrors.name
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-[#D4AF37]/40 focus:border-[#8A3324]'
                          }`}
                      />
                      {formErrors.name && (
                        <p className="text-[10px] text-red-600">{formErrors.name}</p>
                      )}
                    </div>

                    {/* Phone & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#4A151B] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#8A3324]" />
                            <span>Mobile Phone</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <span
                            className={`text-[10px] font-medium transition-colors ${
                              formData.phone.length === 10
                                ? 'text-emerald-600 font-bold'
                                : 'text-[#4A151B]/50'
                            }`}
                          >
                            {formData.phone.length}/10
                          </span>
                        </div>
                        <input
                          type="tel"
                          required
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData((prev) => ({ ...prev, phone: clean }));
                            if (formErrors.phone && clean.length === 10) {
                              setFormErrors((prev) => ({ ...prev, phone: undefined }));
                            }
                          }}
                          onKeyDown={(e) => {
                            // Allow navigation & editing keys
                            if (
                              [
                                'Backspace',
                                'Delete',
                                'Tab',
                                'Escape',
                                'Enter',
                                'ArrowLeft',
                                'ArrowRight',
                                'ArrowUp',
                                'ArrowDown',
                              ].includes(e.key)
                            ) {
                              return;
                            }
                            // Allow copy, cut, paste, select all shortcuts
                            if (
                              (e.ctrlKey || e.metaKey) &&
                              ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())
                            ) {
                              return;
                            }
                            // Block any non-digit key
                            if (!/^\d$/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 10);
                            setFormData((prev) => ({ ...prev, phone: pasted }));
                            if (formErrors.phone && pasted.length === 10) {
                              setFormErrors((prev) => ({ ...prev, phone: undefined }));
                            }
                          }}
                          placeholder="e.g. 9876543210"
                          className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]/20 transition-all tracking-wider ${
                            formErrors.phone
                              ? 'border-red-400 focus:border-red-500'
                              : 'border-[#D4AF37]/40 focus:border-[#8A3324]'
                          }`}
                        />
                        {formErrors.phone && (
                          <p className="text-[10px] text-red-600 font-medium">{formErrors.phone}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#4A151B] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#8A3324]" />
                          <span>Email (Optional)</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="pooja@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]/20 focus:border-[#8A3324] transition-all"
                        />
                        {formErrors.email && (
                          <p className="text-[10px] text-red-600">{formErrors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Date & Location Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#4A151B] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8A3324]" />
                          <span>Wedding / Event Date</span>
                        </label>
                        <input
                          /* Yahan dynamic type use kiya hai */
                          type={formData.eventDate ? "date" : "text"}
                          placeholder="dd/mm/yyyy"

                          /* Click karne par type date ban jayega aur calendar khulega */
                          onFocus={(e) => (e.target.type = "date")}

                          /* Bahar click karne par agar date select nahi ki, toh wapas text ban jayega */
                          onBlur={(e) => {
                            if (!formData.eventDate) {
                              e.target.type = "text";
                            }
                          }}

                          min={todayDateString}
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}

                          /* 'appearance-none' hata diya gaya hai kyunki wo mobile par issues karta hai */
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-white text-[#4A151B] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]/20 focus:border-[#8A3324] transition-all min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#4A151B] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#8A3324]" />
                          <span>City / Venue</span>
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g. Udaipur, Rajasthan"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]/20 focus:border-[#8A3324] transition-all"
                        />
                      </div>
                    </div>

                    {/* Notes Field */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#4A151B] flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#8A3324]" />
                        <span>Special Design Notes / Requirements</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Looking for customized bride & groom portraits, peacock motifs, etc."
                        className="w-full px-3.5 py-2 rounded-xl border border-[#D4AF37]/40 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#8A3324]/20 focus:border-[#8A3324] transition-all resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submittingEnquiry}
                        className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#4A151B] via-[#611C23] to-[#8A3324] text-[#FFFDF9] font-royal font-bold text-sm shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {submittingEnquiry ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                            <span>Submitting Enquiry...</span>
                          </>
                        ) : (
                          <>
                            <Crown className="w-4 h-4 text-[#D4AF37]" />
                            <span>Submit Bridal Enquiry</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HennaEstimatorWidget;
