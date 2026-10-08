import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Crown, User, LogOut } from 'lucide-react';
import { logoutUser } from '../redux/slices/authSlice';
import { toast } from 'sonner';

export const Navbar = ({ onOpenEnquiry, favoritesCount, onOpenAuth }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4A151B] to-[#8A3324] flex items-center justify-center text-[#D4AF37] shadow-md border border-[#D4AF37]/50 group-hover:rotate-12 transition-transform duration-300">
              {/* Royal Mandala Icon */}
              <svg
                className="w-6 h-6 animate-spin-slow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="3" stroke="currentColor" fill="#D4AF37" fillOpacity="0.2" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" strokeOpacity="0.3" />
                <path d="M12 5v14M5 12h14M7 7l10 10M7 17L17 7" strokeOpacity="0.6" />
              </svg>
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
  );
};
