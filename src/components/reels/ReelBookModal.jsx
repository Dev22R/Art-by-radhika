import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  Crown,
  Loader2,
  Phone,
  Plus,
} from 'lucide-react';
import { bookReelDesign, clearBookingState } from '../../redux/slices/reelsSlice';
import { fetchUserAddresses } from '../../redux/slices/userAddressSlice';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const ReelBookModal = ({
  isOpen,
  onClose,
  reel,
  currentUser,
  onRequireAuth,
}) => {
  const dispatch = useDispatch();
  const addresses = useSelector((state) => state.userAddress?.addresses || []);
  const { bookingLoading, bookingSuccess, bookingError } = useSelector(
    (state) => state.reels
  );

  const adminDesign = reel?.adminDesign || {};

  const [formData, setFormData] = useState({
    addressId: '',
    bookingType: 'mehndi',
    eventName: 'Bridal Wedding Ceremony',
    brideName: '',
    groomName: '',
    numberOfPeople: 1,
    customerRequirements: 'Same exact design as shown in this reel.',
    specialInstructions: 'Need dark stain and organic Rajasthani Sojat mehndi cones.',
    date: '',
    startTime: '11:00 AM',
    endTime: '03:00 PM',
    artistCount: 2,
  });

  const [bookingDone, setBookingDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        dispatch(fetchUserAddresses());
      }
      setFormData((prev) => ({
        ...prev,
        brideName: currentUser?.name || '',
        customerRequirements: `Same exact design as shown in reel: "${reel?.title || 'Bridal Look'}"`,
      }));
    } else {
      setBookingDone(false);
      dispatch(clearBookingState());
    }
  }, [isOpen, currentUser, reel, dispatch]);

  useEffect(() => {
    if (addresses.length > 0 && !formData.addressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddr) {
        setFormData((prev) => ({ ...prev, addressId: defaultAddr._id }));
      }
    }
  }, [addresses, formData.addressId]);

  if (!isOpen || !reel) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Please login first to reserve your bridal slot! ✨');
      onRequireAuth?.();
      return;
    }

    if (!formData.brideName) {
      toast.error('Please enter the Bride Name');
      return;
    }

    if (!formData.date) {
      toast.error('Please select the booking event date');
      return;
    }

    const bookingPayload = {
      addressId: formData.addressId || (addresses[0]?._id || ''),
      bookingType: formData.bookingType || 'mehndi',
      eventName: formData.eventName || 'Bridal Wedding Ceremony',
      brideName: formData.brideName,
      groomName: formData.groomName || '',
      numberOfPeople: Number(formData.numberOfPeople) || 1,
      customerRequirements: formData.customerRequirements || `Design: ${reel.title}`,
      specialInstructions: formData.specialInstructions || '',
      bookingSlots: [
        {
          date: new Date(formData.date).toISOString(),
          startTime: formData.startTime || '11:00 AM',
          endTime: formData.endTime || '03:00 PM',
          artistCount: Number(formData.artistCount) || 2,
        },
      ],
    };

    try {
      await dispatch(
        bookReelDesign({ reelId: reel._id, bookingData: bookingPayload })
      ).unwrap();
      setBookingDone(true);
      toast.success('Bridal slot booked successfully for this design! 👑');
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Could not complete booking';
      toast.error(msg);
    }
  };

  const handleWhatsAppInstant = () => {
    const messageText = encodeURIComponent(
      `*Namaste Art-BY-radhika Studio!* 🌺\n\nI want to book the exact design from Reel: *${reel.title}*\n*Bride Name:* ${formData.brideName || 'Bride'}\n*Groom:* ${formData.groomName || 'N/A'}\n*Date:* ${formData.date || 'TBD'} (${formData.startTime} - ${formData.endTime})\n*Design Code:* ${adminDesign.designCode || 'REEL-DESIGN'}\n*Price:* ₹${adminDesign.discountedPrice || adminDesign.price || 4999}\n\nPlease confirm slot availability!`
    );
    window.open(`https://wa.me/919876543210?text=${messageText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF6F0] rounded-3xl shadow-2xl border-2 border-[#D4AF37]/60 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Top Banner */}
        <div className="bg-gradient-to-r from-[#4A151B] via-[#611C23] to-[#8A3324] px-5 py-4 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF6F0] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1">
            <Crown className="w-4 h-4" />
            <span>Exclusive Reel Design Booking</span>
          </div>

          <h3 className="font-royal text-xl sm:text-2xl font-bold text-[#FFFDF9]">
            Book This Exact Artwork
          </h3>
          <p className="text-xs text-[#F3ECE1]/80 mt-0.5">
            100% Organic Sojat Cones • Guaranteed Deep Mahogany Stain
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Reel Design Preview Card */}
          <div className="p-3.5 rounded-2xl bg-[#F3ECE1] border border-[#D4AF37]/50 flex items-center gap-3">
            <img
              src={reel.thumbnail?.url || reel.video?.url}
              alt={reel.title}
              className="w-16 h-16 rounded-xl object-cover border-2 border-[#D4AF37] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-[#8A3324] tracking-wider">
                {adminDesign.category || 'Bridal Masterpiece'}
              </span>
              <h4 className="font-royal text-sm font-bold text-[#4A151B] truncate">
                {adminDesign.designName || reel.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {adminDesign.discountedPrice ? (
                  <>
                    <span className="text-sm font-bold text-[#8A3324]">
                      ₹{adminDesign.discountedPrice.toLocaleString()}
                    </span>
                    {adminDesign.price && (
                      <span className="text-xs text-gray-500 line-through">
                        ₹{adminDesign.price.toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm font-bold text-[#8A3324]">
                    ₹{adminDesign.price ? adminDesign.price.toLocaleString() : '4,999'}
                  </span>
                )}
                {adminDesign.estimatedTime && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4A151B]/10 text-[#4A151B] font-semibold">
                    ⏱️ {adminDesign.estimatedTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          {bookingDone || bookingSuccess ? (
            /* Success State */
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#52B788]/20 flex items-center justify-center text-[#2D6A4F]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="font-royal text-2xl font-bold text-[#4A151B]">
                  Design Slot Reserved!
                </h4>
                <p className="text-sm text-[#4A151B]/80 max-w-sm mx-auto">
                  Thank you, <span className="font-bold text-[#8A3324]">{formData.brideName}</span>! We have reserved your consultation and booking for{' '}
                  <span className="font-semibold text-[#8A3324]">{formData.date || 'your wedding date'}</span>.
                </p>
              </div>

              <div className="pt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppInstant}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4 fill-current" />
                  <span>Connect with Bridal Coordinator on WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/50 text-[#4A151B] text-xs font-bold hover:bg-[#F3ECE1] cursor-pointer"
                >
                  Close &amp; Keep Browsing Reels
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Bride & Groom Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                    Bride's Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8A3324]/60 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="brideName"
                      required
                      value={formData.brideName}
                      onChange={handleChange}
                      placeholder="e.g. Radhika Sharma"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                    Groom's Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8A3324]/60 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="groomName"
                      value={formData.groomName}
                      onChange={handleChange}
                      placeholder="e.g. Aman Verma"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                    />
                  </div>
                </div>
              </div>

              {/* Event Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                    Mehndi Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#8A3324]/60 absolute left-3 top-3" />
                    <input
                      type="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D4AF37]/40 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                    Preferred Slot
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-[#8A3324]/60 absolute left-3 top-3" />
                    <select
                      name="startTime"
                      value={formData.startTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({
                          ...p,
                          startTime: val,
                          endTime: val === '11:00 AM' ? '03:00 PM' : '08:00 PM',
                        }));
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                    >
                      <option value="11:00 AM">Morning (11:00 AM - 03:00 PM)</option>
                      <option value="04:00 PM">Evening (04:00 PM - 08:00 PM)</option>
                      <option value="08:00 PM">Night Sangeet (08:00 PM onwards)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Number of People & Artist Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                    Number of People
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-[#8A3324]/60 absolute left-3 top-3" />
                    <input
                      type="number"
                      min={1}
                      max={50}
                      name="numberOfPeople"
                      value={formData.numberOfPeople}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                    Lead Artists Required
                  </label>
                  <select
                    name="artistCount"
                    value={formData.artistCount}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                  >
                    <option value={1}>1 Master Artist (Bride only)</option>
                    <option value={2}>2 Artists (Bride + Close Family)</option>
                    <option value={3}>3+ Artists (Grand Bridal Troupe)</option>
                  </select>
                </div>
              </div>

              {/* Destination Address Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-[#4A151B] uppercase tracking-wider">
                    Service Address / Venue
                  </label>
                  <Link
                    to="/add/address"
                    target="_blank"
                    className="text-[11px] text-[#8A3324] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add New
                  </Link>
                </div>

                {addresses.length > 0 ? (
                  <div className="space-y-1.5 max-h-28 overflow-y-auto p-1">
                    {addresses.map((addr) => (
                      <label
                        key={addr._id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                          formData.addressId === addr._id
                            ? 'border-[#8A3324] bg-[#8A3324]/5 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-[#D4AF37]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="addressId"
                          value={addr._id}
                          checked={formData.addressId === addr._id}
                          onChange={handleChange}
                          className="mt-1 text-[#8A3324] focus:ring-[#8A3324]"
                        />
                        <div className="min-w-0 text-xs">
                          <span className="font-bold text-[#4A151B]">
                            {addr.label || 'Home'} - {addr.fullName || addr.contactPerson}
                          </span>
                          <p className="text-gray-600 truncate text-[11px]">
                            {addr.addressLine1 || addr.address}, {addr.city}, {addr.pincode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                    <span>No saved address found.</span>
                    <Link
                      to="/add/address"
                      className="font-bold text-[#8A3324] underline ml-2 shrink-0"
                    >
                      Add Address
                    </Link>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                  Special Customizations / Notes
                </label>
                <textarea
                  rows={2}
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder="e.g. Couple portrait on palms, dulha dulhan motifs, organic cones..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D4AF37]/40 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8A3324] via-[#611C23] to-[#4A151B] text-[#FFFDF9] font-bold text-xs sm:text-sm hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {bookingLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  )}
                  <span>{bookingLoading ? 'Reserving Look...' : 'Confirm Reel Look Booking'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppInstant}
                  className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4 fill-current" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
