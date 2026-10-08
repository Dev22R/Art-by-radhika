import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  ArrowLeft,
  Home,
  Crown,
  Hotel,
  Building,
  Check,
  Compass,
  ExternalLink,
} from 'lucide-react';
import {
  createUserAddress,
  updateUserAddress,
  fetchUserAddresses,
} from '../redux/slices/userAddressSlice';
import { LocationPickerMap } from '../components/common/LocationPickerMap';
import { toast } from 'sonner';

export const AddAddressPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { addresses, actionLoading } = useSelector((state) => state.userAddress);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Check if editing an existing address
  const queryParams = new URLSearchParams(location.search);
  const editAddressId = queryParams.get('id') || location.state?.address?._id;
  const addressToEdit =
    location.state?.address ||
    (editAddressId ? addresses.find((a) => a._id === editAddressId) : null);

  const [entryMode, setEntryMode] = useState(
    addressToEdit?.latitude && addressToEdit?.longitude ? 'map' : 'manual'
  );

  const [formData, setFormData] = useState({
    addressType: addressToEdit?.addressType || addressToEdit?.label || 'home',
    addressLine: addressToEdit?.addressLine || '',
    area: addressToEdit?.area || '',
    city: addressToEdit?.city || 'Indore',
    state: addressToEdit?.state || 'Madhya Pradesh',
    pincode: addressToEdit?.pincode || '',
    landmark: addressToEdit?.landmark || '',
    latitude: addressToEdit?.latitude || null,
    longitude: addressToEdit?.longitude || null,
    isDefault: addressToEdit ? !!addressToEdit.isDefault : addresses.length === 0,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        addressType: addressToEdit.addressType || addressToEdit.label || 'home',
        addressLine: addressToEdit.addressLine || '',
        area: addressToEdit.area || '',
        city: addressToEdit.city || 'Indore',
        state: addressToEdit.state || 'Madhya Pradesh',
        pincode: addressToEdit.pincode || '',
        landmark: addressToEdit.landmark || '',
        latitude: addressToEdit.latitude || null,
        longitude: addressToEdit.longitude || null,
        isDefault: !!addressToEdit.isDefault,
      });
    }
  }, [addressToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLocationPicked = (loc) => {
    if (loc.fromFormDetect) {
      // Only sync coordinates without overwriting actively typed form text
      setFormData((prev) => ({
        ...prev,
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      latitude: loc.latitude,
      longitude: loc.longitude,
      addressLine: loc.addressLine || prev.addressLine,
      area: loc.area || prev.area,
      city: loc.city || prev.city,
      state: loc.state || prev.state,
      pincode: loc.pincode || prev.pincode,
    }));
    toast.success('Address auto-filled from map pin! ✨');
  };

  // Form fields combined for auto-detecting location on map
  const formAddressQuery = [
    formData.addressLine,
    formData.area,
    formData.city,
    formData.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.addressLine.trim()) {
      toast.error('Please enter flat, street or venue address');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter city');
      return;
    }
    if (!formData.pincode.trim() || formData.pincode.trim().length < 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    const payload = {
      addressType: formData.addressType || 'home',
      label: formData.addressType || 'home',
      addressLine: formData.addressLine.trim(),
      area: formData.area.trim(),
      city: formData.city.trim(),
      state: formData.state.trim() || 'Madhya Pradesh',
      pincode: formData.pincode.trim(),
      landmark: formData.landmark.trim(),
      latitude:
        formData.latitude !== null && formData.latitude !== '' && !isNaN(formData.latitude)
          ? parseFloat(formData.latitude)
          : null,
      longitude:
        formData.longitude !== null && formData.longitude !== '' && !isNaN(formData.longitude)
          ? parseFloat(formData.longitude)
          : null,
      isDefault: Boolean(formData.isDefault),
    };

    if (addressToEdit) {
      const res = await dispatch(
        updateUserAddress({ addressId: addressToEdit._id, payload })
      );
      if (updateUserAddress.fulfilled.match(res)) {
        toast.success('Address updated successfully! ✨');
        dispatch(fetchUserAddresses());
        navigate('/profile/address');
      } else {
        toast.error(res.payload || 'Failed to update address');
      }
    } else {
      const res = await dispatch(createUserAddress(payload));
      if (createUserAddress.fulfilled.match(res)) {
        toast.success('New address added successfully! ✨');
        dispatch(fetchUserAddresses());
        navigate('/profile/address');
      } else {
        toast.error(res.payload || 'Failed to add address');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-32 animate-in fade-in duration-200">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Main Card Container */}
        <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#D4AF37]/45 shadow-xl overflow-hidden">
          {/* Thin Header with Back Arrow and Heading only */}
          <div className="bg-gradient-to-r from-[#2A0C0E] via-[#4A151B] to-[#7E2730] px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              {/* Back Button with only Arrow */}
              <button
                type="button"
                onClick={() => navigate('/profile/address')}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-[#D4AF37] hover:text-white flex items-center justify-center transition-all cursor-pointer border border-[#D4AF37]/30"
                title="Go Back"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Thin Title */}
              <h1 className="font-royal text-lg sm:text-xl font-bold tracking-wide text-[#FAF6F0]">
                {addressToEdit ? 'Edit Address' : 'Add Address'}
              </h1>
            </div>

            <span className="text-[11px] text-[#D4AF37] font-royal tracking-wider font-semibold uppercase hidden sm:inline">
              Destination Desk
            </span>
          </div>

          {/* Mode Switcher: Manual Entry vs Map Picker */}
          <div className="px-5 py-3 bg-[#FAF6F0]/90 border-b border-[#D4AF37]/20 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#4A151B] uppercase tracking-wider hidden sm:inline">
              Entry Method
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setEntryMode('manual')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${entryMode === 'manual'
                    ? 'bg-[#4A151B] text-[#FAF6F0] shadow-sm'
                    : 'bg-white text-[#4A151B] hover:bg-[#FAF6F0] border border-[#D4AF37]/40'
                  }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Manual Form</span>
              </button>

              <button
                type="button"
                onClick={() => setEntryMode('map')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${entryMode === 'map'
                    ? 'bg-[#4A151B] text-[#FAF6F0] shadow-sm'
                    : 'bg-white text-[#4A151B] hover:bg-[#FAF6F0] border border-[#D4AF37]/40'
                  }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Pick on Map</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
            {/* If Map Mode Selected: Render Leaflet Map Picker */}
            {entryMode === 'map' && (
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#FAF6F0]/70 border border-[#D4AF37]/30 shadow-inner">
                <LocationPickerMap
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                  onLocationSelect={handleLocationPicked}
                  externalQuery={formAddressQuery}
                  height="300px"
                />
              </div>
            )}

            {/* Address Category */}
            <div>
              <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1.5">
                Address Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'home', label: 'Home', icon: Home },
                  { id: 'wedding_venue', label: 'Wedding Venue', icon: Crown },
                  { id: 'hotel', label: 'Hotel / Resort', icon: Hotel },
                  { id: 'other', label: 'Other', icon: Building },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = formData.addressType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, addressType: item.id }))}
                      className={`py-2.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${isSel
                          ? 'bg-[#4A151B] text-[#D4AF37] border-2 border-[#D4AF37] shadow-sm'
                          : 'bg-[#FAF6F0] text-[#4A151B] border border-[#D4AF37]/40 hover:bg-[#F3ECE1]'
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Street / Flat / Venue Address */}
            <div>
              <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                Street / Flat / Venue Address *
              </label>
              <input
                type="text"
                name="addressLine"
                required
                value={formData.addressLine}
                onChange={handleChange}
                placeholder="e.g. Flat 402, Lotus Residency / The Oberoi Udaivilas"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324] shadow-sm"
              />
            </div>

            {/* Area (Village / Town / Suburb) & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider">
                    Area / Locality
                  </label>
                  <span className="text-[10px] text-[#8A3324] font-semibold">
                    Village / Town / Colony
                  </span>
                </div>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. Village / Town name or Vijay Nagar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Near Brilliant Convention Centre"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324] shadow-sm"
                />
              </div>
            </div>

            {/* City, State & Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider">
                    City *
                  </label>
                  <span className="text-[10px] text-[#8A3324] font-semibold">Major City</span>
                </div>
                <input
                  type="text"
                  name="city"
                  list="major-cities-list-full"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Indore / Ujjain / Bhopal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324] shadow-sm"
                />
                <datalist id="major-cities-list-full">
                  <option value="Indore" />
                  <option value="Ujjain" />
                  <option value="Bhopal" />
                  <option value="Dewas" />
                  <option value="Ratlam" />
                  <option value="Gwalior" />
                  <option value="Jabalpur" />
                  <option value="Jaipur" />
                  <option value="Udaipur" />
                  <option value="Jodhpur" />
                  <option value="Kota" />
                  <option value="Ahmedabad" />
                  <option value="Surat" />
                  <option value="Vadodara" />
                  <option value="Mumbai" />
                  <option value="Pune" />
                  <option value="Delhi" />
                  <option value="Agra" />
                  <option value="Lucknow" />
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Madhya Pradesh / Rajasthan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="452010"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324] shadow-sm"
                />
              </div>
            </div>

            {/* Location Map Status Indicator */}
            {formData.latitude && formData.longitude && (
              <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#D4AF37]/35 flex items-center justify-between text-xs text-[#4A151B]">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#2D6A4F]/15 text-[#2D6A4F] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2D6A4F] text-xs">
                      Exact Map Location Pinned
                    </p>
                    <p className="text-[10px] text-[#4A151B]/70">
                      GPS coordinates will be securely saved with your address
                    </p>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [formData.addressLine, formData.area, formData.city, formData.state]
                      .filter(Boolean)
                      .join(', ') || `${formData.latitude},${formData.longitude}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#8A3324] hover:text-[#4A151B] flex items-center gap-1 hover:underline cursor-pointer shrink-0"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Default Address Checkbox */}
            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#4A151B] focus:ring-[#8A3324] accent-[#4A151B]"
              />
              <span className="text-xs font-semibold text-[#4A151B]">
                Set as default primary address for bookings &amp; kits
              </span>
            </label>

            {/* ========================================================================= */}
            {/* BOTTOM CENTER ACTION BUTTONS (Back Button & Save Address) */}
            {/* ========================================================================= */}
            <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 border-t border-[#D4AF37]/30">
              <button
                type="button"
                onClick={() => navigate('/profile/address')}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl border-2 border-[#D4AF37]/60 bg-white hover:bg-[#FAF6F0] text-[#4A151B] font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-[#8A3324]" />
                <span>Back to Addresses</span>
              </button>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full sm:w-auto px-9 py-3 rounded-2xl bg-gradient-to-r from-[#4A151B] via-[#611C23] to-[#8A3324] text-white font-royal font-bold text-xs sm:text-sm tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {actionLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Address...</span>
                  </span>
                ) : (
                  <>
                    <span>{addressToEdit ? 'Save Changes' : 'Save Address'}</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
