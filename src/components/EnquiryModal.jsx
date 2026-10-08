import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, MapPin, Phone, User, Users, CheckCircle2, MessageCircle, Crown } from 'lucide-react';

import { toast } from 'sonner';

export const EnquiryModal = ({ isOpen, onClose, preselectedItem }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    occasion: 'Bridal Wedding Ceremony',
    date: '',
    city: '',
    guestsCount: '1 (Bride only)',
    packageOrDesign: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (preselectedItem) {
      setFormData((prev) => ({
        ...prev,
        packageOrDesign: preselectedItem.title || preselectedItem.name || '',
      }));
    }
  }, [preselectedItem]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppSend = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Please enter your name and phone number');
      return;
    }

    const messageText = `*Namaste Art-BY-radhika Studio!* 🌺%0A%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Occasion:* ${formData.occasion}%0A*Date:* ${formData.date || 'TBD'}%0A*City/Venue:* ${formData.city || 'TBD'}%0A*Guests/Hands:* ${formData.guestsCount}%0A*Selected Style/Package:* ${formData.packageOrDesign || 'General Inquiry'}%0A*Special Requests:* ${formData.notes || 'None'}%0A%0A_Sent via Art-BY-radhika Website_`;

    
    // Default demo WhatsApp number
    const whatsappUrl = `https://wa.me/919876543210?text=${messageText}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp with your booking details!');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Please enter your name and contact number');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Your Mehndi enquiry has been received! Our bridal coordinator will call within 2 hours.');
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2400);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A0D0E]/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF6F0] rounded-3xl shadow-2xl border-2 border-[#D4AF37]/50 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#4A151B] via-[#611C23] to-[#8A3324] px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF6F0] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-1">
            <Crown className="w-4 h-4" />
            <span>Royal Bridal & Event Consultation</span>
          </div>

          <h3 className="font-royal text-2xl font-bold text-[#FFFDF9]">
            Enquire Dates & Custom Mehndi
          </h3>
          <p className="text-xs text-[#F3ECE1]/80 mt-1">
            100% Organic Sojat Henna • Bespoke Portraits • Destination Services
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#52B788]/20 flex items-center justify-center text-[#2D6A4F]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-royal text-2xl font-bold text-[#4A151B]">
                Enquiry Reserved!
              </h4>
              <p className="text-sm text-[#4A151B]/80 max-w-xs mx-auto">
                Thank you, <span className="font-bold text-[#8A3324]">{formData.name}</span>! Our lead artist is checking slot availability for {formData.date || 'your special date'}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {formData.packageOrDesign && (
                <div className="p-2.5 rounded-xl bg-[#F3ECE1] border border-[#D4AF37]/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#4A151B]">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-semibold">Selected: {formData.packageOrDesign}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, packageOrDesign: '' }))}
                    className="text-xs text-[#8A3324] hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8A3324]/60 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Bride / Client Name"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8A3324]/60 absolute left-3 top-3" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                    />
                  </div>
                </div>
              </div>

              {/* Occasion & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                    Occasion / Event
                  </label>
                  <select
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                  >
                    <option value="Bridal Wedding Ceremony">Bridal Wedding Ceremony</option>
                    <option value="Sangeet & Mehendi Night">Sangeet & Mehendi Night</option>
                    <option value="Engagement / Roka">Engagement / Roka</option>
                    <option value="Baby Shower / Godh Bharai">Baby Shower / Godh Bharai</option>
                    <option value="Karwa Chauth / Teej">Karwa Chauth / Teej</option>
                    <option value="Family / Bridesmaids Group">Family / Bridesmaids Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                    Event Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#8A3324]/60 absolute left-3 top-3" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D4AF37]/30 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                    />
                  </div>
                </div>
              </div>

              {/* City / Venue & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                    City / Venue Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#8A3324]/60 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Udaipur, Delhi, Mumbai"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                    Guest Count / Hands
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-[#8A3324]/60 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="guestsCount"
                      value={formData.guestsCount}
                      onChange={handleChange}
                      placeholder="Bride + 10 Bridesmaids"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                    />
                  </div>
                </div>
              </div>

              {/* Notes / Inscription */}
              <div>
                <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                  Custom Inscriptions or Special Requests
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Couple portraits, hidden wedding hashtags, skyline motif, sensitive skin details..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D4AF37]/30 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324] resize-none"
                />
              </div>

              {/* Two Action Buttons: Submit & WhatsApp */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4A151B] text-[#FFFDF9] font-bold text-sm hover:bg-[#611C23] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isSubmitting ? 'Sending Request...' : 'Submit Request'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppSend}
                  className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Direct WhatsApp</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-[#8A3324]/80">
                🔒 Safe & Confidential • No Spam Guarantee • 100% Organic Henna
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
