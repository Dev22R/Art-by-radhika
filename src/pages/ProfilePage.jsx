import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Crown,
  Heart,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut,
  User as UserIcon,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Edit3,
  Check,
  Camera,
  X,
  BadgeCheck,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { DESIGNS_DATA } from '../data/mehndiData';
import {
  loginUser,
  signupUser,
  logoutUser,
  fetchUserProfile,
  completeProfile,
  updateProfile,
  clearAuthError,
} from '../redux/slices/authSlice';
import { fetchUserAddresses } from '../redux/slices/userAddressSlice';
import { UserAddressSection } from '../components/profile/UserAddressSection';
import { LogoutModal } from '../components/LogoutModal';
import { toast } from 'sonner';

export const ProfilePage = ({
  favorites = [],
  onSelectDesign,
  onOpenEnquiry,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, updatingProfile, error } = useSelector((state) => state.auth);
  const { addresses } = useSelector((state) => state.userAddress);

  // Sync active menu with current URL path
  const getActiveMenuFromPath = (path) => {
    if (path.includes('/profile/bookings')) return 'bookings';
    if (path.includes('/profile/saved')) return 'saved';
    if (path.includes('/profile/address') || path.includes('/profile/addresses')) return 'address';
    return 'profile';
  };

  const [activeMenu, setActiveMenu] = useState(() => getActiveMenuFromPath(location.pathname));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setActiveMenu(getActiveMenuFromPath(location.pathname));
  }, [location.pathname]);

  // Click outside to close header dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveMenu(tabId);
    setIsMenuOpen(false);
    if (tabId === 'bookings') navigate('/profile/bookings');
    else if (tabId === 'saved') navigate('/profile/saved');
    else if (tabId === 'address') navigate('/profile/address');
    else navigate('/profile');
  };

  // Auth form states (when not logged in)
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [authFormData, setAuthFormData] = useState({
    phone: '',
    password: '',
    name: '',
  });

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const quickAvatarInputRef = useRef(null);

  // Sample User Bookings State (Stored in localStorage)
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('art_by_radhika_bookings');
      return saved
        ? JSON.parse(saved)
        : [
          {
            id: 'BK-8902',
            packageTitle: 'Royal Marwari Heritage Bridal Package',
            date: '2026-11-18',
            time: '11:00 AM',
            venue: 'The Oberoi Udaivilas, Udaipur',
            status: 'Confirmed',
            price: '₹25,000',
            artist: 'Radhika (Master Artist)',
          },
        ];
    } catch {
      return [];
    }
  });

  // Fetch latest user profile and addresses on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (isAuthenticated || token) {
      dispatch(fetchUserProfile());
      dispatch(fetchUserAddresses());
    }
  }, [dispatch, isAuthenticated]);

  // Sync user values into edit state
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  const favoritedDesigns = DESIGNS_DATA.filter((d) => favorites.includes(d.id));

  // --- Auth Handlers ---
  const handleAuthChange = (e) => {
    setAuthFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) dispatch(clearAuthError());
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = authFormData.phone.trim().replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (!authFormData.password || authFormData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (authMode === 'signup') {
      const payload = {
        phone: cleanPhone,
        password: authFormData.password,
      };
      if (authFormData.name.trim()) payload.name = authFormData.name.trim();

      const res = await dispatch(signupUser(payload));
      if (signupUser.fulfilled.match(res)) {
        toast.success('Royal Welcome! Account created successfully ✨');
      } else {
        toast.error(res.payload || 'Signup failed');
      }
    } else {
      const res = await dispatch(loginUser({ phone: cleanPhone, password: authFormData.password }));
      if (loginUser.fulfilled.match(res)) {
        toast.success(`Welcome back, ${res.payload?.data?.user?.name || 'Bride'}! ✨`);
      } else {
        toast.error(res.payload || 'Login failed');
      }
    }
  };

  // --- Quick Avatar Upload (Only sends profileImage) ---
  const handleQuickAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    const toastId = toast.loading('Uploading profile picture...');
    const res = await dispatch(updateProfile(formData));
    toast.dismiss(toastId);

    if (updateProfile.fulfilled.match(res)) {
      toast.success('Profile photo updated! ✨');
      dispatch(fetchUserProfile());
    } else {
      toast.error(res.payload || 'Failed to update photo');
    }

    if (quickAvatarInputRef.current) quickAvatarInputRef.current.value = '';
  };

  // --- Edit Profile Form Submit (Only sends modified fields) ---
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    setEditImageFile(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    let hasChanges = false;

    // 1. Check if name was changed
    const currentName = (user?.name || '').trim();
    const newName = editName.trim();
    if (newName && newName !== currentName) {
      formData.append('name', newName);
      hasChanges = true;
    }

    // 2. Check if email was changed
    const currentEmail = (user?.email || '').trim();
    const newEmail = editEmail.trim();
    if (newEmail !== currentEmail) {
      if (newEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
          toast.error('Please enter a valid email address');
          return;
        }
        formData.append('email', newEmail);
        hasChanges = true;
      }
    }

    // 3. Check if profileImage was changed
    if (editImageFile) {
      formData.append('profileImage', editImageFile);
      hasChanges = true;
    }

    if (!hasChanges) {
      toast.info('No changes were made to update');
      return;
    }

    let res;
    if (!user?.isProfileCompleted && (newEmail || editImageFile)) {
      res = await dispatch(completeProfile(formData));
    } else {
      res = await dispatch(updateProfile(formData));
    }

    if (completeProfile.fulfilled.match(res) || updateProfile.fulfilled.match(res)) {
      toast.success('Profile updated successfully! ✨');
      setEditImageFile(null);
      setEditImagePreview(null);
      dispatch(fetchUserProfile());
      handleTabChange('profile');
    } else {
      toast.error(res.payload || 'Failed to update profile');
    }
  };

  const menuOptions = [
    { id: 'profile', path: '/profile', label: 'Profile', icon: UserIcon },
    { id: 'bookings', path: '/profile/bookings', label: 'Bookings', icon: Calendar, count: bookings.length },
    { id: 'saved', path: '/profile/saved', label: 'Saved', icon: Heart, count: favoritedDesigns.length },
    { id: 'address', path: '/profile/address', label: 'Address', icon: MapPin, count: addresses.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-28">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={quickAvatarInputRef}
        onChange={handleQuickAvatarChange}
        accept="image/*"
        className="hidden"
      />

      {/* Fixed Top-Right Floating Menu Button */}
      {isAuthenticated && user && (
        <div className="fixed top-15 sm:top-24 right-4 sm:right-6 md:right-8 lg:right-12 z-40" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg backdrop-blur-md ${isMenuOpen
              ? 'bg-[#4A151B] text-[#FAF6F0] border-[#D4AF37] shadow-xl scale-105'
              : 'bg-[#FFFDF9]/95 text-[#4A151B] border-[#D4AF37]/60 hover:bg-[#FAF6F0] hover:border-[#D4AF37] hover:shadow-xl'
              }`}
            aria-label="Profile Menu"
          >
            <Menu className="w-4 h-4 text-[#D4AF37]" />

            <ChevronDown
              className={`w-3.5 h-3.5 text-[#8A3324] transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-white' : ''
                }`}
            />
          </button>

          {/* Dropdown Menu with 4 Options: Profile, Bookings, Saved, Address */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-[#FFFDF9] rounded-2xl border-2 border-[#D4AF37]/50 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              <div className="px-3.5 py-2 border-b border-[#D4AF37]/20 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A3324]">
                  Profile Menu
                </span>
                <span className="text-[10px] text-[#4A151B]/60 font-medium">4 options</span>
              </div>

              <div className="p-1.5 space-y-1">
                {menuOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = activeMenu === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleTabChange(opt.id)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${isActive
                        ? 'bg-[#4A151B] text-[#FAF6F0] shadow-sm'
                        : 'text-[#4A151B] hover:bg-[#FAF6F0] hover:text-[#8A3324]'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#8A3324]'}`} />
                        <span>{opt.label}</span>
                      </div>

                      {opt.count !== undefined && (
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${isActive
                            ? 'bg-[#D4AF37] text-[#2A0C0E]'
                            : 'bg-[#FAF6F0] text-[#4A151B] border border-[#D4AF37]/40'
                            }`}
                        >
                          {opt.count}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Sign Out Menu Option */}
                <div className="pt-1 mt-1 border-t border-[#D4AF37]/20">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 text-[#E63946] hover:bg-[#E63946]/10 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-[#E63946]" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isAuthenticated && user ? (
        <>
          {/* ========================================================================= */}
          {/* 1. PROFILE VIEW (/profile) - PROFILE HEADER CARD & EDIT PROFILE FORM */}
          {/* ========================================================================= */}
          {activeMenu === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Profile Card Header (Shown only on Profile) */}
              <div className="bg-[#FFFDF9] rounded-3xl p-5 sm:p-7 border border-[#D4AF37]/40 shadow-md relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                    {/* Photo with Camera Edit Overlay */}
                    <div className="relative group shrink-0">
                      <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr from-[#4A151B] via-[#D4AF37] to-[#8A3324] shadow-md flex items-center justify-center">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.name || 'User'}
                            className="w-full h-full object-cover rounded-full border-2 border-white"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-[#4A151B] flex items-center justify-center text-[#D4AF37] font-royal font-bold text-2xl sm:text-3xl border-2 border-white">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'B'}
                          </div>
                        )}
                      </div>

                      {/* Quick Change Avatar Button */}
                      <button
                        type="button"
                        onClick={() => quickAvatarInputRef.current?.click()}
                        className="absolute inset-0 m-1 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                        title="Change Photo"
                      >
                        <Camera className="w-5 h-5 text-[#D4AF37]" />
                      </button>
                    </div>

                    {/* User Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="font-royal text-xl sm:text-2xl font-bold text-[#4A151B] truncate">
                          {user.name || 'Royal Bride'}
                        </h2>
                        {user.isProfileCompleted && (
                          <BadgeCheck className="w-4 h-4 text-[#2D6A4F] shrink-0" title="Completed Profile" />
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#4A151B]/80 font-medium truncate mt-0.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#8A3324] shrink-0" />
                        <span>{user.email || 'No email added'}</span>
                      </p>

                      <p className="text-xs text-[#8A3324] font-semibold mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 shrink-0" />
                        <span>+91 {user.phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Sign Out Button in Header Card */}
                  <button
                    type="button"
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="px-3 py-2 rounded-2xl bg-[#FAF6F0] hover:bg-[#8A3324]/10 text-[#8A3324] border border-[#D4AF37]/40 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-sm"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Edit Profile Form directly below Profile Header */}
              <div className="bg-[#FFFDF9] rounded-3xl p-5 sm:p-7 border border-[#D4AF37]/40 shadow-sm space-y-5">
                <div>
                  <h3 className="font-royal text-base sm:text-lg font-bold text-[#4A151B]">
                    Edit Profile
                  </h3>
                  <p className="text-xs text-[#4A151B]/70">
                    Update your full name, email address, and profile photo
                  </p>
                </div>

                <form onSubmit={handleProfileUpdateSubmit} className="space-y-4 max-w-lg">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Avatar Preview & Upload */}
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#4A151B] via-[#D4AF37] to-[#8A3324] shadow-md flex items-center justify-center cursor-pointer group relative overflow-hidden"
                    >
                      {editImagePreview ? (
                        <img
                          src={editImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name || 'User'}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#4A151B] flex items-center justify-center text-[#D4AF37] font-bold text-2xl">
                          {editName ? editName.charAt(0).toUpperCase() : 'B'}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-full bg-[#FAF6F0] border border-[#D4AF37]/50 text-xs font-bold text-[#4A151B] hover:bg-[#F3ECE1] transition-colors cursor-pointer"
                      >
                        {editImageFile ? 'Change Photo' : 'Upload New Photo'}
                      </button>
                      {editImageFile && (
                        <p className="text-[11px] text-[#2D6A4F] font-semibold mt-1">
                          ✓ {editImageFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[#8A3324] absolute left-3 top-3.5" />
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="e.g. Radhika Sharma"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8A3324] absolute left-3 top-3.5" />
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="e.g. radhika@example.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                      />
                    </div>
                  </div>

                  {/* Phone (Read Only) */}
                  <div>
                    <label className="block text-xs font-bold text-[#4A151B]/70 uppercase tracking-wider mb-1">
                      Registered Mobile
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-[#8A3324] select-none">
                        +91
                      </span>
                      <input
                        type="text"
                        disabled
                        value={user.phone}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#FAF6F0]/40 text-xs text-[#4A151B]/60 font-semibold cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4A151B] via-[#611C23] to-[#8A3324] text-white font-royal font-bold text-xs tracking-wider shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {updatingProfile ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </span>
                      ) : (
                        <>
                          <span>Save Changes</span>
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. BOOKINGS VIEW (/profile/bookings) */}
          {/* ========================================================================= */}
          {activeMenu === 'bookings' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-royal text-base sm:text-lg font-bold text-[#4A151B]">
                    Bridal Mehndi Appointments
                  </h3>
                  <p className="text-xs text-[#4A151B]/70">
                    Track your reserved bridal henna dates &amp; artist schedule
                  </p>
                </div>

                <button
                  onClick={onOpenEnquiry}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#4A151B] to-[#8A3324] text-white text-xs font-bold shadow-sm hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer mr-24 sm:mr-28"
                >
                  <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="hidden sm:inline">Book New Slot</span>
                  <span className="sm:hidden">Book</span>
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-[#FFFDF9] rounded-3xl border border-[#D4AF37]/30 p-8 text-center space-y-3">
                  <Calendar className="w-10 h-10 text-[#8A3324]/40 mx-auto" />
                  <h4 className="font-royal font-bold text-[#4A151B] text-base">No active bookings yet</h4>
                  <p className="text-xs text-[#4A151B]/70 max-w-sm mx-auto">
                    Reserve your wedding dates with Master Artist Radhika to secure Sojat organic herbal mehndi.
                  </p>
                  <button
                    onClick={onOpenEnquiry}
                    className="px-5 py-2 rounded-full bg-[#4A151B] text-white text-xs font-semibold hover:bg-[#611C23] transition-colors cursor-pointer"
                  >
                    Request Bridal Consultation
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-[#FFFDF9] rounded-2xl border border-[#D4AF37]/40 p-4 sm:p-5 shadow-sm space-y-3 relative overflow-hidden"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#D4AF37]/20 pb-3">
                        <div>
                          <span className="text-[10px] font-mono text-[#8A3324] font-bold uppercase tracking-wider">
                            Booking #{b.id}
                          </span>
                          <h4 className="font-royal text-base font-bold text-[#4A151B]">
                            {b.packageTitle}
                          </h4>
                          <p className="text-xs text-[#8A3324] font-semibold mt-0.5">
                            Artist: {b.artist}
                          </p>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-xs font-bold border border-[#2D6A4F]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {b.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-[#4A151B]">
                          <Calendar className="w-4 h-4 text-[#8A3324]" />
                          <span>
                            <strong>Date:</strong> {b.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#4A151B]">
                          <Clock className="w-4 h-4 text-[#8A3324]" />
                          <span>
                            <strong>Time:</strong> {b.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#4A151B]">
                          <MapPin className="w-4 h-4 text-[#8A3324]" />
                          <span className="truncate">
                            <strong>Venue:</strong> {b.venue}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-[#D4AF37]/15">
                        <span className="font-royal font-bold text-sm text-[#4A151B]">
                          Estimate: {b.price}
                        </span>

                        <button
                          onClick={onOpenEnquiry}
                          className="text-xs font-semibold text-[#8A3324] hover:text-[#4A151B] underline cursor-pointer"
                        >
                          Modify / Contact Desk
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. SAVED DESIGNS VIEW (/profile/saved) */}
          {/* ========================================================================= */}
          {activeMenu === 'saved' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-royal text-base sm:text-lg font-bold text-[#4A151B]">
                    My Saved Bridal Designs ({favoritedDesigns.length})
                  </h3>
                  <p className="text-xs text-[#4A151B]/70">
                    Your personal moodboard of hand &amp; feet mehndi patterns
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => navigate('/designs')}
                    className="text-xs font-bold text-[#8A3324] hover:underline cursor-pointer hidden sm:inline"
                  >
                    + Browse More
                  </button>
                </div>
              </div>

              {favoritedDesigns.length === 0 ? (
                <div className="bg-[#FFFDF9] rounded-3xl border border-[#D4AF37]/30 p-8 text-center space-y-3">
                  <Heart className="w-10 h-10 text-[#8A3324]/40 mx-auto" />
                  <h4 className="font-royal font-bold text-[#4A151B] text-base">No saved designs yet</h4>
                  <p className="text-xs text-[#4A151B]/70 max-w-sm mx-auto">
                    Click the heart icon on any design in our gallery to add it here.
                  </p>
                  <button
                    onClick={() => navigate('/designs')}
                    className="px-5 py-2 rounded-full bg-[#4A151B] text-white text-xs font-semibold hover:bg-[#611C23] transition-colors cursor-pointer"
                  >
                    Browse Designs Lookbook
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoritedDesigns.map((design) => (
                    <div
                      key={design.id}
                      className="bg-[#FFFDF9] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-sm flex flex-col justify-between"
                    >
                      <div className="relative aspect-[4/3] bg-[#2A0C0E] overflow-hidden">
                        <img
                          src={design.image}
                          alt={design.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = design.fallbackImage;
                          }}
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-[#D4AF37]">
                          {design.style}
                        </span>
                      </div>

                      <div className="p-3.5 space-y-2">
                        <h4 className="font-royal font-bold text-[#4A151B] text-sm">
                          {design.title}
                        </h4>
                        <p className="text-[11px] text-[#4A151B]/70 line-clamp-2">
                          {design.description}
                        </p>
                        <div className="pt-2 flex items-center justify-between border-t border-[#D4AF37]/20">
                          <span className="font-royal font-bold text-xs text-[#4A151B]">
                            {design.priceEstimate}
                          </span>
                          <button
                            onClick={() => onSelectDesign(design)}
                            className="px-2.5 py-1 rounded-lg bg-[#4A151B] text-[#FAF6F0] text-[11px] font-bold hover:bg-[#611C23] transition-colors cursor-pointer"
                          >
                            View &amp; Book
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. USER ADDRESS MANAGEMENT VIEW (/profile/address) */}
          {/* ========================================================================= */}
          {activeMenu === 'address' && <UserAddressSection />}
        </>
      ) : (
        /* ========================================================================= */
        /* UNAUTHENTICATED LOGIN / SIGNUP CARD */
        /* ========================================================================= */
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-10 border-2 border-[#D4AF37]/50 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info */}
            <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A151B] text-[#D4AF37] text-xs font-bold shadow-sm">
                <Crown className="w-3.5 h-3.5" />
                <span>Bride Atelier Sanctuary</span>
              </div>

              <h2 className="font-royal text-2xl sm:text-3xl font-bold text-[#4A151B] leading-tight">
                Welcome to Your <br />
                <span className="text-[#8A3324] italic font-serif-elegant">Royal Bridal Profile</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#4A151B]/80 leading-relaxed max-w-md mx-auto lg:mx-0">
                Sign in to manage your appointments, addresses, favorite designs, and personal bridal profile.
              </p>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl border border-[#D4AF37]/40 shadow-lg overflow-hidden max-w-md mx-auto">
                <div className="flex border-b border-[#D4AF37]/25 bg-[#FAF6F0]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      dispatch(clearAuthError());
                    }}
                    className={`flex-1 py-3 text-xs sm:text-sm font-royal font-bold transition-all text-center cursor-pointer ${authMode === 'login'
                      ? 'text-[#4A151B] border-b-2 border-[#8A3324] bg-white shadow-sm'
                      : 'text-[#4A151B]/60 hover:text-[#4A151B]'
                      }`}
                  >
                    Bride Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      dispatch(clearAuthError());
                    }}
                    className={`flex-1 py-3 text-xs sm:text-sm font-royal font-bold transition-all text-center cursor-pointer ${authMode === 'signup'
                      ? 'text-[#4A151B] border-b-2 border-[#8A3324] bg-white shadow-sm'
                      : 'text-[#4A151B]/60 hover:text-[#4A151B]'
                      }`}
                  >
                    New Registration
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="p-5 sm:p-6 space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-[#8A3324]/10 border border-[#8A3324]/30 text-[#8A3324] text-xs font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8A3324]" />
                      <span>{error}</span>
                    </div>
                  )}

                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                        Bride Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-[#8A3324] absolute left-3 top-3" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={authFormData.name}
                          onChange={handleAuthChange}
                          placeholder="e.g. Radhika Sharma"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-[#8A3324] select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        required
                        maxLength={10}
                        value={authFormData.phone}
                        onChange={handleAuthChange}
                        placeholder="e.g. 6268443063"
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] font-semibold tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A151B] uppercase tracking-wider mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8A3324] absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={authFormData.password}
                        onChange={handleAuthChange}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#FAF6F0]/60 text-xs text-[#2C1810] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8A3324]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[#4A151B]/60 hover:text-[#4A151B] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#4A151B] via-[#611C23] to-[#8A3324] text-white font-royal font-bold text-xs sm:text-sm tracking-wider shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </span>
                    ) : (
                      <>
                        <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};
