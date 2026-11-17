import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Crown, User, LogOut, X } from 'lucide-react';
import { logoutUser } from '../redux/slices/authSlice';
import { toast } from 'sonner';
import logo from '../../public/images/rp-dark-logo.png';

export const Navbar = ({ onOpenEnquiry, favoritesCount, onOpenAuth }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll & handle ESC key when logo modal is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLogoModalOpen(false);
    };
    if (isLogoModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLogoModalOpen]);

  const navItems = [
    { id: 'home', path: '/', label: 'Home' },
    { id: 'designs', path: '/designs', label: 'Designs' },
    { id: 'pricing', path: '/pricing', label: 'Pricing' },
    { id: 'reels', path: '/reels', label: 'Reels', badge: 'Live' },
    { id: 'profile', path: '/profile', label: isAuthenticated ? (user?.name ? `${user.name}` : 'My Profile') : 'Profile & Atelier' },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out successfully');
  };

  const isCurrentPath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass-royal py-2.5 shadow-md border-b border-[#D4AF37]/30'
            : 'bg-[#FAF6F0]/90 backdrop-blur-md py-3.5 border-b border-[#D4AF37]/15'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsLogoModalOpen(true);
                }}
                title="Click to view logo"
                className="w-13 h-13 sm:w-15 sm:h-15 rounded-full flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden border border-[#D4AF37]/40 p-0.5 bg-[#FAF6F0]"
              >
                {/* Royal Mandala Icon */}
                <img src={logo} alt="Art By Radhika Logo" className="w-full h-full object-cover rounded-full" />
              </div>

              <div>
                <span className="font-royal text-lg sm:text-2xl font-bold tracking-wider text-[#4A151B] flex items-center gap-1">
                  Art-BY-<span className="text-[#D4AF37] font-serif-elegant italic text-xl sm:text-2xl font-semibold">radhika</span>
                </span>
                <p className="text-[10px] text-[#8A3324] font-medium tracking-widest uppercase -mt-1 hidden sm:block">
                  Royal Bridal &amp; Organic Henna Art
                </p>
              </div>
            </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-[#F3ECE1]/70 p-1.5 rounded-full border border-[#D4AF37]/25 shadow-inner">
            {navItems.map((item) => {
              const isActive = isCurrentPath(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`relative px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#4A151B] text-[#FAF6F0] shadow-sm'
                      : 'text-[#4A151B]/80 hover:text-[#4A151B] hover:bg-[#FAF6F0]/80'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[10px] uppercase font-bold tracking-wider bg-[#D4AF37] text-[#2A0C0E] rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {favoritesCount > 0 && (
              <Link
                to="/profile"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#8A3324]/10 text-[#8A3324] hover:bg-[#8A3324]/20 transition-colors cursor-pointer"
                title="View Saved Designs"
              >
                <Heart className="w-3.5 h-3.5 fill-[#8A3324]" />
                <span>{favoritesCount}</span>
              </Link>
            )}

            {/* User Account Button */}
            {isAuthenticated && user ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#4A151B]/10 to-[#8A3324]/15 border border-[#D4AF37]/50 text-[#4A151B] hover:bg-[#4A151B] hover:text-white transition-all text-xs font-bold cursor-pointer group"
                title="My Profile"
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name || 'Bride'}
                    className="w-5 h-5 rounded-full object-cover border border-[#D4AF37]"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#4A151B] group-hover:bg-[#D4AF37] text-[#D4AF37] group-hover:text-[#4A151B] flex items-center justify-center text-[10px] font-bold transition-colors">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'B'}
                  </div>
                )}
                <span className="max-w-[110px] truncate">{user.name || 'Bride'}</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                  else navigate('/profile');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6F0] border border-[#D4AF37]/50 text-[#4A151B] hover:bg-[#4A151B] hover:text-[#D4AF37] transition-all text-xs font-bold cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#8A3324]" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={onOpenEnquiry}
              className="px-4 py-2 rounded-full text-xs lg:text-sm font-semibold tracking-wide bg-gradient-to-r from-[#4A151B] to-[#7E2730] text-[#FFFDF9] shadow-md hover:shadow-lg hover:from-[#611C23] hover:to-[#8A3324] border border-[#D4AF37]/40 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              <span>Book Bridal Slot</span>
            </button>
          </div>

          {/* Mobile Right Quick Action (Only Book Button, No Hamburger) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenEnquiry}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#4A151B] to-[#8A3324] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Book Slot</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Enlarged Logo Modal */}
    {isLogoModalOpen && (
      <div
        role="dialog"
        aria-modal="true"
        onClick={() => setIsLogoModalOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative flex flex-col items-center max-w-[90vw] max-h-[90vh]"
        >
          {/* Top Close Button */}
          <button
            type="button"
            onClick={() => setIsLogoModalOpen(false)}
            className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all duration-200 shadow-lg cursor-pointer flex items-center justify-center border border-white/30 active:scale-95"
            aria-label="Close Logo Modal"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Logo Image View */}
          <div className="rounded-3xl p-3 sm:p-6 bg-[#FAF6F0] border-2 border-[#D4AF37]/60 shadow-2xl overflow-hidden flex items-center justify-center">
            <img
              src={logo}
              alt="Art By Radhika Full Logo"
              className="w-auto h-auto max-w-[80vw] max-h-[70vh] sm:max-w-md sm:max-h-[75vh] object-contain rounded-2xl drop-shadow-md select-none"
            />
          </div>
        </div>
      </div>
    )}
  </>
  );
};
