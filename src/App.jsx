import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { Navbar } from './components/Navbar';
import { BottomNavbar } from './components/BottomNavbar';
import { FloatingEnquiryBtn } from './components/FloatingEnquiryBtn';
import { EnquiryModal } from './components/EnquiryModal';
import { DesignModal } from './components/DesignModal';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { DesignsPage } from './pages/DesignsPage';
import { PricingPage } from './pages/PricingPage';
import { ReelsPage } from './pages/ReelsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AddAddressPage } from './pages/AddAddressPage';
import { LogoutModal } from './components/LogoutModal';
import { Crown, ShieldCheck, Phone, MapPin, LogOut } from 'lucide-react';
import { fetchUserProfile, logoutUser } from './redux/slices/authSlice';
import { fetchUserAddresses } from './redux/slices/userAddressSlice';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryPreselected, setEnquiryPreselected] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Selected design for lightbox modal
  const [selectedDesign, setSelectedDesign] = useState(null);

  // Favorites state (ids of saved designs)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('art_by_radhika_favorites');
      return saved ? JSON.parse(saved) : ['des-1', 'des-4'];
    } catch {
      return ['des-1', 'des-4'];
    }
  });

  // On App Mount: Fetch user profile and addresses if token is present
  useEffect(() => {
    if (isAuthenticated || localStorage.getItem('accessToken')) {
      dispatch(fetchUserProfile());
      dispatch(fetchUserAddresses());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem('art_by_radhika_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Authentication-Guarded Handlers
  const handleGeneralEnquiry = () => {
    if (!isAuthenticated) {
      toast.error('Please login first to reserve your bridal date & consultation! ✨');
      setEnquiryPreselected(null);
      setIsAuthOpen(true);
      return;
    }
    setEnquiryPreselected(null);
    setIsEnquiryOpen(true);
  };

  const handleToggleLike = (designId) => {
    if (!isAuthenticated) {
      toast.error('Please login first to save designs to your mood board! ✨');
      setIsAuthOpen(true);
      return;
    }
    setFavorites((prev) => {
      const exists = prev.includes(designId);
      if (exists) {
        toast.info('Removed from saved designs');
        return prev.filter((id) => id !== designId);
      } else {
        toast.success('Saved to your bridal inspiration! ❤️');
        return [...prev, designId];
      }
    });
  };

  const handleOpenEnquiryWithItem = (item) => {
    if (!isAuthenticated) {
      toast.error('Please login first to book this design or package! ✨');
      setEnquiryPreselected(item);
      setIsAuthOpen(true);
      return;
    }
    setEnquiryPreselected(item);
    setIsEnquiryOpen(true);
  };

  const handleBookLookFromReel = (reel) => {
    const item = { title: `${reel.title} (${reel.artist})` };
    if (!isAuthenticated) {
      toast.error('Please login first to book this look! ✨');
      setEnquiryPreselected(item);
      setIsAuthOpen(true);
      return;
    }
    setEnquiryPreselected(item);
    setIsEnquiryOpen(true);
  };

  const isAddAddressPage =
    location.pathname.startsWith('/add') || location.pathname.includes('add/address');
  const isReelsPage = location.pathname.startsWith('/reels');

  return (
    <div
      className={`${
        isReelsPage ? 'h-[100dvh] overflow-hidden bg-black text-white' : 'min-h-screen bg-[#FAF6F0] text-[#2C1810]'
      } flex flex-col font-sans relative selection:bg-[#722F37] selection:text-[#FAF6F0]`}
    >
      {/* Sonner Toast Notification Provider (Royal Customized UI) */}
      <Toaster
        position="top-center"
        expand={true}
        closeButton={true}
        duration={3500}
        theme="light"
      />

      {/* Top Desktop/Tablet Navbar (Hidden on mobile when in Reels mode for full immersion) */}
      <div className={isReelsPage ? 'hidden md:block' : ''}>
        <Navbar
          onOpenEnquiry={handleGeneralEnquiry}
          onOpenAuth={() => setIsAuthOpen(true)}
          favoritesCount={favorites.length}
        />
      </div>

      {/* Main Content Area with React Router Routes */}
      <main className={isReelsPage ? 'flex-1 bg-black flex flex-col pt-0 md:pt-16' : 'flex-1 pt-18 sm:pt-20'}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onOpenEnquiry={handleGeneralEnquiry}
                onSelectDesign={(design) => setSelectedDesign(design)}
              />
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />

          <Route
            path="/designs"
            element={
              <DesignsPage
                onSelectDesign={(design) => setSelectedDesign(design)}
                onBookDesign={(design) => handleOpenEnquiryWithItem(design)}
                favorites={favorites}
                onToggleLike={handleToggleLike}
              />
            }
          />

          <Route
            path="/pricing"
            element={
              <PricingPage
                onSelectPackage={(pkg) => handleOpenEnquiryWithItem(pkg)}
              />
            }
          />

          <Route
            path="/reels"
            element={<ReelsPage onBookLook={handleBookLookFromReel} />}
          />

          <Route
            path="/profile/*"
            element={
              <ProfilePage
                favorites={favorites}
                onSelectDesign={(design) => setSelectedDesign(design)}
                onOpenEnquiry={handleGeneralEnquiry}
              />
            }
          />

          {/* Full Page Add / Edit Destination Address Route */}
          <Route path="/add/address" element={<AddAddressPage />} />
          <Route path="/add-address" element={<Navigate to="/add/address" replace />} />
          <Route path="/profile/add/address" element={<Navigate to="/add/address" replace />} />

          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating Contact Enquiry Button (Hidden on /profile when logged out, on /add/address, and on /reels page) */}
      {(!location.pathname.startsWith('/profile') || isAuthenticated) &&
        !isAddAddressPage &&
        !isReelsPage && <FloatingEnquiryBtn onClick={handleGeneralEnquiry} />}

      {/* Mobile Modern Bottom Navigation Bar (Hidden on /add/address page) */}
      {!isAddAddressPage && <BottomNavbar />}

      {/* Lightbox Design Modal */}
      <DesignModal
        design={selectedDesign}
        isOpen={!!selectedDesign}
        onClose={() => setSelectedDesign(null)}
        onBookDesign={(design) => handleOpenEnquiryWithItem(design)}
        isLiked={selectedDesign ? favorites.includes(selectedDesign.id) : false}
        onToggleLike={handleToggleLike}
      />

      {/* Royal Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        preselectedItem={enquiryPreselected}
      />

      {/* Auth Modal (Login / Signup) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          if (enquiryPreselected) {
            setIsEnquiryOpen(true);
          }
        }}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* Royal Footer (Hidden on Add Address Page and Reels Page) */}
      {!isAddAddressPage && !isReelsPage && (
        <footer className="bg-[#2A0C0E] text-[#FFFDF9] pt-12 pb-24 md:pb-12 border-t-2 border-[#D4AF37]/40 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#2A0C0E] font-bold">
                  <Crown className="w-5 h-5" />
                </div>
                <span className="font-royal text-xl font-bold tracking-wider text-[#D4AF37]">
                  Art-BY-radhika
                </span>
              </div>
              <p className="text-xs text-[#FAF6F0]/70 leading-relaxed">
                Adorning royal brides since 2012 with 100% natural, chemical-free triple sifted Rajasthani Sojat henna by Radhika.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#D4AF37]">
                <ShieldCheck className="w-4 h-4" />
                <span>Deep Mahogany Stain Guarantee</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="space-y-3">
              <h4 className="font-royal text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
                Explore Artistry
              </h4>
              <ul className="space-y-1.5 text-xs text-[#FAF6F0]/80">
                <li>
                  <Link to="/" className="hover:text-[#D4AF37] transition-colors cursor-pointer block">
                    Home &amp; Highlights
                  </Link>
                </li>
                <li>
                  <Link to="/designs" className="hover:text-[#D4AF37] transition-colors cursor-pointer block">
                    Designs Lookbook (200+)
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-[#D4AF37] transition-colors cursor-pointer block">
                    Bridal Packages &amp; Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/reels" className="hover:text-[#D4AF37] transition-colors cursor-pointer block">
                    Live Video Reels Feed
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-[#D4AF37] transition-colors cursor-pointer block">
                    Artist Atelier &amp; User Profile
                  </Link>
                </li>
                {isAuthenticated && (
                  <li className="pt-1">
                    <button
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="text-[#E63946] hover:text-[#FFAAA6] transition-colors cursor-pointer flex items-center gap-1.5 font-semibold text-xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Col 3: Specialties */}
            <div className="space-y-3">
              <h4 className="font-royal text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
                Bridal Styles
              </h4>
              <ul className="space-y-1.5 text-xs text-[#FAF6F0]/70">
                <li>• Royal Marwari &amp; Rajwada Heritage</li>
                <li>• Bespoke Couple Portrait Medallions</li>
                <li>• Dubai Negative-Space Gulf Khafif</li>
                <li>• Padmavati Lotus &amp; Sacred Mandalas</li>
                <li>• Destination Wedding Artist Service</li>
              </ul>
            </div>

            {/* Col 4: Contact & Appointments */}
            <div className="space-y-3">
              <h4 className="font-royal text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
                Consultation Desk
              </h4>
              <div className="space-y-2 text-xs text-[#FAF6F0]/80">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Udaipur • Mumbai • Destination Global</span>
                </div>
                <button
                  onClick={handleGeneralEnquiry}
                  className="mt-2 w-full py-2 rounded-xl bg-[#D4AF37] text-[#2A0C0E] font-bold text-xs hover:bg-[#F1DF96] transition-colors cursor-pointer"
                >
                  Reserve Consultation
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#FAF6F0]/60 gap-3">
            <div>© {new Date().getFullYear()} Art-BY-radhika. All Rights Reserved.</div>

            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Booking</span>
              <span>•</span>
              <span className="text-[#D4AF37]">Pure Sojat Herbal Certified</span>
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}

export default App;
