import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Tag, Film, User } from 'lucide-react';

export const BottomNavbar = () => {
  const location = useLocation();

  const navItems = [
    { id: 'home', path: '/', label: 'Home', icon: Home },
    { id: 'designs', path: '/designs', label: 'Designs', icon: Sparkles },
    { id: 'pricing', path: '/pricing', label: 'Pricing', icon: Tag },
    { id: 'reels', path: '/reels', label: 'Reels', icon: Film, hasBadge: true },
    { id: 'profile', path: '/profile', label: 'Profile', icon: User },
  ];

  const isCurrentPath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#1A0D0E]/95 backdrop-blur-xl border-t border-[#D4AF37]/30 shadow-[0_-4px_25px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="w-full px-1 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isCurrentPath(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 cursor-pointer flex-1 ${
                isActive ? 'text-[#D4AF37]' : 'text-[#FAF6F0]/70 hover:text-[#FAF6F0]'
              }`}
            >
              {/* Active Indicator Glow Background */}
              {isActive && (
                <span className="absolute inset-x-1 inset-y-0.5 bg-[#D4AF37]/15 rounded-xl border border-[#D4AF37]/30 shadow-inner -z-10 animate-in fade-in zoom-in-95 duration-200" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'scale-100'
                  }`}
                />
                {item.hasBadge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#E25822] ring-2 ring-[#1A0D0E] animate-ping" />
                )}
                {item.hasBadge && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#E25822]" />
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 font-medium tracking-tight transition-all ${
                  isActive ? 'font-bold text-[#D4AF37]' : 'text-[#FAF6F0]/60'
                }`}
              >
                {item.label}
              </span>

              {/* Micro Underline Dot */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#D4AF37] mt-0.5 shadow-[0_0_8px_#D4AF37]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
