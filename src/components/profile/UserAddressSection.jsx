import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Home,
  Crown,
  Hotel,
  Building,
  Navigation,
  Check,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  fetchUserAddresses,
  setDefaultUserAddress,
  deleteUserAddress,
} from '../../redux/slices/userAddressSlice';
import { toast } from 'sonner';

export const UserAddressSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addresses, loading, actionLoading } = useSelector((state) => state.userAddress);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // State for Delete Confirmation Modal
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Fetch addresses on mount & whenever token/auth is available
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (isAuthenticated || token) {
      dispatch(fetchUserAddresses());
    }
  }, [dispatch, isAuthenticated]);

  const handleSetDefault = async (addrId) => {
    const res = await dispatch(setDefaultUserAddress(addrId));
    if (setDefaultUserAddress.fulfilled.match(res)) {
      toast.success('Default primary address set! ✨');
      dispatch(fetchUserAddresses());
    } else {
      toast.error(res.payload || 'Failed to set default address');
    }
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;
    const res = await dispatch(deleteUserAddress(addressToDelete._id));
    if (deleteUserAddress.fulfilled.match(res)) {
      toast.info('Address removed successfully');
      setAddressToDelete(null);
      dispatch(fetchUserAddresses());
    } else {
      toast.error(res.payload || 'Failed to delete address');
    }
  };

  const getTypeIcon = (type = '') => {
    const t = type.toLowerCase();
    if (t === 'home') return Home;
    if (t === 'wedding_venue' || t === 'venue') return Crown;
    if (t === 'hotel' || t === 'resort') return Hotel;
    return Building;
  };

  const getTypeLabel = (type = '') => {
    const t = type.toLowerCase();
    if (t === 'home') return 'Home';
    if (t === 'wedding_venue' || t === 'venue') return 'Wedding Venue';
    if (t === 'hotel' || t === 'resort') return 'Hotel / Resort';
    return type || 'Other';
  };

  const getGoogleMapsUrl = (addr) => {
    const parts = [
      addr.addressLine,
      addr.area,
      addr.city,
      addr.state,
      addr.pincode,
    ]
      .filter((p) => p && String(p).trim() !== '')
      .map((p) => String(p).trim());

    const fullAddressQuery = parts.join(', ');
    if (fullAddressQuery) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressQuery)}`;
    }
    if (addr.latitude && addr.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${addr.latitude},${addr.longitude}`;
    }
    return 'https://www.google.com/maps';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-royal text-base sm:text-lg font-bold text-[#4A151B] flex items-center gap-2">
            <span>Saved Addresses</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#D4AF37]/20 text-[#8A3324] font-bold border border-[#D4AF37]/40">
              {addresses.length} {addresses.length === 1 ? 'Saved' : 'Saved'}
            </span>
          </h3>
          <p className="text-xs text-[#4A151B]/70 mt-0.5">
            Manage your destination wedding locations, home, and resort addresses
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && addresses.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#D4AF37]/30 shadow-sm animate-pulse space-y-3"
            >
              <div className="h-4 bg-[#FAF6F0] rounded-full w-24" />
              <div className="h-4 bg-[#FAF6F0] rounded-full w-3/4" />
              <div className="h-3 bg-[#FAF6F0] rounded-full w-1/2" />
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        /* Empty State */
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#D4AF37]/30 p-8 sm:p-10 text-center space-y-3.5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] border border-[#D4AF37]/40 text-[#8A3324] mx-auto flex items-center justify-center shadow-inner">
            <MapPin className="w-7 h-7" />
          </div>
          <h4 className="font-royal font-bold text-[#4A151B] text-base sm:text-lg">
            No saved addresses found
          </h4>
          <p className="text-xs text-[#4A151B]/70 max-w-sm mx-auto leading-relaxed">
            Add your wedding venue, resort or home address for smooth artist arrival, destination kits, and consultation.
          </p>

        </div>
      ) : (
        /* Address Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const Icon = getTypeIcon(addr.addressType || addr.label);
            const isDef = !!addr.isDefault;

            return (
              <div
                key={addr._id}
                className={`bg-[#FFFDF9] rounded-3xl p-5 border transition-all relative flex flex-col justify-between hover:shadow-md ${isDef
                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-md'
                  : 'border-[#D4AF37]/35 shadow-sm'
                  }`}
              >
                <div className="space-y-2.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] text-[#4A151B] text-xs font-bold border border-[#D4AF37]/30">
                      <Icon className="w-3.5 h-3.5 text-[#8A3324]" />
                      <span>{getTypeLabel(addr.addressType || addr.label)}</span>
                    </span>

                    {isDef && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[11px] font-bold border border-[#2D6A4F]/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Default
                      </span>
                    )}
                  </div>

                  {/* Street & Area */}
                  <div>
                    <h4 className="font-bold text-sm text-[#4A151B] leading-snug">
                      {addr.addressLine}
                    </h4>
                    {addr.area && (
                      <p className="text-xs text-[#8A3324] font-semibold mt-0.5">
                        {addr.area}
                      </p>
                    )}
                  </div>

                  {/* City, State & Pincode */}
                  <p className="text-xs text-[#4A151B]/80 leading-relaxed">
                    {addr.city}, {addr.state} -{' '}
                    <span className="font-mono font-bold text-[#4A151B]">{addr.pincode}</span>
                  </p>

                  {/* Landmark */}
                  {addr.landmark && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/20 text-[11px] text-[#4A151B]/75">
                      <Navigation className="w-3 h-3 text-[#8A3324] shrink-0" />
                      <span className="truncate">Landmark: {addr.landmark}</span>
                    </div>
                  )}

                  {/* Map Location Status & Open in Google Maps Link (Shown on ALL addresses) */}
                  <div className="pt-1.5 flex items-center justify-between gap-2">
                    {addr.latitude && addr.longitude ? (
                      <span className="text-[11px] font-medium text-[#2D6A4F] flex items-center gap-1.5 bg-[#2D6A4F]/10 px-2.5 py-0.5 rounded-full border border-[#2D6A4F]/20">
                        <MapPin className="w-3 h-3 text-[#2D6A4F]" />
                        <span>Map Location Attached</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-[#8A3324]/80 flex items-center gap-1.5 bg-[#FAF6F0] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                        <MapPin className="w-3 h-3 text-[#8A3324]" />
                        <span>Saved Address</span>
                      </span>
                    )}

                    <a
                      href={getGoogleMapsUrl(addr)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#8A3324] hover:text-[#4A151B] flex items-center gap-1 hover:underline cursor-pointer ml-auto"
                      title="Open address in Google Maps"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-4 border-t border-[#D4AF37]/20 flex items-center justify-between gap-2">
                  {!isDef ? (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      disabled={actionLoading}
                      className="text-xs text-[#8A3324] hover:text-[#4A151B] font-bold hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-xs text-[#2D6A4F] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Primary Address
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate('/add/address', { state: { address: addr } })}
                      className="p-2 rounded-xl text-[#4A151B] hover:bg-[#FAF6F0] border border-transparent hover:border-[#D4AF37]/30 transition-colors cursor-pointer"
                      title="Edit Address"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setAddressToDelete(addr)}
                      disabled={actionLoading}
                      className="p-2 rounded-xl text-[#8A3324] hover:bg-[#8A3324]/10 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM CENTER ACTION BUTTONS (Add Address & Refresh) */}
      {/* ========================================================================= */}
      <div className="pt-4 pb-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(fetchUserAddresses())}
          className="p-3 rounded-2xl bg-[#FFFDF9] hover:bg-[#FAF6F0] border border-[#D4AF37]/50 text-[#8A3324] shadow-sm hover:shadow transition-all flex items-center justify-center cursor-pointer"
          title="Refresh Addresses"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => navigate('/add/address')}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#4A151B] via-[#611C23] to-[#8A3324] text-white font-royal font-bold text-xs sm:text-sm tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Add Address</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ROYAL DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-[#FFFDF9] rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Icon */}
            <button
              onClick={() => setAddressToDelete(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF6F0] text-[#4A151B]/60 hover:text-[#4A151B] hover:bg-[#F3ECE1] flex items-center justify-center transition-colors cursor-pointer border border-[#D4AF37]/30"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-3xl bg-[#8A3324]/10 border-2 border-[#8A3324]/30 text-[#8A3324] mx-auto flex items-center justify-center shadow-inner">
              <Trash2 className="w-8 h-8 text-[#8A3324]" />
            </div>

            {/* Modal Title & Message */}
            <div className="space-y-1.5">
              <h3 className="font-royal text-lg sm:text-xl font-bold text-[#4A151B]">
                Delete Saved Address?
              </h3>
              <p className="text-xs text-[#4A151B]/75 leading-relaxed max-w-xs mx-auto">
                Are you sure you want to delete this address? This action cannot be undone.
              </p>
            </div>

            {/* Address Snippet Preview */}
            <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#D4AF37]/35 text-left space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4A151B]/10 text-[#4A151B] text-[10px] font-bold uppercase">
                {getTypeLabel(addressToDelete.addressType || addressToDelete.label)}
              </span>
              <p className="font-bold text-xs text-[#4A151B] truncate">
                {addressToDelete.addressLine}
              </p>
              <p className="text-[11px] text-[#4A151B]/70 truncate">
                {[addressToDelete.area, addressToDelete.city, addressToDelete.state, addressToDelete.pincode]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl border border-[#D4AF37]/50 text-[#4A151B] hover:bg-[#FAF6F0] font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#8A3324] via-[#611C23] to-[#4A151B] text-white font-royal font-bold text-xs sm:text-sm tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {actionLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </span>
                ) : (
                  <>
                    <span>Yes, Delete</span>
                    <Trash2 className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
